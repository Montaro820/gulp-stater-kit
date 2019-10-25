const gulp = require('gulp'),
      sass = require('gulp-sass'),
      autoPrefixer = require('gulp-autoprefixer'),
      sourcemaps = require('gulp-sourcemaps'),
      pug = require('gulp-pug'),
      del = require('del'),
      plumber = require('gulp-plumber'),
      htmlPrettify = require('gulp-html-prettify'),
      imagemin = require('gulp-imagemin'),
      browserSync = require('browser-sync');

const path = {
    build: 'build/',
    styles: {
        source: 'source/sass/**/*',
        main: 'source/sass/main.sass',
        dest: 'build/css/'
    },
    scripts: {
        source: 'source/js/**/*',
        main: 'source/js/mian.js',
        dest: 'build/js/'
    },
    images: {
        source: 'source/img/**/*',
        dest: 'build/img/'
    },
    fonts: {
        source: 'source/fonts/**/*.*',
        dest: 'build/fonts/'
    },
    html:{
        source: 'source/pug/**/*.*',
        index: 'source/pug/index.pug',
        temp: 'source/html_temp/',
        dest: 'build/'
    },
    other:{
    	source: 'source/other/*',
    	dest: 'build/other/'
    }

};

function clean(){
    return del([path.build]);
}

function serve(done){
    browserSync.init({
        server:{
            baseDir: 'build/'
        },
        port: 3000
    });
    done();
}

function reload(done){
    browserSync.reload();
    done();
}

function styles(){
    return gulp.src(path.styles.main)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        // .pipe(autoPrefixer())
        .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.styles.dest));
}

function markup(){
    return gulp.src(path.html.index)
        .pipe(plumber())
        .pipe(pug({pretty: true}))
        .pipe(gulp.dest(path.html.dest));
}

function prettyHTML(){
    gulp.src(path.html.temp)
    .pipe(prettify({indent_char: ' ', indent_size: 2}))
    .pipe(gulp.dest(path.html.dest))
}

function images(){
    return gulp.src(path.images.source)
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.jpegtran({progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
            })
        ]))
        .pipe(gulp.dest(path.images.dest))
}

//Добавить обработку скриптов
function scripts(){
    return gulp.src(path.scripts.source)
        .pipe(plumber())
        .pipe(gulp.dest(path.scripts.dest))
}

function fonts(){
    return gulp.src(path.fonts.source)
        .pipe(gulp.dest(path.fonts.dest))
}

function copyOther(){
	return gulp.src(path.other.source)
		.pipe(gulp.dest(path.other.dest))
}

function watchFiles(){
    gulp.watch(path.styles.source, gulp.series(styles, reload));
    gulp.watch(path.html.source, gulp.series(markup, reload));
    gulp.watch(path.images.source, gulp.series(images, reload));
    gulp.watch(path.scripts.source, gulp.series(scripts, reload));
    gulp.watch(path.fonts.source, gulp.series(fonts, reload));
}

const watch = gulp.parallel(serve, watchFiles);
const build = gulp.series(
    clean,
    gulp.parallel(styles, markup, images, scripts, fonts, copyOther)
);

exports.watch = watch;
exports.build = build;

exports.styles = styles;
exports.markup = markup;
exports.images = images;
exports.scripts = scripts;
exports.fonts = fonts;