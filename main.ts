import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { Prec, StateEffect, StateField } from '@codemirror/state';
import type { Extension } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';

import { revertFor } from './src/revert.ts';
import type { LastSubstitution } from './src/revert.ts';
import { substitutionFor } from './src/substitute.ts';
import { DEFAULT_SETTINGS, QUOTE_CONVENTIONS } from './src/settings.ts';
import type { QuoteStyleId, SmartTypographySettings } from './src/settings.ts';

/**
 * How much text after the cursor the engine is shown. Only the
 * skip-over-a-closing-quote rule looks ahead, and it never needs more
 * than a padding character and a quote.
 */
const LOOKAHEAD = 4;

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
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
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
      EditorView.inputHandler.of((view, from, to, text) => this.handleInput(view, from, to, text)),
      Prec.highest(
        keymap.of([{ key: 'Backspace', run: (view) => this.handleBackspace(view) }]),
      ),
    ];
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

class SmartTypographySettingTab extends PluginSettingTab {
  constructor(app: App, private plugin: SmartTypographyPlugin) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName('Quotation marks')
      .setDesc(
        'Which convention straight quotes are turned into. Apostrophes are ' +
          'the same character in every convention and are set separately.',
      )
      .addDropdown((dropdown) => {
        dropdown.addOption('off', 'Leave straight quotes alone');
        for (const convention of QUOTE_CONVENTIONS) {
          dropdown.addOption(convention.id, convention.label);
        }
        dropdown.setValue(this.plugin.settings.quoteStyle);
        dropdown.onChange(async (value) => {
          this.plugin.settings.quoteStyle = value as QuoteStyleId;
          await this.plugin.saveSettings();
        });
      });

    this.addToggle(
      'Apostrophes',
      "it's becomes it’s. Works whether or not quotation marks are set.",
      'smartApostrophes',
    );

    this.addToggle(
      'Step over a closing quote',
      'Typing a closing quote where one already sits moves the cursor past ' +
        'it instead of adding a second one.',
      'skipClosingQuote',
    );

    this.addToggle('Dashes', '-- becomes – and --- becomes —.', 'dashes');

    this.addToggle('Ellipsis', '... becomes ….', 'ellipsis');

    this.addToggle(
      'Arrows',
      '-> becomes →, <- becomes ←, <-> becomes ↔, => becomes ⇒.',
      'arrows',
    );

    this.addToggle(
      'Mathematical symbols',
      '>= becomes ≥, <= becomes ≤, != becomes ≠, +- becomes ±.',
      'mathSymbols',
    );

    containerEl.createEl('p', {
      text:
        'Nothing is substituted inside code blocks, inline code, formulas, ' +
        'link targets, frontmatter, HTML comments or Templater expressions. ' +
        'Backspace straight after a substitution puts back what you typed.',
      cls: 'setting-item-description',
    });
  }

  private addToggle(
    name: string,
    description: string,
    key: 'smartApostrophes' | 'skipClosingQuote' | 'dashes' | 'ellipsis' | 'arrows' | 'mathSymbols',
  ): void {
    new Setting(this.containerEl)
      .setName(name)
      .setDesc(description)
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.settings[key]);
        toggle.onChange(async (value) => {
          this.plugin.settings[key] = value;
          await this.plugin.saveSettings();
        });
      });
  }
}
