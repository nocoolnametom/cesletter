/* @flow */
/* eslint no-console:0 import/no-extraneous-dependencies:0 */
const paths = require('./paths');
const md = require('markdown-it')({
  html: true,
  typographer: true,
});

md.use(require('markdown-it-front-matter'), fm => console.log(fm))
  .use(require('markdown-it-container'), 'header', {
    render(tokens, idx) {
      if (tokens[idx].nesting === 1) {
        // opening tag
        return '<header>\n';
      }
      // closing tag
      return '</header>\n<div class="mainLetter">\n';
    },
  })
  .use(require('markdown-it-container'), 'centered', {
    render(tokens, idx) {
      if (tokens[idx].nesting === 1) {
        // opening tag
        return '<div class="centered">\n';
      }

      // closing tag
      return '</div>\n';
    },
  })
  .use(require('markdown-it-container'), 'pictureGroup', {
    validate(params) {
      return params.trim().match(/^pictureGroup\s+(.*)$/);
    },
    render(tokens, idx) {
      const m = tokens[idx].info.trim().match(/^pictureGroup\s+(.*)$/);

      if (tokens[idx].nesting === 1) {
        // opening tag
        return `<div class="pictureGroup pictureGroup${m[1]}">\n`;
      }

      // closing tag
      return '</div>\n';
    },
  })
  .use(require('markdown-it-container'), 'footer', {
    render(tokens, idx) {
      if (tokens[idx].nesting === 1) {
        // opening tag
        return '</div><footer>\n';
      }

      // closing tag
      return '</footer>\n';
    },
  })
  .use(require('mdfigcaption'))
  .use(require('markdown-it-center-text'))
  .use(require('markdown-it-decorate'), {})
  .use(require('markdown-it-block-image'), {
    outputContainer: 'p',
    containerClassName: 'caption',
  })
  .use(require('markdown-it-block-embed'), {
    width: 480,
    height: 360,
    containerClassName: 'blockEmbed',
    serviceClassPrefix: 'blockEmbedService',
  })
  .use(require('markdown-it-link-attributes'), {
    target: '_blank',
    rel: 'noopener',
    'data-offline-marker': 'cesletterLink',
  })
  .use(require('markdown-it-sup-alt'))
  .use(require('markdown-it-include'), paths.markdownSource);

module.exports = md;
