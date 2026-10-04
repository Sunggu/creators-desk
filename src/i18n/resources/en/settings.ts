import type { LocaleBundleShape } from '../../locale-bundle-shape.dto';
import type { settingsKo } from '../ko/settings';

/** BASELINE BUNDLE - English. Must satisfy the Korean baseline key-for-key. */
export const settingsEn = {
  title: 'Settings & licenses',
  closeTitle: 'Close (Esc)',
  tabLicenses: '📜 Open source notice',
  tabProject: '📁 Project (Vault) settings',
  tabPreferences: '⚙️ Editor preferences',
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
  autoSaveDescription: 'Saves automatically after you stop typing',
  languageHeading: 'Language and time zone',
  languageName: 'Interface language',
  languageDescription: 'Choose the language used for interface text',
  timeZoneName: 'Time zone',
  timeZoneDescription: 'Stored timestamps (epoch milliseconds) are displayed in this zone',
  timeZoneAuto: 'Automatic system time zone ({{zone}})',
  localeKorean: '한국어',
  localeEnglish: 'English',
  previewHeading: 'Date display preview',
  previewNow: 'Current time: {{value}}',
  previewEpoch: 'Stored value (epoch ms): {{value}}',
  previewNote:
    'Stored values are time-zone independent epoch milliseconds and are only converted to the selected zone at render time.',
} satisfies LocaleBundleShape<typeof settingsKo>;