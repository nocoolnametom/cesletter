/* @flow */
/* eslint no-console:0 import/no-extraneous-dependencies:0 */
const fs = require('fs');
const paths = require('./utils/paths');
const exec = require('child_process').exec;
const md = require('./utils/md');
const Handlebars = require('handlebars');
const offlineLinks = require('./src/md/offline_links.json');
const getLinksFromMarkdownList = require('./utils/getLinksFromMarkdownList');


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
      const result = template({
        markdownBody: htmlOutput,
      });

      exec(`mkdir -p ${paths.distribution}`, () => {
        fs.writeFile(`${paths.distribution}offline.html`, result, (writeErr) => {
          if (writeErr) {
            console.log(writeErr);
          }

          console.log('The file was saved!');
        });
      });
    });
  });
});
