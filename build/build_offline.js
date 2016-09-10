/* @flow */
/* eslint no-console:0 import/no-extraneous-dependencies:0 */
const fs = require('fs');
const paths = require('../utils/paths');
const { exec } = require('child_process');
const md = require('../utils/md');
const Handlebars = require('handlebars');
const { minify } = require('html-minifier');
const offlineLinks = require('../src/md/offline_links.json');
const getLinksFromMarkdownList = require('../utils/getLinksFromMarkdownList');
const minifyOps = require('../config/minifyOpts.json');

function offlineLinkTargets(localPrefix, linkInfo, originals) {
  return Object.keys(linkInfo)
    .reduce((prev, curr) => prev.concat(linkInfo[curr].map(link => ({
      ...link,
      original: originals.reduce((origPrev, origCurr) => {
        if (origCurr.name === link.name) {
          return origCurr.url;
        }
        return origPrev;
      }, false),
      unaltered: curr === 'unaltered',
    }))), [])
    .map(link =>
      `[${link.name}]: `
      + `${link.unaltered ? '' : localPrefix}${link.offlinePath}${(link.offlineAppend || '')}`
      + ` "${link.original}"`
    )
    .join("\n"); // eslint-disable-line quotes
}

fs.readFile(`${paths.markdownSource}cesletter.md`, 'utf8', (err, data) => {
  if (err) {
    console.log(err);
  }

  fs.readFile(`${paths.markdownSource}links.md`, 'utf8', (linksMdErr, linksMddata) => {
    if (linksMdErr) {
      console.log(linksMdErr);
    }

    const markdownSource = data
      .replace('!!!include(links.md)!!!', offlineLinkTargets(
        './local/',
        offlineLinks,
        getLinksFromMarkdownList(linksMddata)
      ));

    const htmlOutput = md.render(markdownSource);
    fs.readFile(`${paths.htmlSource}index.hbs`, 'utf8', (templateReadErr, templateData) => {
      if (templateReadErr) {
        console.log(templateReadErr);
      }

      const template = Handlebars.compile(templateData);
      const result = minify(template({
        markdownBody: htmlOutput,
      }), minifyOps);

      const minifiedHtml = minify(htmlOutput, minifyOps);

      const jsVersion = `const offline = '${minifiedHtml.replace(/'/g, "\\'")}';
export default offline;
`;

      exec(`mkdir -p ${paths.distribution}/partials`, () => {
        fs.writeFile(
          `${paths.distribution}/partials/offline.html`,
          minifiedHtml,
          (writePartialErr) => {
            if (writePartialErr) {
              console.log(writePartialErr);
            }

            fs.writeFile(
              `${paths.distribution}/partials/offline.js`,
              jsVersion,
              (writePartialJsErr) => {
                if (writePartialJsErr) {
                  console.log(writePartialJsErr);
                }

                fs.writeFile(`${paths.distribution}offline.html`, result, (writeErr) => {
                  if (writeErr) {
                    console.log(writeErr);
                  }

                  console.log('The file was saved!');
                });
              }
            );
          }
        );
      });
    });
  });
});
