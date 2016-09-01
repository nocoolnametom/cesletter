/* @flow */
function getLinksFromMarkdownList(list: string): Array<{name: string, url: string}> {
  const linkParser = new RegExp(/\[([^\]]+)\]:\s*([^"'\n]+)(["'][^"']+["'])?/);
  const globalParser = new RegExp(/\[([^\]]+)\]:\s*([^"'\n]+)(["'][^"']+["'])?/g);

  return (list.match(globalParser) || []).map(link => {
    const linkInfo = link.match(linkParser);
    return {
      name: linkInfo && linkInfo[1] ? linkInfo[1] : '',
      url: linkInfo && linkInfo[2] ? linkInfo[2] : '',
    };
  });
}

module.exports = getLinksFromMarkdownList;
