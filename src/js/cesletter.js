/* @flow */
/* eslint no-var:0 */
var applyResponsiveTableClassNames = require('./applyResponsiveTableClassNames');
var ifOfflineTranslateBadLinks = require('./ifOfflineTranslateBadLinks');
var domready = require('domready'); // eslint-disable-line import/no-extraneous-dependencies

domready(() => {
  ifOfflineTranslateBadLinks();
  applyResponsiveTableClassNames();
});
