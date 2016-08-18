var paths = require('./paths');
var md = require('markdown-it')({
  html: true,
  typographer: true
});

md.use(require('markdown-it-front-matter'), function(fm) {
    console.log(fm);
  })
  .use(require('markdown-it-container'), 'header', {
    render: function (tokens, idx) {
      if (tokens[idx].nesting === 1) {
        // opening tag 
        return '<header>\n';
  
      } else {
        // closing tag 
        return '</header>\n<div class="mainLetter">\n';
      }
    }
  })
  .use(require('markdown-it-container'), 'centered', {
    render: function (tokens, idx) {
      if (tokens[idx].nesting === 1) {
        // opening tag 
        return '<div class="centered">\n';
  
      } else {
        // closing tag 
        return '</div>\n';
      }
    }
  })
  .use(require('markdown-it-container'), 'pictureGroup', {
    validate: function(params) {
      return params.trim().match(/^pictureGroup\s+(.*)$/);
    },
    render: function (tokens, idx) {
      var m = tokens[idx].info.trim().match(/^pictureGroup\s+(.*)$/);
  
      if (tokens[idx].nesting === 1) {
        // opening tag 
        return '<div class="pictureGroup pictureGroup' + m[1] + '">\n';
  
      } else {
        // closing tag 
        return '</div>\n';
      }
    }
  })
  .use(require('markdown-it-container'), 'footer', {
    render: function (tokens, idx) {
      if (tokens[idx].nesting === 1) {
        // opening tag 
        return '</div><footer>\n';
  
      } else {
        // closing tag 
        return '</footer>\n';
      }
    }
  })
  .use(require('mdfigcaption'))
  .use(require('markdown-it-center-text'))
  .use(require('markdown-it-decorate'), {})
  .use(require('markdown-it-block-image'), {
    outputContainer: 'p',
    containerClassName: "caption"
  })
  .use(require('markdown-it-block-embed'), {
    width: 480,
    height: 360,
    containerClassName: 'blockEmbed',
    serviceClassPrefix: 'blockEmbedService'
  })
  .use(require('markdown-it-link-target'))
  .use(require('markdown-it-sup-alt'))
  .use(require('markdown-it-include'), paths.markdownSource);

module.exports = md;