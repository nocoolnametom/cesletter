/* @flow */
/* eslint func-names:0 no-console:0 */
const phantom = require('phantom'); // eslint-disable-line import/no-extraneous-dependencies
const { fork } = require('child_process');
const paths = require('../utils/paths');
const mitmProxy =
  require('http-mitm-proxy'); // eslint-disable-line import/no-extraneous-dependencies

const proxy = mitmProxy();

const port = 1337;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

proxy.onError((ctx, err, errorKind) => {
  // ctx may be null
  const url = (ctx && ctx.clientToProxyRequest) ? ` on ${ctx.clientToProxyRequest.url}` : '';
  if (url) {
    console.error(`${errorKind}${url}:`, err);
  }
});

proxy.use(mitmProxy.gunzip);

proxy.onRequest((connection, proxyCallback) => {
  const chunks = [];
  const cesLetterPath = connection.clientToProxyRequest.headers['cesletter-path'];
  connection.proxyToServerRequestOptions.rejectUnauthorized // eslint-disable-line no-param-reassign
    = false;

  if (cesLetterPath === connection.clientToProxyRequest.url) {
    connection.onResponseData((ctx, chunk, callback) => {
      chunks.push(chunk);
      return callback(null, null); // don't write chunks to client response
    });
    connection.onResponseEnd((ctx, callback) => {
      const body = Buffer.concat(chunks);
      const url = [
        ctx.proxyToServerRequestOptions.agent.protocol,
        '//',
        ctx.proxyToServerRequestOptions.headers.host,
        ctx.proxyToServerRequestOptions.path,
      ].join('');

      if (
        ctx.serverToProxyResponse.headers['content-type']
        && ctx.serverToProxyResponse.headers['content-type'].indexOf('text/html') === 0
      ) {
        let sitepage = null;
        let phInstance = null;
        const promise = phantom.create([
          '--ignore-ssl-errors=yes',
          `--cookies-file=${paths.offlineStorage}cookies.txt`,
        ]);

        promise.then(instance => {
          phInstance = instance;
          return instance.createPage();
        })
        .then(page => {
          sitepage = page;
          page.property('onError', function () { // eslint-disable-line prefer-arrow-callback
            throw new Error('Errored ' + url); // eslint-disable-line prefer-template
          });
          return page.open(url);
        })
        .then(status => {
          if (status.trim() === 'fail') {
            throw new Error(`Failed ${url}`);
          }
          if (sitepage && sitepage.evaluate && typeof sitepage.evaluate === 'function') {
            sitepage.evaluate(function () { // eslint-disable-line prefer-arrow-callback
              function writeToConsole() {
                setTimeout(function () { // eslint-disable-line prefer-arrow-callback
                  console.log('page loaded');
                }, 5000);
              }
              if (document.readyState === 'complete') {
                writeToConsole();
              } else {
                window.onload = function () {
                  writeToConsole();
                };
              }
            });
          }
          if (sitepage && sitepage.on && typeof sitepage.on === 'function') {
            sitepage.on('onConsoleMessage', false, () => {
              if (sitepage && sitepage.off && typeof sitepage.off === 'function') {
                sitepage.off('onConsoleMessage');
              }
              if (sitepage && sitepage.evaluate && typeof sitepage.evaluate === 'function') {
                sitepage.evaluate(function () { // eslint-disable-line prefer-arrow-callback
                  return document.getElementsByTagName('html')[0].innerHTML;
                }).then(html => {
                  ctx.proxyToClientResponse.write(html);
                  callback();
                }).then(() => {
                  if (sitepage && sitepage.close && typeof sitepage.close === 'function') {
                    sitepage.close();
                  }
                  if (phInstance && phInstance.exit && typeof phInstance.exit === 'function') {
                    phInstance.exit();
                  }
                });
              }
            });
          }
        })
        .catch(error => {
          console.log(error);
          if (phInstance && phInstance.exit && typeof phInstance.exit === 'function') {
            phInstance.exit();
          }
        });
      } else {
        console.log('proxied', url);
        ctx.proxyToClientResponse.write(body);
        callback();
      }
    });
  }

  proxyCallback();
});

console.log('Staring proxy for prerendering sites...');
proxy.listen({
  port,
  forceSNI: true,
  silent: true,
}, () => {
  console.log('Stared proxy!');
  setTimeout(() => {
    const saving = fork('build/save_offline_from_server.js');
    saving.on('close', () => {
      console.log('Stopping proxy...');
      proxy.close();
      console.log('Stopped proxy!');
    });
  }, 2000);
});
