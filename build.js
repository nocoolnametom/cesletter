/* @flow */
/* eslint no-console:0 import/no-extraneous-dependencies:0 */
const fs = require('fs');
const paths = require('./utils/paths');
const exec = require('child_process').exec;
const md = require('./utils/md');
const Handlebars = require('handlebars');

fs.readFile(`${paths.markdownSource}cesletter.md`, 'utf8', (err, data) => {
  if (err) {
    console.log(err);
  }
  const htmlOutput = md.render(data);
  fs.readFile(`${paths.htmlSource}index.hbs`, 'utf8', (templateReadErr, templateData) => {
    if (templateReadErr) {
      console.log(templateReadErr);
    }

    const template = Handlebars.compile(templateData);
    const result = template({
      markdownBody: htmlOutput,
    });

    exec(`mkdir -p ${paths.distribution}`, () => {
      fs.writeFile(`${paths.distribution}index.html`, result, (writeErr) => {
        if (writeErr) {
          console.log(writeErr);
        }

        console.log('The file was saved!');
      });
    });
  });
});
