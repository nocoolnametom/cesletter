/* @flow */
/* eslint no-console:0 */
const { exec } = require('child_process');
const fs = require('fs');
const paths = require('../utils/paths');
const getLinksFromMarkdownList = require('../utils/getLinksFromMarkdownList');
const addRepeats = require('../utils/addRepeats');
const offlineLinks = require('../src/md/offline_links.json');

function downloadFiles(links, files) {
  let count = 0;
  files.forEach(remoteFile => {
    const url = remoteFile.overwriteUrl || (links.reduce((prev, link) => {
      if (link.name === remoteFile.name) {
        return link.url;
      }
      return prev;
    }, false));

    const wgetCmd = [
      'wget',
      '--no-check-certificate',
      '--timeout=50',
      '--load-cookies cookies.txt',
      '--save-cookies cookies.txt',
      '--header="User-Agent: Mozilla/5.0 (Windows NT 6.0) AppleWebKit/537.11 '
        + '(KHTML, like Gecko) Chrome/23.0.1271.97 Safari/537.11"',
      '--header="Referer: http://xmodulo.com/"',
      '--quiet',
      '-e robots=off',
      `-O "${remoteFile.offlinePath}"`,
      url,
    ].join(' ');

    exec(wgetCmd, {
      cwd: paths.offlineStorage,
    }, err => {
      if (err) {
        console.log(err);
      }
      console.log('Finished', ++count, 'of', files.length);
      if (count === files.length) {
        console.log('Finished offline files!');
      }
    });
  });
}

fs.readFile(`${paths.markdownSource}links.md`, 'utf8', (err, data) => {
  if (err) {
    console.log(err);
  }

  exec(`mkdir -p ${paths.offlineStorage}`, () => {
    console.log('Starting offline files...');
    downloadFiles(
      getLinksFromMarkdownList(data),
      addRepeats(offlineLinks.files || [])
    );
  });
});
