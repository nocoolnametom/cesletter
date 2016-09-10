/* global ActiveXObject */
import forEachAll from './forEachAll';

function getHead(sURL, sCallback, fCallback) {
  const success = typeof sCallback === 'function' ? sCallback : () => {};
  const failure = typeof fCallback === 'function' ? fCallback : () => {};
  const oReq = window.XMLHttpRequest
    ? new XMLHttpRequest()
    : new ActiveXObject('Microsoft.XMLHTTP');
  oReq.open('HEAD', sURL);
  oReq.onreadystatechange = () => {
    if (oReq.readyState > 3) {
      if (oReq.status === 200) {
        return success();
      }
      return failure();
    }
    return null;
  };
  oReq.send();
}

function translateBadLinks() {
  forEachAll(document.querySelectorAll('a[data-offline-marker]'), (index, link) => {
    link.href = link.title || link.href; // eslint-disable-line no-param-reassign
  });
}

export default function ifOfflineTranslateBadLinks() {
  const firstLink = document.querySelector('a[data-offline-marker]');
  if (firstLink && firstLink instanceof HTMLAnchorElement) {
    getHead(firstLink.href, () => {}, translateBadLinks);
  } else {
    translateBadLinks();
  }
}
