import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';
import type { SettingDefinitionItem } from 'obsidian';
import { Prec, StateEffect, StateField } from '@codemirror/state';
import type { Extension } from '@codemirror/state';
import { EditorView, ViewPlugin, keymap } from '@codemirror/view';
import type { ViewUpdate } from '@codemirror/view';

import { curlComposedQuotes } from './src/compose.ts';
import { revertFor } from './src/revert.ts';
import type { LastSubstitution } from './src/revert.ts';
import { mightSubstitute, substitutionFor } from './src/substitute.ts';
import { DEFAULT_SETTINGS, QUOTE_CONVENTIONS } from './src/settings.ts';
import type { QuoteStyleId, SmartTypographySettings } from './src/settings.ts';

/**
 * How much text after the cursor the engine is shown. Only the
 * skip-over-a-closing-quote rule looks ahead, and it never needs more
 * than a padding character and a quote.
 */
const LOOKAHEAD = 4;

/**
 * How often a finished composition is looked for when nothing else happens
 * in the editor. Some Android keyboards end a composition without a change
 * the editor would report.
 */
const COMPOSITION_POLL = 400;

/** Carries the record of a substitution into the state field below. */
const rememberSubstitution = StateEffect.define<LastSubstitution>();

/**
 * The substitution Backspace can undo, or null.
 *
 * Any transaction that is not the substitution itself clears it, which
 * includes a bare cursor move. That is the first of the two guards against
 * mgmeyers/obsidian-smart-typography#58; `revertFor` is the second.
 */
const lastSubstitution = StateField.define<LastSubstitution | null>({
  create: () => null,
  update(value, transaction) {
    for (const effect of transaction.effects) {
      if (effect.is(rememberSubstitution)) return effect.value;
    }
    return null;
  },
});

export default class SmartTypographyPlugin extends Plugin {
  settings: SmartTypographySettings = { ...DEFAULT_SETTINGS };

  async onload() {
    await this.loadSettings();

    this.addSettingTab(new SmartTypographySettingTab(this.app, this));
    this.registerEditorExtension(this.editorExtension());
  }

  async loadSettings() {
    // `loadData()` is typed `any`, and whatever is on disk was written by
    // some earlier version of this plugin, so it is read as `unknown` and
    // narrowed before it is merged over the defaults.
    const stored = (await this.loadData()) as Partial<SmartTypographySettings> | null;
    this.settings = { ...DEFAULT_SETTINGS, ...stored };
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  /**
   * The settings are read at keystroke time rather than baked into the
   * extension, so a change in the settings tab takes effect in open notes
   * without reconfiguring anything.
   */
  private editorExtension(): Extension {
    return [
      lastSubstitution,
      // Highest precedence, or Obsidian's "Auto-pair brackets" (on by
      // default) claims every `"` and `'` first and inserts a straight
      // pair, so no quotation mark is ever curled. Where this handler
      // declines, in code or a link target, auto-pairing still runs.
      Prec.highest(
        EditorView.inputHandler.of((view, from, to, text) => this.handleInput(view, from, to, text)),
      ),
      Prec.highest(
        keymap.of([{ key: 'Backspace', run: (view) => this.handleBackspace(view) }]),
      ),
      this.composedQuotes(),
    ];
  }

  /**
   * Curls the quotes in text that an input method composed, once the
   * composition is over. `src/compose.ts` says why it cannot happen as the
   * quote is typed.
   */
  private composedQuotes(): Extension {
    const settings = () => this.settings;

    return ViewPlugin.fromClass(
      class {
        /** Where the text composed since the last check is, or null. */
        private range: { from: number; to: number } | null = null;
        private timer: number | null = null;

        constructor(private readonly view: EditorView) {}

        update(update: ViewUpdate): void {
          for (const tr of update.transactions) {
            if (this.range && tr.docChanged) {
              this.range = {
                from: tr.changes.mapPos(this.range.from, -1),
                to: tr.changes.mapPos(this.range.to, 1),
              };
            }
            if (!tr.isUserEvent('input.type.compose')) continue;
            tr.changes.iterChangedRanges((_fromA, _toA, fromB, toB) => {
              this.range = this.range
                ? { from: Math.min(this.range.from, fromB), to: Math.max(this.range.to, toB) }
                : { from: fromB, to: toB };
            });
          }
          if (this.range) this.schedule(0);
        }

        destroy(): void {
          if (this.timer !== null) window.clearTimeout(this.timer);
        }

        private schedule(delay: number): void {
          if (this.timer !== null) window.clearTimeout(this.timer);
          // Never from inside `update`: the editor refuses a dispatch while
          // it is still applying one.
          this.timer = window.setTimeout(() => this.check(), delay);
        }

        private check(): void {
          this.timer = null;
          const { view } = this;
          if (!this.range) return;
          if (view.compositionStarted) {
            this.schedule(COMPOSITION_POLL);
            return;
          }

          const { state } = view;
          const from = Math.max(0, this.range.from);
          const to = Math.min(state.doc.length, this.range.to);
          this.range = null;
          if (state.readOnly || from >= to) return;

          const composed = state.doc.sliceString(from, to);
          if (!composed.includes('"') && !composed.includes("'")) return;

          const changes = curlComposedQuotes(
            state.doc.sliceString(0, Math.min(state.doc.length, to + LOOKAHEAD)),
            from,
            to,
            settings(),
          );
          if (changes.length > 0) view.dispatch({ changes, userEvent: 'input.type' });
        }
      },
    );
  }

  private handleInput(view: EditorView, from: number, to: number, text: string): boolean {
    // While an input method or a dead key is composing, the characters
    // arriving here are half-finished and the browser will revise them.
    // Rewriting them is what breaks dead-key quotes on GNOME
    // (mgmeyers/obsidian-smart-typography#63 and #44).
    if (view.composing) return false;
    if (view.state.readOnly) return false;

    // Only a plain single character typed at a collapsed cursor. A
    // replacement of selected text has no keystroke history to work from.
    if (from !== to || text.length !== 1) return false;

    // Nearly every keystroke is a letter or a space, which no rule reacts
    // to. Those leave before the note is copied for the engine below.
    if (!mightSubstitute(text)) return false;

    // The engine is given the document up to the cursor because the
    // protected-region scan has to know whether a code fence is open
    // further up the note. That is a string copy per keystroke, which is
    // nothing next to the render CodeMirror does for the same keystroke.
    const { state } = view;
    const action = substitutionFor(
      state.doc.sliceString(0, from),
      state.doc.sliceString(from, Math.min(from + LOOKAHEAD, state.doc.length)),
      text,
      this.settings,
    );
    if (action === null) return false;

    if (action.kind === 'skip') {
      view.dispatch({
        selection: { anchor: action.to },
        userEvent: 'move.character',
      });
      return true;
    }

    // One transaction for the typed character and the replacement
    // together, so the whole substitution is a single undo step.
    const cursor = action.from + action.insert.length;
    view.dispatch({
      changes: { from: action.from, to: action.to, insert: action.insert },
      selection: { anchor: cursor },
      userEvent: 'input.type',
      effects: rememberSubstitution.of({
        from: action.from,
        to: cursor,
        inserted: action.insert,
        literal: action.literal,
      }),
    });
    return true;
  }

  private handleBackspace(view: EditorView): boolean {
    const { state } = view;
    const selection = state.selection.main;
    const last = state.field(lastSubstitution, false) ?? null;

    const revert = revertFor(last, state.doc.toString(), selection.from, selection.to);
    if (revert === null) return false;

    view.dispatch({
      changes: { from: revert.from, to: revert.to, insert: revert.insert },
      selection: { anchor: revert.from + revert.insert.length },
      userEvent: 'delete.backward',
    });
    return true;
  }
}

/** The quote dropdown's options, off first. */
function quoteStyleOptions(): Record<string, string> {
  const options: Record<string, string> = { off: 'Leave straight quotes alone' };
  for (const convention of QUOTE_CONVENTIONS) options[convention.id] = convention.label;
  return options;
}

/**
 * Each setting's name and description, written once. The declarative
 * definitions below and the `display()` fallback both read from here, so the
 * two renderings cannot drift apart.
 */
const SETTING_TEXT: Record<keyof SmartTypographySettings, { name: string; desc: string }> = {
  quoteStyle: {
    name: 'Quotation marks',
    desc:
      'Which convention straight quotes are turned into. Apostrophes are ' +
      'the same character in every convention and are set separately.',
  },
  smartApostrophes: {
    name: 'Apostrophes',
    desc: "it's becomes it’s. Works whether or not quotation marks are set.",
  },
  skipClosingQuote: {
    name: 'Step over a closing quote',
    desc:
      'Typing a closing quote where one already sits moves the cursor past ' +
      'it instead of adding a second one.',
  },
  dashes: { name: 'Dashes', desc: '-- becomes – and --- becomes —.' },
  ellipsis: { name: 'Ellipsis', desc: '... becomes ….' },
  arrows: {
    name: 'Arrows',
    desc: '-> becomes →, <- becomes ←, <-> becomes ↔, => becomes ⇒.',
  },
  mathSymbols: {
    name: 'Mathematical symbols',
    desc: '>= becomes ≥, <= becomes ≤, != becomes ≠, +- becomes ±.',
  },
};

/** The note under the settings, explaining where the plugin keeps out. */
const KEEPS_OUT_NOTE = {
  name: 'Where nothing is substituted',
  desc:
    'Code blocks, inline code, formulas, link targets, frontmatter, HTML ' +
    'tags and comments, and Templater expressions are left exactly as typed. ' +
    'Backspace straight after a substitution puts back what you typed.',
};

/** The toggles, in the order they are shown. */
const TOGGLE_KEYS = [
  'smartApostrophes',
  'skipClosingQuote',
  'dashes',
  'ellipsis',
  'arrows',
  'mathSymbols',
] as const;

class SmartTypographySettingTab extends PluginSettingTab {
  constructor(app: App, private plugin: SmartTypographyPlugin) {
    super(app, plugin);
  }

  /**
   * The settings, described rather than drawn.
   *
   * Obsidian 1.13 and later renders this itself and, the reason for writing
   * it, indexes it so the settings turn up in the settings search. Older
   * versions know nothing about this method and fall back to `display()`.
   */
  getSettingDefinitions(): SettingDefinitionItem[] {
    return [
      {
        ...SETTING_TEXT.quoteStyle,
        control: {
          type: 'dropdown',
          key: 'quoteStyle',
          options: quoteStyleOptions(),
          defaultValue: DEFAULT_SETTINGS.quoteStyle,
        },
      },
      ...TOGGLE_KEYS.map((key) => ({
        ...SETTING_TEXT[key],
        control: {
          type: 'toggle' as const,
          key,
          defaultValue: DEFAULT_SETTINGS[key],
        },
      })),
      // No control: a row that is only an explanation, which also puts the
      // sentence in the settings search.
      KEEPS_OUT_NOTE,
    ];
  }

  /**
   * Persists a change made through a declarative control.
   *
   * The inherited version writes to `plugin.settings` too, but routing it
   * through `saveSettings()` keeps one path to disk for both renderings.
   */
  async setControlValue(key: string, value: unknown): Promise<void> {
    Object.assign(this.plugin.settings, { [key]: value });
    await this.plugin.saveSettings();
  }

  /**
   * The pre-1.13 rendering. Obsidian skips this entirely once
   * `getSettingDefinitions()` returns anything, so it is dead code on a
   * current app and only runs for users below the 1.13 line.
   */
  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName(SETTING_TEXT.quoteStyle.name)
      .setDesc(SETTING_TEXT.quoteStyle.desc)
      .addDropdown((dropdown) => {
        for (const [value, label] of Object.entries(quoteStyleOptions())) {
          dropdown.addOption(value, label);
        }
        dropdown.setValue(this.plugin.settings.quoteStyle);
        dropdown.onChange(async (value) => {
          this.plugin.settings.quoteStyle = value as QuoteStyleId;
          await this.plugin.saveSettings();
        });
      });

    for (const key of TOGGLE_KEYS) this.addToggle(key);

    containerEl.createEl('p', {
      text: `${KEEPS_OUT_NOTE.name}. ${KEEPS_OUT_NOTE.desc}`,
      cls: 'setting-item-description',
    });
  }

  private addToggle(key: (typeof TOGGLE_KEYS)[number]): void {
    new Setting(this.containerEl)
      .setName(SETTING_TEXT[key].name)
      .setDesc(SETTING_TEXT[key].desc)
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.settings[key]);
        toggle.onChange(async (value) => {
          this.plugin.settings[key] = value;
          await this.plugin.saveSettings();
        });
      });
  }
}
