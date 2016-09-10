import applyResponsiveTableClassNames from './applyResponsiveTableClassNames';
import ifOfflineTranslateBadLinks from './ifOfflineTranslateBadLinks';

export default function initializeCesLetterScripts() {
  ifOfflineTranslateBadLinks();
  applyResponsiveTableClassNames();
}
