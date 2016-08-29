'use strict';

var phantom = require('phantom');
var exec = require('child_process').exec;
var execSync = require('child_process').execSync;
var fs = require('fs');
var paths = require('./utils/paths');
var offlineLinks = require(paths.markdownSource + 'offline_links.json');
var getLinksFromMarkdownList = require('./utils/getLinksFromMarkdownList');
var Proxy = require('http-mitm-proxy');
var proxy = Proxy();

var port = 1337;

function downloadSimpleSitesViaProxy(links, sites, success) {
  var count = 0;
  sites.forEach(site => {
    const url = site.overwriteUrl || (links.reduce((prev, link) => {
      return (link.name === site.name) ? link.url : prev;
    }, false));

    var wgetCmd = [
      'wget',
      '-e use_proxy=yes',
      '-e http_proxy=localhost:' + port,
      '-e https_proxy=localhost:' + port,
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
      '-e robots=off',
      '"' + url + '"'
    ].join(' ');

    exec('touch cookies.txt', { cwd: 'local' }, () => {
      exec(wgetCmd, {
        cwd: 'local',
        timeout: 1000 * 60,
      }, () => {
        const lastSite = ++count === sites.length;
        if (site.moveFromPath && site.moveFromPath.length) {
          var mvCmd = [
            'mv',
            '"' + site.moveFromPath + '"',
            '"' + site.offlinePath + '"'
          ].join(' ');
          exec(mvCmd, { cwd: 'local' }, () => {
            if (lastSite && typeof success === 'function') {
              exec('rm cookies.txt', { cwd: 'local' });
              success();
            }
          });
        } else {
          if (lastSite && typeof success === 'function') {
            exec('rm cookies.txt', { cwd: 'local' });
            success();
          }
        }
      });
    });
  });
}

proxy.onError(function(ctx, err, errorKind) {
  // ctx may be null
  var url = (ctx && ctx.clientToProxyRequest) ? ctx.clientToProxyRequest.url : '';
  console.error(errorKind + ' on ' + url + ':', err);
});

proxy.use(Proxy.gunzip);

proxy.onRequest(function(ctx, callback) {
  var chunks = [];
  ctx.onResponseData(function(ctx, chunk, callback) {
    chunks.push(chunk);
    return callback(null, null); // don't write chunks to client response
  });
  ctx.onResponseEnd(function(ctx, callback) {
    var body = Buffer.concat(chunks);

    if (
      ctx.serverToProxyResponse.headers['content-type']
      && ctx.serverToProxyResponse.headers['content-type'].indexOf('text/html') === 0
    ) {
      var url = 'http://' + ctx.clientToProxyRequest.headers.host + ctx.clientToProxyRequest.url;
      var sitepage = null;
      var phInstance = null;
      var promise = phantom.create([
        '--ignore-ssl-errors=yes',
        '--load-images=no',
      ]);

      promise.then(instance => {
        phInstance = instance;
        return instance.createPage();
      })
      .then(page => {
        sitepage = page;
        page.property('onError', function () {});
        return page.open(url);
      })
      .then(status => {
        if (status.trim() === 'fail') {
          console.log('Failed ', url);
        }
        return sitepage.property('content');
      })
      .then(content => {
        sitepage.close();
        phInstance.exit();
        ctx.proxyToClientResponse.write(content);
        return callback();
      })
      .catch(error => {
        phInstance.exit();
        return callback();
      });
    } else {
      ctx.proxyToClientResponse.write(body);
      return callback();
    }
  });
  callback();
});


fs.readFile(paths.markdownSource + 'links.md', 'utf8', (err, data) => {
  if (err) {
    return console.log(err);
  }

  proxy.listen({
    port: port,
    silent: true, 
  }, () => {
    setTimeout(() => {
      exec('mkdir -p local', () =>
        downloadSimpleSitesViaProxy(getLinksFromMarkdownList(data), offlineLinks.prerendered || [], () => {
          setTimeout(() => {
            console.log('Closing proxy...');
            proxy.close();
          }, 1000 * 300); // Give the server another 20 seconds to process any remaining fetch events.
        })
      );
    }, 2000);
  });
});

/* Okay, this works!  The process is such: use this file to download the source at page ready

```
phantomjs save_page.js http://www.lds.org/scriptures/ot/num/21.5-9?lang=eng > page.html ; // This output name should be unique as it will be the entry point for the offline file.
```

Then you can use wget or httrack to download the page with resources:

```
python -m SimpleHTTPServer ; // Start a server; should look into using Node for this one.
```

```
wget -e robots=off --adjust-extension --span-hosts --convert-links --backup-converted --page-requisites http://localhost:8000/page.html;
```

The resulting files are placed in directories relative to the local file, and the "downloaded" file is put in 

```
./localhost:8000/page.html
```

You can then load that page and you'll get the offline version!

Now to just automate the process using the links.md list, as well as using youtuble-dl to download the YouTube videos.

*/