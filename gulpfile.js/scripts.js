const { watch, task, src, dest, series, parallel } = require('gulp');

const $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'gulp.*', '*'],
  replaceString: /\bgulp[-.]/,
  rename: {
    'gulp-strip-debug': 'stripDebug',
    'fancy-log': 'log',
    'vinyl-source-stream': 'source',
    'vinyl-buffer': 'buffer',
    'event-stream': 'es'
  },
  scope: ['devDependencies']
});

let isWatching = false;
const devBuild = process.env.NODE_ENV !== 'production';
if (devBuild) {
  isWatching = true;
}

/**
 * @desc bundles js into multiple files and watches for changes
 */
function js(cb) {
  let files = ['./src/scripts/index.js'];

  // start fresh
  $.del.sync(['./js/index.bundle.js']);

  const tasks = files.map(function(entry) {
    let bundler = null;

    if (devBuild) {
      bundler = $.browserify({
        entries: entry, // Entry point
        debug: true // Output sourcemaps
      }).transform($.babelify.configure());
      // .transform($.babelify, {
      //   presets: ['@babel/preset-env']
      // });
    } else {
      bundler = $.browserify({
        entries: entry, // Entry point
        debug: true // Output sourcemaps
      })
        .transform($.babelify, {
          presets: ['@babel/preset-env']
        })
        .transform($.uglifyify, { global: true });
    }

    const bundle = function() {
      return (
        bundler
          .bundle() // Start bundle
          .on('error', function(err) {
            // print the error (can replace with gulp-util)
            $.log.error(err.message);
            // end this stream
            this.emit('end');
          })
          .pipe($.source(entry))
          .pipe($.buffer())
          // rename them to have "bundle as postfix"
          .pipe(
            $.rename({
              dirname: '', // don't include full path
              extname: '.bundle.js' // Output file
            })
          )
          .pipe(dest('./dist/js')) // Output path
      );
    };

    if (isWatching) {
      bundler = $.watchify(bundler);
      bundler.on('update', bundle);
    }

    return bundle();
  });

  //create a merged stream
  $.es.merge(tasks).on('end', cb);
}

exports.js = js;
