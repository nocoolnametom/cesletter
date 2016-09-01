/* @flow */
/* eslint no-var:0 func-names:0 */
var forEachAll = require('./forEachAll');

function getHead(sURL, sCallback, fCallback) {
  var success = typeof sCallback === 'function' ? sCallback : function () {};
  var failure = typeof fCallback === 'function' ? fCallback : function () {};
  var oReq = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
  oReq.open('HEAD', sURL);
  oReq.onreadystatechange = function () {
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

function ifOfflineTranslateBadLinks() {
  getHead(document.querySelector('a[href]').href, function () {}, function () {
    forEachAll(document.querySelectorAll('a[href]'), function(index, link) {
      link.href = link.title || link.href; // eslint-disable-line no-param-reassign
    });
  });
}

module.exports = ifOfflineTranslateBadLinks;
