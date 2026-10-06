import type { LocaleBundleShape } from '../../locale-bundle-shape.dto';
import type { settingsKo } from '../ko/settings';

/** BASELINE BUNDLE - English. Must satisfy the Korean baseline key-for-key. */
export const settingsEn = {
  title: 'Settings',
  closeTitle: 'Close (Esc)',
  tabLicenses: 'Open source notices',
  tabProject: 'Project (Vault) settings',
  tabPreferences: 'Editor preferences',
  tabPlugins: 'Plugins',
  projectHeading: 'Active vault',
  aliasLabel: 'Project display name (alias)',
  immutableKey: 'Immutable storage key',
  uniqueId: 'Unique identifier',
  createdAt: 'Created',
  updatedAt: 'Last updated',
  preferencesHeading: 'Editor behaviour and theme',
  darkThemeName: 'Dark theme (Obsidian Minimal)',
  darkThemeDescription: 'A fixed, pure dark palette for deep focus',
  autoSaveName: 'Automatic save (auto-save)',
  autoSaveDescription: 'Saves automatically once you stop typing',
  languageHeading: 'Language and time zone',
  languageName: 'Interface language',
  languageDescription: 'Choose the language used for interface text',
  timeZoneName: 'Time zone',
  timeZoneDescription: 'Stored timestamps (epoch milliseconds) are displayed in this zone',
  localeKorean: '한국어',
  localeEnglish: 'English',
  previewHeading: 'Date display preview',
  previewNow: 'Current time: {{value}}',
  previewEpoch: 'Stored value (epoch ms): {{value}}',
  timeZoneAuto: 'Automatic (follow system, {{zone}})',
  previewNote:
    'Stored values are time-zone independent epoch milliseconds, converted to the selected zone only at render time.',
} satisfies LocaleBundleShape<typeof settingsKo>;