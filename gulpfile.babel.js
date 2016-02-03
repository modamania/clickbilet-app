'use strict';

import gulp from 'gulp';
import sass from 'gulp-sass';
import autoprefixer from 'gulp-autoprefixer';
import imagemin from 'gulp-imagemin';
import svgmin from 'gulp-svgmin';
import connect from 'gulp-connect';
import concat from 'gulp-concat';
import cache from 'gulp-cache';
import plumber from 'gulp-plumber';
import size from 'gulp-size';
import babel from 'gulp-babel';
import rimraf from 'gulp-rimraf';
import jade from 'gulp-jade';

// Paths
const path = {
	sass: 'src/sass/**/*.{sass,scss}',
	js: 'src/js/**/*.js',
	images: 'src/assets/images/**/*.{jpg,jpeg,png}',
	svg: 'src/assets/svg/**/*.svg',
	jade: 'src/templates/*.jade',
	vendor: 'bower_components'
};

// Server settings
const server = {
	host: '0.0.0.0',
	port: '4200'
};

// Autoprefixer settings
const compatibility = [
    'ie >= 10',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
];

gulp.task('jade', () => {
	gulp.src(path.jade)
		.pipe(plumber())
		.pipe(jade({ pretty: true }))
		.pipe(gulp.dest('dist'))
		.pipe(connect.reload());
});

gulp.task('sass', () => {
	return gulp.src(path.sass)
		.pipe(plumber())
		.pipe(sass({
			outputStyle: 'expanded'
		})
		.on('error', sass.logError))
		.pipe(autoprefixer({ browsers: compatibility }))
		.pipe(gulp.dest('dist/css'))
		.pipe(connect.reload())
		.pipe(size({title: 'styles'}));
});

gulp.task('js', () => {
	return gulp.src(path.js)
		.pipe(plumber())
		.pipe(babel())
		.pipe(concat('main.js'))
		.pipe(gulp.dest('dist/js'))
		.pipe(connect.reload());
});

gulp.task('images', () => {
	return gulp.src(path.images)
		.pipe(cache(imagemin({
			optimizationLevel: 7,
			progressive: true,
			interlaced: true,
      		multipass: true,
      		svgoPlugins: [{ removeViewBox: true }]
		})))
		.pipe(gulp.dest('dist/assets/images'))
		.pipe(connect.reload())
		.pipe(size({title: 'images'}));
});

gulp.task('svg', () => {
	return gulp.src(path.svg)
		.pipe(plumber())
		.pipe(svgmin({
			js2svg: {
				pretty: true
			}
		}))
		.pipe(gulp.dest('dist/assets/svg'))
		.pipe(connect.reload())
		.pipe(size({title: 'svg'}));
});

gulp.task('cssVendor', () => {
	return gulp.src([
			`${path.vendor}/normalize-css/normalize.css`
		])
		.pipe(plumber())
		.pipe(concat('vendor.css'))
		.pipe(gulp.dest('dist/css'))
		.pipe(connect.reload())
		.pipe(size({title: 'Vendor styles'}));
});

gulp.task('jsVendor', () => {
	return gulp.src([
			`${path.vendor}/jquery-2.1.4.min/index.js`
		])
		.pipe(plumber())
		.pipe(concat('vendor.js'))
		.pipe(gulp.dest('dist/js'))
		.pipe(connect.reload());
});

gulp.task('clean', (cb) => rimraf (['.tmp', 'dist/*'], cb));

gulp.task('build', ['jade','sass','js','cssVendor','jsVendor','images','svg']);

gulp.task('server', () => {
	return connect.server({
		host: server.host,
		port: server.port,
		livereload: true
	});
});

gulp.task('watch', function() {
	gulp.watch('src/templates/**/*.jade', ['jade']);
	gulp.watch(path.sass, ['sass']);
	gulp.watch(path.js, ['js']);
	gulp.watch(path.images, ['images']);
	gulp.watch(path.svg, ['svg']);

	gulp.watch(`${path.vendor}/**/*.js`, ['cssVendor']);
	gulp.watch(`${path.vendor}/**/*.js`, ['jsVendor']);

	gulp.watch('./bower.json', ['build']);
	gulp.watch('./package.json', ['build']);
	gulp.watch('./gulpfile.babel.js', ['build']);
});

gulp.task('serve', ['clean', 'build', 'server', 'watch']);
