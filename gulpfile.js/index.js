const { watch, task, src, dest, series, parallel } = require('gulp');
const { js } = require('./scripts');
const css = require('./styles');
const { server, reload } = require('./server');

function html(cb) {
  src('src/*.html').pipe(dest('dist'));
  cb();
}

exports.css = css.build;
exports.js = js;

exports.server = server;
exports.analyse = css.cssAnalyse;

exports.build = series(css.build, js, html);

exports.default = parallel(js, css.build, server, watching);

function watching() {
  watch('src/stylesheets/**/*.scss', series(css.build, reload));
  watch('src/scripts/**/*.js', series(js, reload));
  watch('src/*.html', series(html, reload));
}
