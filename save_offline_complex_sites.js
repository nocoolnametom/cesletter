'use strict';

var phantom = require('phantom');
var fork = require('child_process').fork;
var Proxy = require('http-mitm-proxy');
var proxy = Proxy();

var port = 1337;

proxy.onError(function(ctx, err, errorKind) {
  // ctx may be null
  var url = (ctx && ctx.clientToProxyRequest) ? ' on ' + ctx.clientToProxyRequest.url : '';
  var ctxOutput = (ctx && ctx.clientToProxyRequest) ? ctx.clientToProxyRequest : '';
  if (url) {
    console.error(errorKind + url + ':', err, ctxOutput);
  }
});

proxy.use(Proxy.gunzip);

proxy.onRequest(function(ctx, callback) {
  var chunks = [];
  var cesLetterPath = ctx.clientToProxyRequest.headers['cesletter-path'];

  if (cesLetterPath === ctx.clientToProxyRequest.url) {
    ctx.onResponseData(function(ctx, chunk, callback) {
      chunks.push(chunk);
      return callback(null, null); // don't write chunks to client response
    });
    ctx.onResponseEnd(function(ctx, callback) {
      var body = Buffer.concat(chunks);
      var url = ctx.proxyToServerRequestOptions.agent.protocol
          + '//' + ctx.proxyToServerRequestOptions.headers.host + ctx.proxyToServerRequestOptions.path;

      if (
        ctx.serverToProxyResponse.headers['content-type']
        && ctx.serverToProxyResponse.headers['content-type'].indexOf('text/html') === 0
      ) {
        var sitepage = null;
        var phInstance = null;
        var promise = phantom.create([
          '--ignore-ssl-errors=yes',
        ]);

        promise.then(instance => {
          phInstance = instance;
          return instance.createPage();
        })
        .then(page => {
          sitepage = page;
          page.property('onError', function () {
            throw new Error('Failed ' + url)
          });
          return page.open(url);
        })
        .then(status => {
          if (status.trim() === 'fail') {
            throw new Error('Failed ' + url);
          }
          sitepage.evaluate(function () {
            function writeToConsole() {
              setTimeout(function () {
                console.log('page loaded');
              }, 5000);
            }
            if (document.readyState === 'complete') {
              writeToConsole();
            } else {
              window.onload = function () {
                writeToConsole();
              }
            }
          });
          sitepage.on('onConsoleMessage', false, () => {
            sitepage.off('onConsoleMessage');
            sitepage.evaluate(function () {
              return document.getElementsByTagName('html')[0].innerHTML;
            }).then(function(html) {
              ctx.proxyToClientResponse.write(html);
              callback();
            }).then(() => {
              sitepage.close();
              phInstance.exit();
            });
          })
        })
        .catch(error => {
          console.log(error);
          phInstance.exit();
        });
      } else {
        console.log('proxied', url);
        ctx.proxyToClientResponse.write(body);
        return callback();
      }
    });
  }

  callback();
});


proxy.listen({
  port: port,
  silent: true,
}, () => {
  setTimeout(() => {
    var saving = fork('save_offline_from_server.js');
    saving.on('close', (code) => {
      proxy.close();
    });
  }, 2000);
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