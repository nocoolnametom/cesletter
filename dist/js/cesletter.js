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
var forEachAll = require('./forEachAll');

function alterTable(index, table) {
    var headers = [];

    forEachAll(table.querySelector('tr').children, (j, tr) => {
        headers.push(tr.innerHTML);
        tr.scope = 'col';
    });

    forEachAll(table.querySelectorAll('tr'), (j, tr) => {
        forEachAll(tr.children, (k, td) => {
            if ( k === 0)
            {
            td.setAttribute('scope', 'row');
            }
            else
            {
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
var applyResponsiveTableClassNames = require('./applyResponsiveTableClassNames');
var domready = require('domready');

domready(function () {
    applyResponsiveTableClassNames();
});
},{"./applyResponsiveTableClassNames":2,"domready":1}],4:[function(require,module,exports){
function forEachAll(anArray, callback, scope) {
  for (var i = 0; i < anArray.length; i++) {
    callback.call(scope, i, anArray[i]); // passes back stuff we need
  }
};
module.exports = forEachAll;
},{}]},{},[3]);
