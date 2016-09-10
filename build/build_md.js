/* @flow */
/* eslint no-console:0 import/no-extraneous-dependencies:0 */
const fs = require('fs');
const paths = require('../utils/paths');
const { exec } = require('child_process');
const md = require('../utils/md');
const Handlebars = require('handlebars');
const { minify } = require('html-minifier');
const minifyOps = require('../config/minifyOpts.json');

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
    const result = minify(template({
      markdownBody: htmlOutput,
    }), minifyOps);

    const minifiedHtml = minify(htmlOutput, minifyOps);

    const jsVersion = `const index = '${minifiedHtml.replace(/'/g, "\\'")}';
export default index;
`;

    exec(`mkdir -p ${paths.distribution}/partials`, () => {
      fs.writeFile(
        `${paths.distribution}/partials/index.html`,
        minifiedHtml,
        (writePartialErr) => {
          if (writePartialErr) {
            console.log(writePartialErr);
          }

          fs.writeFile(
            `${paths.distribution}/partials/index.js`,
            jsVersion,
            (writePartialJsErr) => {
              if (writePartialJsErr) {
                console.log(writePartialJsErr);
              }

              fs.writeFile(`${paths.distribution}index.html`, result, (writeErr) => {
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
