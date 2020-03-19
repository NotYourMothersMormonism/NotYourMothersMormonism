/*
 * MIT License
 *
 * Copyright (c) 2020 Jared Rummler
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const gulp = require('gulp');
const browserSync = require('browser-sync');
const sass = require('gulp-sass');
const prefix = require('gulp-autoprefixer');
const cp = require('child_process');
const cssnano = require('gulp-cssnano');
const ghPages = require('gulp-gh-pages');

// noinspection DuplicatedCode
const jekyll = process.platform === 'win32' ? 'jekyll.bat' : 'jekyll';

const messages = {
  jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

/**
 * Build the Jekyll Site
 */
gulp.task('jekyll-build', function (done) {
  browserSync.notify(messages.jekyllBuild);
  return cp.spawn(jekyll, ['build'], {stdio: 'inherit'})
    .on('close', done);
});

/**
 * Rebuild Jekyll & do page reload
 */
gulp.task('jekyll-rebuild', gulp.series('jekyll-build', function () {
  browserSync.reload();
}));

/**
 * Compile files from _scss into both _site/css (for live injecting) and site (for future jekyll builds)
 */
gulp.task('sass', function () {
    return gulp.src('assets/scss/style.scss')
      .pipe(sass({
          includePaths: ['scss'],
          onError: browserSync.notify
      }))
      .pipe(prefix(['last 3 versions'], {cascade: true}))
      .pipe(cssnano())
      .pipe(gulp.dest('_site/assets/css'))
      .pipe(browserSync.reload({stream: true}))
      .pipe(gulp.dest('assets/css'));
});

/**
 * Wait for jekyll-build, then launch the Server
 */
gulp.task('browser-sync', gulp.series('sass', 'jekyll-build', function() {
    browserSync({
        server: {
            baseDir: '_site'
        },
        notify: false
    });
}));


/**
 * Watch scss files for changes & recompile
 * Watch html/md files, run jekyll & reload BrowserSync
 */
gulp.task('watch', function () {
  gulp.watch(['assets/scss/*.scss', 'assets/scss/*/*.scss'], ['sass']);
  gulp.watch(['*.html', '_layouts/*.html', '_posts/*'], ['jekyll-rebuild']);
});

gulp.task('deploy', function() {
    return gulp.src('dist/**/*', {dot: true})
      .pipe(ghPages());
});

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site, launch BrowserSync & watch files.
 */
gulp.task('default', gulp.series('browser-sync', 'watch'));
