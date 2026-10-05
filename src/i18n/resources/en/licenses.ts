import type { LocaleBundleShape } from '../../locale-bundle-shape.dto';
import type { licensesKo } from '../ko/licenses';

/**
 * BASELINE BUNDLE - English. Must satisfy the Korean baseline key-for-key.
 *
 * See `ko/licenses.ts` for why this copy is legally constrained: AGPL-3.0 may
 * not be presented as a commercial-use guarantee, and the corresponding-source
 * obligation must be stated instead.
 */
export const licensesEn = {
  // Placeholder-free by design: see the Korean baseline.
  intro:
    'This software uses the open source libraries listed below. Copyright notices and full license texts for each library are recorded in the notices, and are also available from the built notices page and the Notices file in the repository.',
  copyright: '© {{year}} {{holder}}',
  aboutHeading: 'About these notices',
  aboutScope:
    '· The packages listed here are shipped with the browser and server bundles as well as the production image.',
  aboutGenerated:
    '· The notices are generated automatically whenever a library is added or removed, so the list and the full texts never diverge.',
  aboutContact: '· For questions about license changes or related matters, please get in touch below.',
  contactPrefix: 'Contact:',
  productLicenseHeading: 'Product license',
  productLabel: 'Product',
  licenseLabel: 'License',
  copyrightLabel: 'Copyright',
  licenseFileLabel: 'Full license',
  licenseFileValue: 'The LICENSE file at the repository root',
  viewFull: 'View the full notices',
  sourceOfferHeading: 'Source code availability ({{license}} §13)',
  sourceOfferNetworkBody:
    'This product is software provided over a network. If you modify and run the program over a remote network, you may obtain the corresponding source code at the URL below under the same terms.',
  sourceOfferBundleBody:
    'You may also download the complete source code together with the LICENSE file (the full license text) and use it freely.',
} satisfies LocaleBundleShape<typeof licensesKo>;