/* jshint esnext:true */
// generated on 2015-09-14 using generator-gulp-webapp 1.0.3
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import bS from 'browser-sync';
import del from 'del';
import {stream as wiredep} from 'wiredep';
import mainBowerFiles from 'main-bower-files';

const $ = gulpLoadPlugins();
const browserSync = bS.create();
const reload = browserSync.reload;

var loc = 'http://localhost:7000';

var minify = true;

gulp.task('disable-minify', () => {
    minify = false;
});

gulp.task('styles', () => {
    return gulp.src('src/styles/*.scss')
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.sass.sync({
            outputStyle: 'expanded',
            precision: 10,
            includePaths: ['.2']
        }).on('error', $.sass.logError))
        .pipe($.if(!browserSync.active && minify, $.cssnano()))
        .pipe($.autoprefixer({browsers: ['last 1 version']}))
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest('static/themes/styles'))
        .pipe(browserSync.stream({match: '**/*.css'}));
});

function lint(files, options) {
    return () => {
        return gulp.src(files)
            .pipe(reload({stream: true, once: true}))
            .pipe($.jshint(options))
            .pipe($.jshint.reporter('jshint-stylish'))
            .pipe($.if(!browserSync.active, $.jshint.reporter('fail')));
    };
}

gulp.task('lint', lint('src/scripts/**/*.js'));

gulp.task('scripts', () => {
    return gulp.src('src/scripts/**/*.js')
        .pipe($.if(!browserSync.active && minify, $.uglify()))
        .pipe(gulp.dest('static/themes/scripts'));
});

gulp.task('vendor', () => {
    var jsFilter = $.filter('**/*.js', {restore: true}),
        cssFilter = $.filter('**/*.css', {restore: true}),
        imageFilter = $.filter('**/*.{png,gif,jpeg,jpg,JPEG}', {restore: true}),
        fontFilter = $.filter('**/*.{eot,svg,ttf,woff,woff2}', {restore: true});
    return gulp.src(mainBowerFiles().concat('src/vendor/**/*'))
        .pipe(jsFilter)
        .pipe($.sourcemaps.init())
        .pipe($.concat('vendor.js'))
        .pipe($.if(!browserSync.active && minify, $.uglify()))
        .pipe($.sourcemaps.write('.'))
        .pipe($.size({title: 'Vendor JS', gzip: true}))
        .pipe(gulp.dest('static/themes/scripts'))
        .pipe(jsFilter.restore)

        .pipe(cssFilter)
        .pipe($.sourcemaps.init())
        .pipe($.concat('vendor.css'))
        .pipe($.if(!browserSync.active && minify, $.cssnano()))
        .pipe($.sourcemaps.write('.'))
        .pipe($.size({title: 'Vendor CSS', gzip: true}))
        .pipe(gulp.dest('static/themes/styles'))
        .pipe(cssFilter.restore)

        .pipe(imageFilter)
        .pipe($.if($.if.isFile, $.cache($.imagemin({
            progressive: true,
            interlaced: true,
            // don't remove IDs from SVGs, they are often used
            // as hooks for embedding and styling
            svgoPlugins: [{cleanupIDs: false}]
        })).on('error', function (err) {
            console.log(err);
            this.end();
        })))
        .pipe($.size({title: 'Vendor Images', gzip: true}))
        .pipe(gulp.dest('static/themes/images'))
        .pipe(imageFilter.restore)

        .pipe(fontFilter)
        .pipe($.size({title: 'Vendor Fonts', gzip: true}))
        .pipe(gulp.dest('static/themes/fonts'));
});

gulp.task('images', () => {
    return gulp.src('src/images/**/*')
        .pipe($.if($.if.isFile, $.cache($.imagemin({
            progressive: true,
            interlaced: true,
            multipass: true,
            optimizationLevel: 7,
            // don't remove IDs from SVGs, they are often used
            // as hooks for embedding and styling
            svgoPlugins: [{cleanupIDs: false}]
        }))
            .on('error', function (err) {
                console.log(err);
                this.end();
            })))
        .pipe(gulp.dest('static/themes/images'));
});

gulp.task('extras', () => {
    return gulp.src([
        'src/*.*',
        '!src/*.html'
    ], {
        dot: true
    }).pipe(gulp.dest('static/themes'));
});

gulp.task('clean', del.bind(null, ['.tmp', 'static/themes/']));

//gulp.task('serve:otap', () => {
//    loc = 'http://themes-cms-backend.ip.otap-t.vacansoleil.local/';
//    gulp.start('serve');
//});

gulp.task('serve', ['styles', 'images', 'vendor'], () => {
    browserSync.init({
        notify: false,
        open: false,
        proxy: {
            target: loc,
            ws: true
        }
    });

    gulp.watch([
        'templates/**/*.html',
        'src/scripts/**/*.js',
        'src/images/**/*',
        '.tmp/fonts/**/*'
    ]).on('change', reload);

    gulp.watch('src/scripts/**/*.js', ['lint', 'scripts']);
    gulp.watch('src/images/**/*', ['images']);
    gulp.watch('src/styles/**/*.scss', ['styles']);
    gulp.watch('bower.json', ['vendor']);
});

/**
 * Create dummy task for PRD. Can be adapted later.
 */
gulp.task('build:prd', () => {
    gulp.start('default');
});

/**
 * Create dummy task for acc. Can be adapted later.
 */
gulp.task('build:acc', () => {
    gulp.start('default');
});

gulp.task('build:tst', ['disable-minify'], () => {
    gulp.start('default');
});

gulp.task('build', ['disable-minify', 'lint', 'scripts', 'vendor', 'styles', 'images', 'extras'], () => {
    return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', ['clean'], () => {
    gulp.start('build');
});
