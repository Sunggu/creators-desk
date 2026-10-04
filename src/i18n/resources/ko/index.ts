import { appKo } from './app';
import { commonKo } from './common';
import { editorKo } from './editor';
import { errorKo } from './error';
import { licensesKo } from './licenses';
import { mobileKo } from './mobile';
import { panelKo } from './panel';
import { ribbonKo } from './ribbon';
import { settingsKo } from './settings';
import { sidebarKo } from './sidebar';
import { statusbarKo } from './statusbar';
import { tabKo } from './tab';
import { timeKo } from './time';
import { vaultKo } from './vault';

export {
  appKo,
  commonKo,
  editorKo,
  errorKo,
  licensesKo,
  mobileKo,
  panelKo,
  ribbonKo,
  settingsKo,
  sidebarKo,
  statusbarKo,
  tabKo,
  timeKo,
  vaultKo,
};

/**
 * The baseline bundle. Adding a namespace here forces every other locale to
 * supply it (each locale object is checked with `satisfies typeof koResources`).
 *
 * Split across one file per namespace to respect the 200-line limit (Rule 1).
 */
export const koResources = {
  app: appKo,
  common: commonKo,
  editor: editorKo,
  error: errorKo,
  licenses: licensesKo,
  mobile: mobileKo,
  panel: panelKo,
  ribbon: ribbonKo,
  settings: settingsKo,
  sidebar: sidebarKo,
  statusbar: statusbarKo,
  tab: tabKo,
  time: timeKo,
  vault: vaultKo,
};