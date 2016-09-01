(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*!
  * domready (c) Dustin Diaz 2014 - License MIT
  */
!function (name, definition) {

  if (typeof module != 'undefined') module.exports = definition()
  else if (typeof define == 'function' && typeof define.amd == 'object') define(definition)
  else this[name] = definition()

}('domready', function () {

  var fns = [], listener
    , doc = document
    , hack = doc.documentElement.doScroll
    , domContentLoaded = 'DOMContentLoaded'
    , loaded = (hack ? /^loaded|^c/ : /^loaded|^i|^c/).test(doc.readyState)


  if (!loaded)
  doc.addEventListener(domContentLoaded, listener = function () {
    doc.removeEventListener(domContentLoaded, listener)
    loaded = 1
    while (listener = fns.shift()) listener()
  })

  return function (fn) {
    loaded ? setTimeout(fn, 0) : fns.push(fn)
  }

});

},{}],2:[function(require,module,exports){
/* @flow */
/* eslint no-var:0 */
var forEachAll = require('./forEachAll');

function alterTable(index, table) {
  var headers = [];

  forEachAll(table.querySelector('tr').children, (j, tr) => {
    headers.push(tr.innerHTML);
    tr.scope = 'col'; // eslint-disable-line no-param-reassign
  });

  forEachAll(table.querySelectorAll('tr'), (j, tr) => {
    forEachAll(tr.children, (k, td) => {
      if (k === 0) {
        td.setAttribute('scope', 'row');
      } else {
        td.setAttribute('data-title', headers[k]);
      }
    });
  });
}

function applyResponsiveTableClassNames() {
  forEachAll(document.querySelectorAll('table.responsive'), alterTable);
}

module.exports = applyResponsiveTableClassNames;

},{"./forEachAll":4}],3:[function(require,module,exports){
/* @flow */
/* eslint no-var:0 */
var applyResponsiveTableClassNames = require('./applyResponsiveTableClassNames');
var ifOfflineTranslateBadLinks = require('./ifOfflineTranslateBadLinks');
var domready = require('domready'); // eslint-disable-line import/no-extraneous-dependencies

domready(() => {
  ifOfflineTranslateBadLinks();
  applyResponsiveTableClassNames();
});

},{"./applyResponsiveTableClassNames":2,"./ifOfflineTranslateBadLinks":5,"domready":1}],4:[function(require,module,exports){
/* @flow */
/* eslint no-var:0 */
function forEachAll(
  anArray/* : NodeList<*>|Array<any> */,
  callback/* : Function */,
  scope/* : any */
) {
  var i;
  for (i = 0; i < anArray.length; i++) {
    callback.call(scope, i, anArray[i]); // passes back stuff we need
  }
}

module.exports = forEachAll;

},{}],5:[function(require,module,exports){
/* @flow */
/* eslint no-var:0 */
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
      failure();
    }
  };
  oReq.send();
}

function ifOfflineTranslateBadLinks() {
  getHead(document.querySelector('a[href]').href, function () {}, function () {
    forEachAll(document.querySelectorAll('a[href]'), function(index, link) {
      link.href = link.title || link.href;
    });
  });
}

module.exports = ifOfflineTranslateBadLinks;

},{"./forEachAll":4}]},{},[3]);
