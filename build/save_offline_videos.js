/* @flow */
/* eslint no-console:0 */
const { exec } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const paths = require('../utils/paths');
const offlineLinks = require('../src/md/offline_links.json');
const getLinksFromMarkdownList = require('../utils/getLinksFromMarkdownList');
const addRepeats = require('../utils/addRepeats');

const youtubeDlExec = [
  'youtube-dl',
  "-f 'best[height<=240]'",
  '--recode-video mp4',
];

function shortenVideo(tempName, start, end, offlinePath, callback) {
  const success = typeof callback === 'function' ? callback : () => {};
  const ffmepgCmd = [
    'ffmpeg',
    '-y',
    '-i',
    `"${tempName}.mp4"`,
    '-ss',
    start || 0,
    end ? `-to ${end}` : '',
    '-async 1',
    `"${offlinePath}"`,
  ].join(' ');

  exec(ffmepgCmd, {
    cwd: paths.offlineStorage,
  }, (err) => {
    if (err) {
      console.log(err);
    }
    exec(`rm "${tempName}.mp4"`, {
      cwd: paths.offlineStorage,
    }, success);
  });
}

function moveVideo(tempName, offlinePath, callback) {
  const success = typeof callback === 'function' ? callback : () => {};
  const moveCmd = [
    'mv',
    `"${tempName}.mp4"`,
    `"${offlinePath}"`,
  ].join(' ');

  exec(moveCmd, {
    cwd: paths.offlineStorage,
  }, (err) => {
    if (err) {
      console.log(err);
    }
    exec(`rm "${tempName}.mp4"`, {
      cwd: paths.offlineStorage,
    }, success);
  });
}

function downloadVideos(links, videos) {
  let count = 0;
  videos.forEach((video, i) => {
    const url = video.overwriteUrl || (links.reduce((prev, link) => {
      if (link.name === video.name) {
        return link.url;
      }

      return prev;
    }, false));

    const tempName = crypto.createHash('md5').update(url + i).digest('hex');

    const youTubeDlCmd = youtubeDlExec.concat([
      `-o "${tempName}.%(ext)s"`,
      url,
    ]).join(' ');

    const success = () => {
      console.log('Finished', ++count, 'of', videos.length);
      if (count === videos.length) {
        console.log('Finished offline videos!');
      }
    };

    const postDownload = (video.start || video.end)
      ? () => shortenVideo(tempName, video.start, video.end, video.offlinePath, success)
      : () => moveVideo(tempName, video.offlinePath, success);

    exec(youTubeDlCmd, {
      cwd: paths.offlineStorage,
    }, postDownload);
  });
}

fs.readFile(`${paths.markdownSource}links.md`, 'utf8', (err, data) => {
  if (err) {
    console.log(err);
  }

  exec(`mkdir -p ${paths.offlineStorage}`, () => {
    console.log('Starting offline videos...');
    downloadVideos(
      getLinksFromMarkdownList(data),
      addRepeats(offlineLinks.videos || [])
    );
  });
});
