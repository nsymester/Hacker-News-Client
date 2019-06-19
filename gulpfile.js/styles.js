const { watch, task, src, dest, series, parallel } = require('gulp');

const $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'gulp.*', '*'],
  replaceString: /\bgulp[-.]/,
  rename: {
    'gulp-strip-debug': 'stripDebug',
    'fancy-log': 'log',
    'postcss-scss': 'syntax_scss',
    'postcss-reporter': 'reporter'
  },
  scope: ['devDependencies']
});

const devBuild = process.env.NODE_ENV !== 'production';
const pkg = require('../package.json');
const { arg } = require('./utils');

let sassConfig = {
  style: 'nested',
  comments: false
};

const testFile = arg.file !== null ? arg.file : pkg.paths.stylesheets.src;

/**
 * @desc compile sass files and minify, and reload browser
 */
function css(cb) {
  const postCssOpts = [$.autoprefixer()];

  if (!devBuild) {
    sassConfig.style = 'compressed';
    sassConfig.comments = false;
  }

  src(pkg.paths.stylesheets.src)
    .pipe($.if(devBuild, $.sourcemaps.init()))
    .pipe(
      $.sass({
        outputStyle: sassConfig.style,
        imagePath: 'images/',
        sourceComments: sassConfig.comments,
        errLogToConsole: true
      }).on('error', $.log)
    )
    .pipe($.postcss(postCssOpts))
    .pipe(
      $.if(
        devBuild,
        $.sourcemaps.write('maps', {
          includeContent: true
        })
      )
    )
    .pipe(dest('./dist/css'))
    .pipe($.size());

  cb();
}

function analyse(cb) {
  src(testFile).pipe(
    $.postcss([$.stylelint(), $.reporter()], {
      syntax: $.syntax_scss
    })
  );

  cb();
}

exports.build = css;

exports.cssAnalyse = analyse;
