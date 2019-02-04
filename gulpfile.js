
const { series, parallel, watch, src, dest } = require('gulp');
// const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
//const babel = require('gulp-babel');
const concat = require('gulp-concat');
const rigger = require('gulp-rigger');
const copy = require('gulp-copy');
const uglify = require('gulp-uglify');
const cleanCss = require('gulp-clean-css');
const imagemin = require('gulp-imagemin');
const plumber = require('gulp-plumber');
const sourcemap = require('gulp-sourcemaps');
const del = require('del');
const browserSync = require('browser-sync');
const bs = require('browser-sync').create;
const reload = browserSync.reload;

const path = {
    input: 'src/*',
    output: 'build/',
    dist: 'dist/',
    img: {
        dist: 'dist/img/',
        input: 'src/img/**/*.*',
        output: 'build/img/'
    },
    scripts: {
        dist: 'dist/js/',
        input: 'src/js/**/*.*',
        output: 'build/js/'
    },
    styles: {
        dist: 'dist/css/',
        output: 'build/css/',
        input:{
            all: 'src/styles/**/*.{scss,sass}',
            main: 'src/styles/main.scss',
        }
    },
    fonts: {
        dist: 'dist/fonts/',
        input: 'src/fonts/**/*.*',
        output: 'build/fonts/'
    },
    pages:{
        input:{
            all: 'src/pages/**/*.html',
            pages: 'src/pages/*.html',
            components: 'src/pages/components/*.html'
        },
        output: 'build/',
        dist: 'dist/'
    }
};

const config = {
    server: {
        baseDir: path.output
    },
    //https: true,
    //tunnel: 'montaro-dev',
    online: true,
    port: 3000,
    logLevel: "debug"
};

function server() {
    browserSync(config)
}

function cleanBuild() {
    return del(['build'])
}

function cleandist() {
    return del(['dist'])
}

function htmlBuild() {
    return src(path.pages.input.pages)
        .pipe(dest(path.pages.output))
        .pipe(reload({stream: true}))
}


function stylesBuild() {
    return src(path.styles.input.main)
        .pipe(plumber())
        .pipe(sourcemap.init())
        .pipe(sass({
            outputStyle: 'expanded'
        }).on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 version', '> 1%'],
            cascade: true,
            remove: true
        }))
        .pipe(sourcemap.write('./'))
        .pipe(dest(path.styles.output))
        .pipe(reload({stream: true}))
}

function imgBuild() {
    return src(path.img.input)
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.jpegtran({progressive: true}),
            imagemin.optipng({optimizationLevel: 5})
        ]))
        .pipe(dest(path.img.output))
        .pipe(reload({stream: true}))
}

function pug() {
    return src('src/pages/*.pug')
        .pipe(plumber())
        .pipe(pug({pretty: true}))
        .pipe(dest(path.pages.output))
        // .pipe(reload({stream: true}));
}

function scriptsBuild() {
    return src(path.scripts.input)
        .pipe(sourcemap.init())
        .pipe(plumber())
        //.pipe(babel())
        //.pipe(uglify())
        // .pipe(concat('main.min.js'))
        // .pipe(sourcemap.write('./'))
        .pipe(dest(path.scripts.output))
        .pipe(reload({stream: true}))
}

function fontsBuild() {
    return src(path.fonts.input)
        .pipe(dest(path.fonts.output))
        .pipe(reload({stream: true}))
}

watch(path.styles.input.all, stylesBuild);
watch(path.img.input, imgBuild);
watch(path.pages.input.all, htmlBuild);
watch(path.scripts.input, scriptsBuild);
watch(path.fonts.input, fontsBuild);

exports.build = series(
    cleanBuild,
    stylesBuild,
    htmlBuild,
    fontsBuild,
    scriptsBuild,
    imgBuild,
    server,
);



