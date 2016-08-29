var exec = require('child_process').exec;
var crypto = require('crypto');
var fs = require('fs');
var paths = require('./utils/paths');
var offlineLinks = require(paths.markdownSource + 'offline_links.json');
var getLinksFromMarkdownList = require('./utils/getLinksFromMarkdownList');

var youtubeDlExec = [
  "youtube-dl",
  "-f 'best[height<=240]'",
  "--recode-video mp4",
];

function shortenVideo(tempName, start, end, offlinePath) {
  var ffmepgCmd = [
    'ffmpeg',
    '-y',
    '-i',
    tempName + '.mp4',
    '-ss',
    start || 0,
    end ? '-to ' + end : '',
    '-async 1',
    offlinePath
  ].join(' ');

  exec(ffmepgCmd, {
    cwd: "local",
  }, (err) => {
    if (err) {
      return console.log(err);
    }
    exec('rm ' + tempName + '.mp4', {
      cwd: "local",
    });
  });
}

function moveVideo(tempName, offlinePath) {
  var moveCmd = [
    'mv',
    tempName + '.mp4',
    offlinePath
  ].join(' ');

  exec(moveCmd, {
    cwd: "local",
  }, (err) => {
    if (err) {
      return console.log(err);
    }
    exec('rm ' + tempName + '.mp4', {
      cwd: "local",
    });
  });
}

function downloadVideos(links, videos) {
  videos.forEach((video, i) => {
    const url = video.overwriteUrl || (links.reduce(prev, link => {
      return (link.name === video.name) ? link.url : prev;
    }, false));

    var tempName = crypto.createHash('md5').update(url + i).digest('hex');
    var outputPath = "'" + crypto.createHash('md5').update(url + i).digest('hex') + ".%(ext)s'";

    var youTubeDlCmd = youtubeDlExec.concat([
      '-o ' + outputPath,
      url
    ]).join(' ');

    postDownload = (video.start || video.end)
      ? () => shortenVideo(tempName, video.start, video.end, video.offlinePath)
      : () => moveVideo(tempName, video.offlinePath);

    exec(youTubeDlCmd, {
      cwd: "local",
    }, postDownload);
  });
}

fs.readFile(paths.markdownSource + 'links.md', 'utf8', (err, data) => {
  if (err) {
    return console.log(err);
  }

  exec('mkdir -p local', () =>
    downloadVideos(getLinksFromMarkdownList(data), offlineLinks.videos || [])
  );
});