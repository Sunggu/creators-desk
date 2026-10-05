import type { LocaleBundleShape } from '../../locale-bundle-shape.dto';
import type { pluginsKo } from '../ko/plugins';

/** BASELINE BUNDLE - English. Must satisfy the Korean baseline key-for-key. */
export const pluginsEn = {
  architectureHeading: 'Plugin-based extension architecture',
  architectureBody:
    'Creators Desk is designed so that, through a plugin architecture, file formats and writing tools beyond markdown can be added freely to the editor window.',
  formatsHeading: 'Supported file formats',
  statusBuiltIn: 'Built in',
  statusPlanned: 'Planned',
  format_md_name: 'Markdown editor',
  format_md_desc: 'WYSIWYG live preview and reading mode',
  format_txt_name: 'Plain text',
  format_txt_desc: 'Viewing plain notes and log files',
  format_json_name: 'Structured data',
  format_json_desc: 'Configuration and data schema editing',
  format_image_name: 'Image viewer',
  format_image_desc: 'Previewing graphics and media assets',
} satisfies LocaleBundleShape<typeof pluginsKo>;
