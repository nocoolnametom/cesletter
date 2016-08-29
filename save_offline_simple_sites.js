var exec = require('child_process').exec;
var fs = require('fs');
var paths = require('./utils/paths');
var offlineLinks = require(paths.markdownSource + 'offline_links.json');
var getLinksFromMarkdownList = require('./utils/getLinksFromMarkdownList');

function downloadSimpleSites(links, sites) {
  sites.forEach(site => {
    const url = site.overwriteUrl || (links.reduce((prev, link) => {
      return (link.name === site.name) ? link.url : prev;
    }, false));

    var wgetCmd = [
      'wget',
      '--page-requisites',
      '--adjust-extension',
      '--convert-links',
      '--span-hosts',
      '--backup-converted',
      '--load-cookies cookies.txt',
      '--save-cookies cookies.txt',
      '--header="User-Agent: Mozilla/5.0 (Windows NT 6.0) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.97 Safari/537.11"',
      '--header="Referer: http://xmodulo.com/"',
      '-e robots=off',
      '"' + url + '"'
    ].join(' ');

    exec('touch cookies.txt', () => {
      exec(wgetCmd, {
        cwd: 'local',
        timeout: 1000 * 60,
      }, () => {
        exec('rm cookies.txt', { cwd: 'local' });
        if (site.moveFromPath && site.moveFromPath.length) {
          var mvCmd = [
            'mv',
            '"' + site.moveFromPath + '"',
            '"' + site.offlinePath + '"',
          ].join(' ')
          console.log(mvCmd);
          exec(mvCmd, { cwd: 'local' });
        }
      });
    });
  });
}

fs.readFile(paths.markdownSource + 'links.md', 'utf8', (err, data) => {
  if (err) {
    return console.log(err);
  }

  exec('mkdir -p local', () =>
    downloadSimpleSites(getLinksFromMarkdownList(data), offlineLinks.wget || [])
  );
});