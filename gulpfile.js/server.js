const { src, dest, series, parallel } = require('gulp');

const browserSync = require('browser-sync').create();

const isWin = process.platform === 'win32';

/**
 * @desc browserSync, start the server
 */
function fBrowserSync(cb) {
  // check for operating system
  //  - for WINDOWS 10 use "Chrome"
  //  - for MAC OS X use "Google Chrome"
  let browser = isWin ? 'Chrome' : 'Google Chrome';
  browserSync.init({
    server: {
      baseDir: 'dist',
      directory: false
    },
    // proxy: 'localhost:500',
    browser: browser,
    open: true
  });

  cb();
}

function reload(cb) {
  browserSync.reload();
  cb();
}

exports.server = fBrowserSync;
exports.reload = reload;
