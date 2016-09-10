/* @flow */
/* eslint no-console:0 */
const { exec, execSync } = require('child_process');
const fs = require('fs');
const paths = require('../utils/paths');
const offlineLinks = require('../src/md/offline_links.json');
const getLinksFromMarkdownList = require('../utils/getLinksFromMarkdownList');
const addRepeats = require('../utils/addRepeats');

function downloadSimpleSites(links, sites, depthParam) {
  const depth = depthParam || 0;

  sites.forEach((site, index) => {
    const url = site.overwriteUrl || (links.reduce((prev, link) => {
      if (link.name === site.name) {
        return link.url;
      }
      return prev;
    }, false));

    const wgetBaseOptions = [
      '--no-check-certificate',
      '--page-requisites',
      '--adjust-extension',
      '--convert-links',
      '--span-hosts',
      '--backup-converted',
      '--load-cookies cookies.txt',
      '--save-cookies cookies.txt',
      '--header="User-Agent: Mozilla/5.0 (Windows NT 6.0) AppleWebKit/537.11 '
        + '(KHTML, like Gecko) Chrome/23.0.1271.97 Safari/537.11"',
      '--header="Referer: http://xmodulo.com/"',
      '--timeout=50',
      '--quiet',
      '-e robots=off',
    ];

    const wgetOptions = depth ? wgetBaseOptions.concat([
      '--recursive',
      `--level=${depth}`,
    ]) : wgetBaseOptions;

    const wgetCmd = ['wget'].concat(wgetOptions).concat([`"${url}"`]).join(' ');

    try {
      execSync(wgetCmd, {
        cwd: paths.offlineStorage,
      });
    } catch (err) {
      if (err.error) {
        console.log(err.error);
      }
    }

    if (site.moveFromPath && site.moveFromPath.length) {
      const mvCmd = [
        'mv',
        `"${site.moveFromPath}"`,
        `"${site.offlinePath}"`,
      ].join(' ');
      try {
        execSync(mvCmd, { cwd: paths.offlineStorage });
      } catch (err) {
        if (err.error) {
          console.log(err.error);
        }
      }
    }

    console.log('Finished', index + 1, 'of', sites.length);
  });
}

fs.readFile(`${paths.markdownSource}links.md`, 'utf8', (err, data) => {
  if (err) {
    console.log(err);
  }

  exec(`mkdir -p ${paths.offlineStorage}`, () => {
    const cookiesFile = 'cookies.txt';
    exec(`touch ${cookiesFile}`, { cwd: paths.offlineStorage }, () => {
      console.log('Starting simple sites...');
      downloadSimpleSites(
        getLinksFromMarkdownList(data),
        addRepeats(offlineLinks.wget || [])
      );
      console.log('Done with simple sites!');
      console.log('Starting one-level sites...');
      downloadSimpleSites(
        getLinksFromMarkdownList(data),
        addRepeats(offlineLinks.oneLevelDeepSites || []),
        1
      );
      console.log('Done with one-level sites...');
    });
  });
});
