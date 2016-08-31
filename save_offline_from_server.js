'use strict';

var exec = require('child_process').exec;
var execSync = require('child_process').execSync;
var fs = require('fs');
var paths = require('./utils/paths');
var offlineLinks = require(paths.markdownSource + 'offline_links.json');
var getLinksFromMarkdownList = require('./utils/getLinksFromMarkdownList');

var port = 1337;

function downloadSimpleSitesViaProxy(links, sites, callback) {
  var count = 0;

  var success = typeof callback === 'function' ? callback : function () {};
  
  sites.forEach(site => {
    var url = site.overwriteUrl || (links.reduce((prev, link) => {
      return (link.name === site.name) ? link.url : prev;
    }, false));

    var wgetCmd = [
      'wget',
      '-e use_proxy=yes',
      '-e http_proxy=localhost:' + port,
      '-e https_proxy=localhost:' + port,
      '--no-check-certificate',
      '--ca-certificate=../.http-mitm-proxy/certs/ca.pem',
      '--ca-directory=../.http-mitm-proxy/certs/',
      '--page-requisites',
      '--adjust-extension',
      '--convert-links',
      '--span-hosts',
      '--backup-converted',
      '--timeout=10',
      '--load-cookies cookies.txt',
      '--save-cookies cookies.txt',
      '--header="User-Agent: Mozilla/5.0 (Windows NT 6.0) AppleWebKit/537.11 '
        + '(KHTML, like Gecko) Chrome/23.0.1271.97 Safari/537.11"',
      '--header="Referer: http://xmodulo.com/"',
      '--header="CESLETTER-PATH: ' + url.replace(/^([^\/]+)\/\/([^\/]+)/, '') + '"',
      '--timeout=45',
      '--quiet',
      '-e robots=off',
      '"' + url + '"'
    ].join(' ');

    try {
      var result = execSync(wgetCmd, {
        cwd: 'local',
      });
    } catch (err) {}
    var lastSite = ++count === sites.length;
    if (site.moveFromPath && site.moveFromPath.length) {
      var mvCmd = [
        'mv',
        '"' + site.moveFromPath + '"',
        '"' + site.offlinePath + '"'
      ].join(' ');
      exec(mvCmd, { cwd: 'local' }, () => {
        if (lastSite) {
          success();
        }
      });
    } else {
      if (lastSite) {
        success();
      }
    }
  });
}


fs.readFile(paths.markdownSource + 'links.md', 'utf8', (err, data) => {
  if (err) {
    return console.log(err);
  }
  exec('mkdir -p local', () =>
    exec('touch cookies.txt', { cwd: 'local' }, () =>
      downloadSimpleSitesViaProxy(getLinksFromMarkdownList(data), offlineLinks.prerendered || [], () => {
        console.log('Done!');
      })
    )
  );
});