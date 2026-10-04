import type { LocaleBundleShape } from '../../locale-bundle-shape.dto';
import { licensesKo } from '../ko/licenses';

/**
 * BASELINE BUNDLE - English. Must satisfy the Korean baseline key-for-key.
 */
export const licensesEn = {
  intro:
    'uses the open source software listed below. The copyright notice and licence text for each library are listed in the open source notice, available identically from the built /notice.html page and from THIRD-PARTY-NOTICES.txt in the repository.',
  productHeading: 'Product licence',
  productLabel: 'Product',
  licenseLabel: 'Licence',
  copyrightLabel: 'Copyright',
  copyright: '© {{year}} {{holder}}',
  licenseFileLabel: 'Licence text',
  licenseFileHint: 'the LICENSE file at the repository root',
  sourceOfferHeading: 'Source code offer ({{license}} section 13)',
  sourceOfferNetworkBody:
    'This product is software offered over a network. Even when you modify and run it over a remote network, you can obtain the corresponding source code from the link below on the same terms.',
  sourceOfferBundleBody:
    'You are also free to obtain the complete source code as a whole, keeping the LICENSE file (the licence text) alongside it.',
  aboutHeading: 'About this notice',
  aboutScope:
    'The notice covers the packages shipped together with the browser bundle, the server bundle and the production image.',
  aboutGenerated:
    'The notice is generated automatically whenever a library is added or removed, so the list and the licence texts always agree.',
  aboutContact: 'For licence changes or commercial use enquiries, please contact us below.',
  contactLabel: 'Enquiries',
  openNoticePage: '📜 View the full open source notice',
} satisfies LocaleBundleShape<typeof licensesKo>;