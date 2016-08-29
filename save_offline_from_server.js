var execSync = require('child_process').execSync;
var fs = require('fs');
var path = require('path');
var paths = require('./utils/paths');
var express = require('express');
var offlineLinks = require(paths.markdownSource + 'offline_links.json');
var getLinksFromMarkdownList = require('./utils/getLinksFromMarkdownList');

function downloadFromLocalServer(links, sites) {
  console.log('starting loop of ' + links.length + ' sites');
  sites.forEach(site => {
    
    var wgetCmd = [
      'wget',
      'http://localhost:3000/' + site.offlinePath,
    ].join(' ');

    console.log(wgetCmd);

    execSync(wgetCmd, {
      cwd: 'local',
      timeout: 60,
    });
  });

  console.log('ending loop');
}

function postListening(mdLinks, sites) {
  console.log('Example app listening on port 3000!');
  execSync('mkdir -p local');
  console.log('mkdir -p local');
  downloadFromLocalServer(mdLinks, sites);
  console.log('closing server');
  server.close();
  console.log('Closed!');
}

fs.readFile(paths.markdownSource + 'links.md', 'utf8', (err, data) => {
  if (err) {
    return console.log(err);
  }

  var app = express();
  app.use('/local', express.static(path.join(__dirname + '/tmp/local/')));
  app.get('/', function(req, res) {
    res.send('<p>It Works!</p>');
  });
  console.log('use ' + path.join(__dirname + '/tmp/local/'));
  var sites = offlineLinks.prerendered || [];
  var server = app.listen(3000, () => postListening(getLinksFromMarkdownList(data), sites));
  var server = app.listen(3000);
});