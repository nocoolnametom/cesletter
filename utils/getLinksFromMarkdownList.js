function getLinksFromMarkdownList(list) {
  var linkParser = new RegExp(/\[([^\]]+)\]:\s*([^"'\n]+)(["'][^"']+["'])?/);
  var globalParser = new RegExp(/\[([^\]]+)\]:\s*([^"'\n]+)(["'][^"']+["'])?/g);

  return list.match(globalParser).map(link => {
    var linkInfo = link.match(linkParser);
    return {
      name: linkInfo[1],
      url: linkInfo[2]
    };
  });
}

module.exports = getLinksFromMarkdownList;