var exec = require('child_process').exec;
var fs = require('fs');
var paths = require('./utils/paths');
var offlineLinks = require(paths.markdownSource + 'offline_links.json');
var getLinksFromMarkdownList = require('./utils/getLinksFromMarkdownList');

function downloadFiles(links, files) {
  files.forEach(remoteFile => {
    const url = remoteFile.overwriteUrl || (links.reduce((prev, link) => {
      return (link.name === remoteFile.name) ? link.url : prev;
    }, false));

    var wgetCmd = [
      'wget',
      url,
      '-O ' + remoteFile.offlinePath,
    ].join(' ');

    exec(wgetCmd, {
      cwd: 'local',
      timeout: 60,
    });
  });
}

fs.readFile(paths.markdownSource + 'links.md', 'utf8', (err, data) => {
  if (err) {
    return console.log(err);
  }

  exec('mkdir -p local', () =>
    downloadFiles(getLinksFromMarkdownList(data), offlineLinks.files || [])
  );
});