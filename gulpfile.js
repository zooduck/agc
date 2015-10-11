var gulp = require('gulp'),
	sass  = require('gulp-sass'),
	coffee = require('gulp-coffee'),
	rename = require('gulp-rename'),
	concat = require('gulp-concat'),	
	sourcemaps = require('gulp-sourcemaps'),
	util = require('gulp-util');	


var sassFiles = "src/stylesheets/*.scss";
var coffeeFiles = "src/scripts/*.coffee";

function fileChangeHandler(e, fname){
	console.log("file: " + fname + " was " + e.type);
	console.log(util.log);
};

// ---------------------
// $ gulp
// ---------------------
// This will run all the dependencies listed when gulp is first run
gulp.task('default', [
	'watch',
	'bundleCoffee',
	'coffee2js',
	'sass2css']
);

// ---------------------
// $ gulp watch
// ---------------------
// Watch for changes in files and compile or concatenate as required
gulp.task('watch', function(){
	gulp.watch(sassFiles, ['sass2css'])
	.on('change', function(e){
		var fname = e.path.substr(e.path.lastIndexOf("\\") + 1);
		fileChangeHandler(e, fname);
	});
	gulp.watch(coffeeFiles, ['bundleCoffee', 'coffee2js'])
	.on('change', function(e){
		var fname = e.path.substr(e.path.lastIndexOf("\\") + 1);
		fileChangeHandler(e, fname);
	})
});

// ---------------------
// $ gulp bundleCoffee
// ---------------------
// Bundle all .coffee files that are located
// in src/scripts and start with an underscore
gulp.task('bundleCoffee', function(){
	return gulp.src('src/scripts/**/_*.coffee')
	.pipe(sourcemaps.init())
	.pipe(concat('bundle.coffee'))
	.pipe(sourcemaps.write())
	.pipe(gulp.dest('src/scripts/'))
});

// ---------------------
// $ gulp coffee2js
// ---------------------
// Compile bundle.coffee file to .js
gulp.task('coffee2js', function(){
	return gulp.src('src/scripts/bundle.coffee')
	.pipe(coffee({bare:true})) // compile without top-level function safety wrapper
	.pipe(rename(function(path){
		path.basename = 'agc-application'
	}))
	.pipe(gulp.dest('app'))
});


// ---------------------
// $ gulp sass2css
// ---------------------
// Compile main .scss file to .css
gulp.task('sass2css', function(){
	setTimeout(function(){
		// Note: timeout necessary because of 
		// @import lag in main.scss 
		return gulp.src('src/stylesheets/bundle.scss')
		.pipe(sourcemaps.init())
		.pipe(sass())
		.pipe(sourcemaps.write())
		.pipe(rename(function(path){
			path.basename='agc-stylesheet'
		}))	
		.pipe(gulp.dest('app'));
	}, 100);	
});