var fs = require('fs');
var paths = require('./utils/paths');
var md = require('./utils/md');
var Handlebars = require('handlebars');

fs.readFile(paths.markdownSource + 'cesletter.md', 'utf8', function (err, data) {
  if (err) {
    return console.log(err);
  }
  htmlOutput = md.render(data);
  fs.readFile(paths.htmlSource + 'index.hbs', 'utf8', function (err, data) {
    var template = Handlebars.compile(data);
    var result = template({
      markdownBody: htmlOutput
    });
    fs.writeFile(paths.distribution + "./index.html", result, function(err) {
      if(err) {
          return console.log(err);
      }

      console.log("The file was saved!");
    });
  }); 
});