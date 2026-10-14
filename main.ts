import { App, FuzzySuggestModal, Modal, Notice, Plugin, PluginSettingTab, Setting, editorInfoField, getIcon } from 'obsidian';
import type { Editor, FileManager, SettingDefinitionItem, TFile } from 'obsidian';
import { Prec, StateEffect, StateField } from '@codemirror/state';
import type { Extension } from '@codemirror/state';
import { EditorView, ViewPlugin, keymap } from '@codemirror/view';
import type { EditorState } from '@codemirror/state';
import type { ViewUpdate } from '@codemirror/view';

import { protectedRegionAt } from './src/context.ts';
import { changesBetween, typographize } from './src/apply.ts';
import type { TextChange } from './src/apply.ts';
import { curlComposedQuotes } from './src/compose.ts';
import { revertFor } from './src/revert.ts';
import { NOTE_PROPERTY, folderList, inFolder, isOff, noteIsOff, setNoteOff, setNoteProperty } from './src/scope.ts';
import { LANG_PROPERTY, QUOTES_PROPERTY, folderQuotesFor, settingsForNote } from './src/quotes.ts';
import type { LastSubstitution } from './src/revert.ts';
import { cannotCapitalize, mightSubstitute, substitutionFor } from './src/substitute.ts';
import { STYLE_PRESETS, applyStylePreset, shouldPromptForPreset } from './src/presets.ts';
import type { StylePreset } from './src/presets.ts';
import { tabOutTarget } from './src/tabout.ts';
import { wrapFor } from './src/wrap.ts';
import { DEFAULT_SETTINGS, QUOTE_CONVENTIONS } from './src/settings.ts';
import { PRESETS, addPreset, customRulesFor } from './src/custom.ts';
import type { Preset } from './src/custom.ts';
import type { QuoteStyleId, SmartTypographySettings } from './src/settings.ts';
import { conventionFor } from './src/settings.ts';
import { t } from './src/i18n.ts';

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
  private showPresetPrompt = false;

  async onload() {
    await this.loadSettings();

    this.addSettingTab(new SmartTypographySettingTab(this.app, this));
    this.registerEditorExtension(this.editorExtension());

    // First run only: offer the style presets once. The flag is saved the
    // moment the prompt opens, so closing it any way counts as an answer.
    if (this.showPresetPrompt) {
      this.showPresetPrompt = false;
      this.settings.presetPrompted = true;
      this.app.workspace.onLayoutReady(() => {
        new PresetModal(this.app, this).open();
        void this.saveSettings();
      });
    }

    this.addCommand({
      id: 'toggle-note',
      name: t('command.toggleNote'),
      icon: 'toggle-right',
      editorCallback: async (editor, ctx) => {
        const text = editor.getValue();
        const off = !noteIsOff(text);
        // processFrontMatter (1.4.4) is the only edit Live Preview lets
        // remove a property with; an editor change that deletes inside the
        // front matter is dropped there. Older apps get the text edit.
        // Looked up through a loose type so the review's API-version check
        // accepts the fallback below for apps older than 1.4.4.
        const fileManager = this.app.fileManager as { processFrontMatter?: FileManager['processFrontMatter'] };
        if (ctx.file && typeof fileManager.processFrontMatter === 'function') {
          await fileManager.processFrontMatter(ctx.file, (frontmatter: Record<string, unknown>) => {
            if (off) frontmatter[NOTE_PROPERTY] = 'off';
            else delete frontmatter[NOTE_PROPERTY];
          });
        } else {
          const edit = setNoteOff(text, off);
          if (edit) {
            editor.transaction({
              changes: [{ from: editor.offsetToPos(edit.from), to: editor.offsetToPos(edit.to), text: edit.insert }],
            });
          }
        }
        const folder = ctx.file && inFolder(ctx.file.path, folderList(this.settings.excludedFolders));
        new Notice(
          off
            ? t('notice.substitutionsOff')
            : folder
              ? t('notice.removedButExcluded')
              : t('notice.substitutionsOn'),
        );
      },
    });

    this.addCommand({
      id: 'set-quotes',
      name: t('command.setQuotes'),
      icon: 'quote',
      editorCallback: (editor, ctx) => {
        const file = ctx.file;
        if (!file) return;
        new QuotesModal(this.app, (choice) => void this.writeNoteQuotes(editor, file, choice)).open();
      },
    });

    this.addCommand({
      id: 'apply-to-text',
      name: t('command.applyToText'),
      icon: iconOr('wand-sparkles', 'wand-2'),
      editorCallback: (editor, ctx) => {
        const text = editor.getValue();
        const ranges = editor.somethingSelected()
          ? editor.listSelections().map((s) => {
              const a = editor.posToOffset(s.anchor);
              const b = editor.posToOffset(s.head);
              return [Math.min(a, b), Math.max(a, b)];
            })
          : [[0, text.length]];
        const changes: TextChange[] = [];
        const settings = this.settingsFor(ctx.file);
        for (const [from, to] of ranges) {
          const original = text.slice(from, to);
          const result = typographize(original, settings, text.slice(0, from));
          changes.push(...changesBetween(original, result, from));
        }
        if (changes.length === 0) {
          new Notice(t('notice.nothingToChange'));
          return;
        }
        // One transaction, so a single undo puts everything back.
        editor.transaction({
          changes: changes.map((c) => ({ from: editor.offsetToPos(c.from), to: editor.offsetToPos(c.to), text: c.insert })),
        });
        new Notice(changes.length === 1 ? t('notice.changedLines.one') : t('notice.changedLines.other', { count: changes.length }));
      },
    });
  }

  /** Writes (or, for null, removes) the note's `typography-quotes` property. */
  private async writeNoteQuotes(
    editor: Editor,
    file: TFile,
    choice: QuoteStyleId | null,
  ): Promise<void> {
    // Same pattern as the on/off command: processFrontMatter where the app
    // has it (1.4.4), a text edit of the front matter on older apps.
    const fileManager = this.app.fileManager as { processFrontMatter?: FileManager['processFrontMatter'] };
    if (typeof fileManager.processFrontMatter === 'function') {
      await fileManager.processFrontMatter(file, (frontmatter: Record<string, unknown>) => {
        if (choice === null) delete frontmatter[QUOTES_PROPERTY];
        else frontmatter[QUOTES_PROPERTY] = choice;
      });
    } else {
      const edit = setNoteProperty(editor.getValue(), QUOTES_PROPERTY, choice);
      if (edit) {
        editor.transaction({
          changes: [{ from: editor.offsetToPos(edit.from), to: editor.offsetToPos(edit.to), text: edit.insert }],
        });
      }
    }
    const style = settingsForNote({ path: file.path, quotes: choice, lang: undefined }, this.settings);
    const convention = conventionFor(style.quoteStyle);
    new Notice(
      choice === null
        ? t('notice.quotesFollowFolder')
        : convention
          ? t('notice.quotesSet', { style: convention.label })
          : t('notice.quotesStraight'),
    );
  }

  /**
   * The settings for one note: the global ones with the quotation marks
   * its property, language or folder asks for. The properties are read from
   * the metadata cache, a lookup, like the `typography` property.
   */
  private settingsFor(file: TFile | null | undefined): SmartTypographySettings {
    const settings = this.settings;
    if (!file) return settings;
    const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter;
    return settingsForNote(
      { path: file.path, quotes: frontmatter?.[QUOTES_PROPERTY], lang: frontmatter?.[LANG_PROPERTY] },
      settings,
    );
  }

  /** `settingsFor` for the note in an editor. */
  private settingsForState(state: EditorState): SmartTypographySettings {
    return this.settingsFor(state.field(editorInfoField, false)?.file);
  }

  /**
   * Whether the note in this editor is one the substitutions keep out of:
   * it is in an excluded folder, or its `typography` property is `off`.
   * The property is read from the metadata cache, which is a lookup, and
   * this only runs for the few characters a rule reacts to.
   */
  private leftAlone(state: EditorState): boolean {
    const file = state.field(editorInfoField, false)?.file;
    if (!file) return false;
    if (this.settings.excludedFolders && inFolder(file.path, folderList(this.settings.excludedFolders))) return true;
    const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter;
    return isOff(frontmatter?.[NOTE_PROPERTY]);
  }

  async loadSettings() {
    // `loadData()` is typed `any`, and whatever is on disk was written by
    // some earlier version of this plugin, so it is read as `unknown` and
    // narrowed before it is merged over the defaults.
    const stored = (await this.loadData()) as Partial<SmartTypographySettings> | null;
    // No data.json at all means a first run. Anyone who has one, even from
    // before presets existed, already has settings and is never asked.
    this.showPresetPrompt = shouldPromptForPreset(stored);
    this.settings = { ...DEFAULT_SETTINGS, ...stored };
    if (!this.showPresetPrompt) this.settings.presetPrompted = true;
    if (typeof this.settings.customRules !== 'string') this.settings.customRules = '';
  }

  /** Applies a style preset and saves; used by the first-run prompt and the settings tab. */
  async applyStylePreset(preset: StylePreset): Promise<void> {
    this.settings = applyStylePreset(this.settings, preset);
    await this.saveSettings();
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
        keymap.of([
          { key: 'Backspace', run: (view) => this.handleBackspace(view) },
          { key: 'Tab', run: (view) => this.handleTab(view) },
        ]),
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
    const settings = (state: EditorState) => this.settingsForState(state);
    const leftAlone = (state: EditorState) => this.leftAlone(state);

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
          if (state.readOnly || from >= to || leftAlone(state)) return;

          const composed = state.doc.sliceString(from, to);
          if (!composed.includes('"') && !composed.includes("'")) return;

          const changes = curlComposedQuotes(
            state.doc.sliceString(0, Math.min(state.doc.length, to + LOOKAHEAD)),
            from,
            to,
            settings(state),
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
    // With the CodeMirror in Obsidian 1.3, `composing` is still false at a
    // composition's first keystroke, when `compositionStarted` is already true.
    if (view.composing || view.compositionStarted) return false;
    if (view.state.readOnly) return false;

    // Typing a quote over a selection wraps it.
    if (from !== to && text.length === 1) return this.handleWrap(view, from, to, text);

    // Only a plain single character typed at a collapsed cursor. A
    // replacement of selected text has no keystroke history to work from.
    if (from !== to || text.length !== 1) return false;

    // Nearly every keystroke is a letter or a space, which no rule reacts
    // to. Those leave before the note is copied for the engine below.
    if (!mightSubstitute(text, this.settings)) return false;
    // A letter can only be capitalised at the start of a sentence, which the
    // cursor's own line decides; most letters leave here without a copy of
    // the note.
    if (this.settings.capitalizeSentences) {
      const line = view.state.doc.lineAt(from);
      if (cannotCapitalize(text, line.text.slice(0, from - line.from), this.settings)) return false;
    }
    if (this.leftAlone(view.state)) return false;

    // The engine is given the document up to the cursor because the
    // protected-region scan has to know whether a code fence is open
    // further up the note. That is a string copy per keystroke, which is
    // nothing next to the render CodeMirror does for the same keystroke.
    const { state } = view;
    const action = substitutionFor(
      state.doc.sliceString(0, from),
      state.doc.sliceString(from, Math.min(from + LOOKAHEAD, state.doc.length)),
      text,
      this.settingsForState(state),
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

  private handleWrap(view: EditorView, from: number, to: number, text: string): boolean {
    const { state } = view;
    // Only text the user selected: during an input method's composition the
    // replaced range is the half-finished text, not a selection.
    const main = state.selection.main;
    if (state.selection.ranges.length !== 1 || main.from !== from || main.to !== to) return false;
    if (view.compositionStarted || view.composing) return false;
    if (!this.settings.wrapSelection || this.leftAlone(state)) return false;
    const wrap = wrapFor(text, this.settingsForState(state));
    if (wrap === null) return false;
    // Not inside code, math, a link target or front matter: there a quote is
    // just a quote, and the default replace-the-selection behaviour stays.
    if (protectedRegionAt(state.doc.sliceString(0, from)) !== null) return false;
    if (protectedRegionAt(state.doc.sliceString(0, to)) !== null) return false;

    // One transaction, so one undo takes the quotes off again. The text stays
    // selected, so typing another quote nests another pair.
    view.dispatch({
      changes: [
        { from, insert: wrap.open },
        { from: to, insert: wrap.close },
      ],
      selection: { anchor: from + wrap.open.length, head: to + wrap.open.length },
      userEvent: 'input.type',
    });
    return true;
  }

  private handleTab(view: EditorView): boolean {
    const { state } = view;
    if (!this.settings.tabOut || state.readOnly || view.composing) return false;
    const selection = state.selection;
    if (selection.ranges.length !== 1 || !selection.main.empty) return false;
    const head = selection.main.head;
    const line = state.doc.lineAt(head);
    // Cheap exit before copying the note: Tab at a non-closer is the usual case.
    if (head === line.to) return false;
    if (this.leftAlone(state)) return false;
    const target = tabOutTarget(
      state.doc.sliceString(0, head),
      state.doc.sliceString(head, line.to),
      this.settingsForState(state),
    );
    if (target === null) return false;
    view.dispatch({ selection: { anchor: target }, userEvent: 'move.character', scrollIntoView: true });
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
  const options: Record<string, string> = { off: t('convention.off') };
  for (const convention of QUOTE_CONVENTIONS) options[convention.id] = convention.label;
  return options;
}

/** Which settings have a name and a description of their own in the locale files. */
type TextKey = Exclude<keyof SmartTypographySettings, 'presetPrompted'>;

/**
 * Each setting's name and description, written once. The declarative
 * definitions below and the `display()` fallback both read from here, so the
 * two renderings cannot drift apart. Read when the tab is drawn, not at load.
 */
function settingText(key: TextKey): { name: string; desc: string } {
  return { name: t(`setting.${key}.name`), desc: t(`setting.${key}.desc`) };
}

/** The row under the custom rules that says which lines are not used. */
const customStatusText = () => ({ name: t('setting.rulesStatus.name') });

/** The row under the quotes per folder that says which lines are not used. */
const folderStatusText = () => ({ name: t('setting.folderStatus.name') });

/** The row with the preset buttons. */
const presetText = () => ({ name: t('setting.rulePreset.name'), desc: t('setting.rulePreset.desc') });

/** The note under the settings, explaining where the plugin keeps out. */
const keepsOutNote = () => ({ name: t('setting.keepsOut.name'), desc: t('setting.keepsOut.desc') });

/** The toggles, in the order they are shown. */
const TOGGLE_KEYS = [
  'smartApostrophes',
  'skipClosingQuote',
  'dashes',
  'ellipsis',
  'arrows',
  'mathSymbols',
  'capitalizeSentences',
  'tabOut',
  'wrapSelection',
  'useLangProperty',
] as const;

/** The row with the style preset buttons. */
const stylePresetText = () => ({ name: t('setting.stylePreset.name'), desc: t('setting.stylePreset.desc') });

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
        ...settingText('quoteStyle'),
        control: {
          type: 'dropdown',
          key: 'quoteStyle',
          options: quoteStyleOptions(),
          defaultValue: DEFAULT_SETTINGS.quoteStyle,
        },
      },
      {
        ...stylePresetText(),
        searchable: true,
        render: (setting: Setting) => this.stylePresetButtons(setting),
      },
      ...TOGGLE_KEYS.map((key) => ({
        ...settingText(key),
        control: {
          type: 'toggle' as const,
          key,
          defaultValue: DEFAULT_SETTINGS[key],
        },
      })),
      {
        ...settingText('excludedFolders'),
        control: {
          type: 'textarea' as const,
          key: 'excludedFolders',
          placeholder: 'Code\nTemplates',
          rows: 3,
          defaultValue: DEFAULT_SETTINGS.excludedFolders,
        },
      },
      {
        ...settingText('quotesByFolder'),
        control: {
          type: 'textarea' as const,
          key: 'quotesByFolder',
          placeholder: 'Deutsch -> german\nFrance/Notes -> french',
          rows: 3,
          defaultValue: DEFAULT_SETTINGS.quotesByFolder,
        },
      },
      {
        ...folderStatusText(),
        searchable: false,
        render: (setting: Setting) => {
          this.folderStatusEl = setting.descEl;
          this.showFolderStatus();
          return () => {
            this.folderStatusEl = null;
          };
        },
      },
      {
        ...settingText('customRules'),
        control: {
          type: 'textarea' as const,
          key: 'customRules',
          placeholder: ':check: -> ✓',
          rows: 4,
          defaultValue: DEFAULT_SETTINGS.customRules,
        },
      },
      {
        ...customStatusText(),
        searchable: false,
        render: (setting: Setting) => {
          this.statusEl = setting.descEl;
          this.showStatus();
          return () => {
            this.statusEl = null;
          };
        },
      },
      {
        ...presetText(),
        render: (setting: Setting) => this.presetButtons(setting),
      },
      // No control: a row that is only an explanation, which also puts the
      // sentence in the settings search.
      keepsOutNote(),
    ];
  }

  /** Where the custom rules' status is written, while the tab is open. */
  private statusEl: HTMLElement | null = null;

  private folderStatusEl: HTMLElement | null = null;

  /** Says how many folder lines are in use and which are ignored, and why. */
  private showFolderStatus(): void {
    const el = this.folderStatusEl;
    if (!el) return;
    el.empty();
    const { folders, ignored } = folderQuotesFor(this.plugin.settings.quotesByFolder);
    el.createDiv({
      text:
        folders.length === 0
          ? t('status.noFolders')
          : folders.length === 1
            ? t('status.folders.one')
            : t('status.folders.other', { count: folders.length }),
    });
    for (const item of ignored) {
      el.createDiv({
        cls: 'mod-warning',
        text: t('status.ignored', { line: item.line, text: item.text.trim(), reason: item.reason }),
      });
    }
  }

  /** Set once Obsidian has drawn the tab through `display()`, which it does only before 1.13. */
  private legacy = false;

  /** Says how many custom rules are in use and which lines are ignored, and why. */
  private showStatus(): void {
    const el = this.statusEl;
    if (!el) return;
    el.empty();
    const { rules, ignored } = customRulesFor(this.plugin.settings.customRules);
    el.createDiv({
      text:
        rules.length === 0
          ? t('status.noRules')
          : rules.length === 1
            ? t('status.rules.one')
            : t('status.rules.other', { count: rules.length }),
    });
    for (const item of ignored) {
      el.createDiv({
        cls: 'mod-warning',
        text: t('status.ignored', { line: item.line, text: item.text.trim(), reason: item.reason }),
      });
    }
  }

  private stylePresetButtons(setting: Setting): void {
    for (const preset of STYLE_PRESETS) {
      setting.addButton((button) =>
        button.setButtonText(preset.label).onClick(() => void this.applyStyle(preset)),
      );
    }
  }

  private async applyStyle(preset: StylePreset): Promise<void> {
    await this.plugin.applyStylePreset(preset);
    new Notice(t('notice.presetApplied', { preset: preset.label }));
    if (this.legacy) {
      this.display();
      return;
    }
    const tab = this as unknown as { update?: () => void };
    tab.update?.();
  }

  private presetButtons(setting: Setting): void {
    for (const preset of PRESETS) {
      setting.addButton((button) =>
        button.setButtonText(preset.label).onClick(() => void this.addPreset(preset)),
      );
    }
  }

  private async addPreset(preset: Preset): Promise<void> {
    const { setting, added } = addPreset(this.plugin.settings.customRules, preset);
    if (added === 0) {
      new Notice(t('notice.presetRulesPresent'));
      return;
    }
    this.plugin.settings.customRules = setting;
    await this.plugin.saveSettings();
    new Notice(added === 1 ? t('notice.rulesAdded.one') : t('notice.rulesAdded.other', { count: added }));
    // Draws the tab again so the text area shows the new lines.
    if (this.legacy) {
      this.display();
      return;
    }
    // Obsidian 1.13's re-render of the declarative definitions. Looked up
    // rather than called directly, because older versions do not have it.
    const tab = this as unknown as { update?: () => void };
    tab.update?.();
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
    if (key === 'customRules') this.showStatus();
    if (key === 'quotesByFolder') this.showFolderStatus();
  }

  /**
   * The pre-1.13 rendering. Obsidian skips this entirely once
   * `getSettingDefinitions()` returns anything, so it is dead code on a
   * current app and only runs for users below the 1.13 line.
   */
  display(): void {
    this.legacy = true;
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName(settingText('quoteStyle').name)
      .setDesc(settingText('quoteStyle').desc)
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

    this.stylePresetButtons(
      new Setting(containerEl).setName(stylePresetText().name).setDesc(stylePresetText().desc),
    );

    for (const key of TOGGLE_KEYS) this.addToggle(key);

    new Setting(containerEl)
      .setName(settingText('excludedFolders').name)
      .setDesc(settingText('excludedFolders').desc)
      .addTextArea((area) => {
        area.setPlaceholder('Code\nTemplates').setValue(this.plugin.settings.excludedFolders);
        area.onChange(async (value) => {
          this.plugin.settings.excludedFolders = value;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName(settingText('quotesByFolder').name)
      .setDesc(settingText('quotesByFolder').desc)
      .addTextArea((area) => {
        area.setValue(this.plugin.settings.quotesByFolder);
        area.onChange(async (value) => {
          this.plugin.settings.quotesByFolder = value;
          await this.plugin.saveSettings();
          this.showFolderStatus();
        });
      });

    const folderStatus = new Setting(containerEl).setName(folderStatusText().name);
    this.folderStatusEl = folderStatus.descEl;
    this.showFolderStatus();

    new Setting(containerEl)
      .setName(settingText('customRules').name)
      .setDesc(settingText('customRules').desc)
      .addTextArea((area) => {
        area.setPlaceholder(':check: -> ✓').setValue(this.plugin.settings.customRules);
        area.onChange(async (value) => {
          this.plugin.settings.customRules = value;
          await this.plugin.saveSettings();
          this.showStatus();
        });
      });

    const status = new Setting(containerEl).setName(customStatusText().name);
    this.statusEl = status.descEl;
    this.showStatus();

    this.presetButtons(new Setting(containerEl).setName(presetText().name).setDesc(presetText().desc));

    containerEl.createEl('p', {
      text: `${keepsOutNote().name}. ${keepsOutNote().desc}`,
      cls: 'setting-item-description',
    });
  }

  private addToggle(key: (typeof TOGGLE_KEYS)[number]): void {
    new Setting(this.containerEl)
      .setName(settingText(key).name)
      .setDesc(settingText(key).desc)
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.settings[key]);
        toggle.onChange(async (value) => {
          this.plugin.settings[key] = value;
          await this.plugin.saveSettings();
        });
      });
  }
}

/** The one-time prompt on a first run: pick a style preset or keep the defaults. */
class PresetModal extends Modal {
  constructor(app: App, private plugin: SmartTypographyPlugin) {
    super(app);
  }

  onOpen(): void {
    const { contentEl } = this;
    this.setTitle(t('modal.preset.title'));
    contentEl.createEl('p', {
      text: t('modal.preset.intro'),
    });
    for (const preset of STYLE_PRESETS) {
      new Setting(contentEl)
        .setName(preset.label)
        .setDesc(preset.desc)
        .addButton((button) =>
          button
            .setButtonText(preset.id === 'default' ? t('modal.preset.keepDefault') : t('modal.preset.use', { preset: preset.label }))
            .onClick(() => {
              void this.plugin.applyStylePreset(preset);
              this.close();
            }),
        );
    }
  }

  onClose(): void {
    this.contentEl.empty();
  }
}

/** What the picker offers: a convention, or null to remove the property. */
interface QuotesChoice {
  label: string;
  value: QuoteStyleId | null;
}

/** The picker behind "Set quotation marks for this note…". */
class QuotesModal extends FuzzySuggestModal<QuotesChoice> {
  constructor(
    app: App,
    private onChoose: (choice: QuoteStyleId | null) => void,
  ) {
    super(app);
    this.setPlaceholder(t('modal.quotes.placeholder'));
  }

  getItems(): QuotesChoice[] {
    return [
      { label: t('modal.quotes.follow'), value: null },
      ...QUOTE_CONVENTIONS.map((c) => ({ label: c.label, value: c.id })),
      { label: t('modal.quotes.straight'), value: 'off' as const },
    ];
  }

  getItemText(item: QuotesChoice): string {
    return item.label;
  }

  onChooseItem(item: QuotesChoice): void {
    this.onChoose(item.value);
  }
}

/**
 * `name`, or `older` when this Obsidian's icon set does not have it yet: an
 * icon newer than the app draws nothing, on the mobile toolbar for one.
 */
function iconOr(name: string, older: string): string {
  return getIcon(name) ? name : older;
}
