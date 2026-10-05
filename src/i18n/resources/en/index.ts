import { appEn } from './app';
import { commonEn } from './common';
import { editorEn } from './editor';
import { errorEn } from './error';
import { licensesEn } from './licenses';
import { mobileEn } from './mobile';
import { panelEn } from './panel';
import { pluginsEn } from './plugins';
import { ribbonEn } from './ribbon';
import { settingsEn } from './settings';
import { sidebarEn } from './sidebar';
import { statusbarEn } from './statusbar';
import { tabEn } from './tab';
import { timeEn } from './time';
import { vaultEn } from './vault';
import type { TranslationBundle } from '../../translator.dto';
import { koResources } from '../ko';

/**
 * The English bundle.
 *
 * Each individual namespace bundle satisfies LocaleBundleShape against its
 * Korean counterpart, and the table as a whole covers every namespace in koResources.
 */
export const enResources = {
  app: appEn,
  common: commonEn,
  editor: editorEn,
  error: errorEn,
  licenses: licensesEn,
  mobile: mobileEn,
  panel: panelEn,
  plugins: pluginsEn,
  ribbon: ribbonEn,
  settings: settingsEn,
  sidebar: sidebarEn,
  statusbar: statusbarEn,
  tab: tabEn,
  time: timeEn,
  vault: vaultEn,
} satisfies Record<keyof typeof koResources, TranslationBundle>;