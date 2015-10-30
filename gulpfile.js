'use-strict';
var gulp = require('gulp'),
	sass  = require('gulp-sass'),
	coffee = require('gulp-coffee'),
	rename = require('gulp-rename'),
	concat = require('gulp-concat'),	
	sourcemaps = require('gulp-sourcemaps'),
	autoprefixer = require('gulp-autoprefixer'),
	gutil = require('gulp-util'),
	path = require('path'),
	del = require('del'),
	uglify = require('gulp-uglify'),
	argv = require('yargs').argv,
	gulpif = require('gulp-if'),
	connect = require('gulp-connect');

var first_run = 0;

var project = {
	name: "agc"
}

// Note: PHP 5.4.0+ comes with a built in web-server
// which can be run from th command line using "php -S localhost:8000" for example

// ================================================
// NOTE: Autoprefixer worrks on .css files only
// ================================================

// =================================================================
// NOTE: When adding a dependency to a gulp task, using "return"
// on that dependency task will ensure it is completed before
// the parent task runs. In the following example, default will
// only run once myDependency has completed:
// gulp.task('defaut', ['myDependency'], function(){
	// default tasks go here...
// });
// gulp.task('myDependency', function(){
//	return gulp.src('src/**/*')
//	.pipe(gulp.dest('public'));
// });
// =================================================================

// ---------------------
// $ gulp
// ---------------------
// This will run all the dependencies listed when gulp is first run
gulp.task('default', ['all-javascripts', 'all-stylesheets', 'templates', 'http-server', 'watch'], function(cb){
	cb();
	gutil.log(gutil.colors.gray("Gulp ready and watching for changes..."));
});



gulp.task('http-server', [], function(){	
	connect.server({
		root: 'app',
		port: 8000,
		livereload: true
	});
});

gulp.task('reloadHTML', function(){
	gulp.src('./app/*.html')
	.pipe(connect.reload());
});
gulp.task('reloadCSS', function(){
	gulp.src('./app/*.css')
	.pipe(connect.reload());
});
gulp.task('reloadJS', function(){
	gulp.src('./app/*.js')
	.pipe(connect.reload());
});

// ---------------------
// $ gulp watch
// ---------------------
// Watch for changes...
gulp.task('watch', function(){

	setTimeout(function(){
		gulp.watch('./app/*.html', ['reloadHTML']);
		gulp.watch('./app/*.css', ['reloadCSS']);
		gulp.watch('./app/*.js', ['reloadJS']);
	}, 5000); // start watching after 5 seconds	


	gulp.watch('./src/templates/*.html', ['templates'])
	.on('change', function(e){
		var fname = path.basename(e.path);
		fileChangeHandler(e, fname);
	});
	// Watch the "src/stylesheets" folder for changes to .scss files
	// Run sass2css task if changes detected
	gulp.watch('./src/stylesheets/*.scss', ['all-stylesheets'])
	.on('change', function(e){
		var fname = path.basename(e.path);
		fileChangeHandler(e, fname);
	});
	// Watch the "src/scripts" folder for changes to .coffee files
	// Run all-javascripts task if changes detected
	gulp.watch(['./src/scripts/*.coffee'], ['all-javascripts'])
	.on('change', function(e){
		var fname = path.basename(e.path);
		fileChangeHandler(e, fname);
	});
	// Watch the "src/scripts" folder for changes to .js files
	// IGNORE bundle.js to avoid conflict with the watch for .coffee files above
	// Run all-javascripts task if changes detected	
	gulp.watch(['./src/scripts/*.js', '!./src/scripts/*bundle.js'], ['all-javascripts'])
	.on('change', function(e){
		var fname = path.basename(e.path);
		fileChangeHandler(e, fname);
	});
	// Watch the "src/packages" folder for changes to .js files
	// Run concat-js-packages task if changes detected	
	gulp.watch('./src/packages/*.js', ['all-js-packages'])
	.on('change', function(e){
		var fname = path.basename(e.path);
		fileChangeHandler(e, fname);
	});
	// Watch the "src/packages" folder for changes to .css files
	// Run concat-css-packages task if changes detected
	gulp.watch('./src/packages/*.css', ['all-css-packages'])
	.on('change', function(e){
		var fname = path.basename(e.path);
		fileChangeHandler(e, fname);
	});
});

// --------------------------
// $ gulp clean-html
// --------------------------
// Clean (delete) all .html and .php files from "app" folder
// Exclude files with "TEST" or "test" in their name
gulp.task('clean-html', [], function(){
	if(first_run >= 2){
		return;
	}else{
		first_run++;
	};
	return del([
		'./app/*.{html,php}',
		'!./app/*{TEST,test}*.{html,php}']);
});

// --------------------
// $ gulp clean-js
// --------------------
gulp.task('clean-js', [], function(){
	if(first_run >= 2){
		return;
	}else{
		first_run++;
	};
	return del([
		'./app/*.js',
		'!./app/*{TEST,test}*.js']);
});

// --------------------
// gulp clean-css
// --------------------
gulp.task('clean-css', [], function(){
	if(first_run >= 2){
		return;
	}else{
		first_run++;
	};
	return del([
		'./app/*.css',
		'!./app/*{TEST,test}*.css']);
});

// ---------------------
// $ gulp templates
// ---------------------
// Clean (delete) all .html and .php files from "app" folder
// Copy all .html and .php files that are located
// in "src/templates" to the "app" folder
gulp.task('templates', ['clean-html'], function(){
	return gulp.src('./src/templates/*.{html,php}')
	.pipe(gulp.dest('./app'));
});

// ---------------------
// $ gulp bundle-coffee
// ---------------------
// Bundle all .coffee files that located in src/scripts
// Only include files that start with "_"
gulp.task('bundle-coffee', function(){
	return gulp.src('./src/scripts/**/_*.coffee')
	.pipe(sourcemaps.init())
	.pipe(concat('bundle.coffee'))
	.pipe(sourcemaps.write())
	.pipe(gulp.dest('./src/scripts/'));
});

// ---------------------
// $ gulp coffee2js
// ---------------------
// Compile bundle.coffee file (created with bundle-coffee task) to agc-application.js
gulp.task('coffee2js', ['bundle-coffee'], function(){
	return gulp.src('./src/scripts/bundle.coffee')
	.pipe(coffee({bare:true})) // compile without top-level function safety wrapper
	.pipe(gulp.dest('./src/scripts'));
});

// -------------------------
// $ gulp all-javascripts
// -------------------------
// Bundle all .js files located in src/scripts
// Only include files that start with "_"
gulp.task('all-javascripts', ['all-js-packages', 'coffee2js'], function(){
	return gulp.src(['./src/scripts/bundle.js', './src/scripts/**/_*.js'])
	.pipe(sourcemaps.init())
	.pipe(concat('agc-application.js'))
	.pipe(sourcemaps.write())
	.pipe(gulp.dest('./app'));	
});

// ---------------------
// $ gulp sass2css
// ---------------------
// Compile bundle.scss file to bundle.css

gulp.task('sass2css', ['all-css-packages'], function(){ // ['clean-css']
	return gulp.src('./src/stylesheets/bundle.scss')
	.pipe(sourcemaps.init())
	.pipe(sass())
	//.pipe(sass({outputStyle: "compressed"})) // minify?
	.pipe(sourcemaps.write())	
	.pipe(gulp.dest('./src/stylesheets'));
});

// -------------------------
// $ gulp all-stylesheets
// -------------------------
gulp.task('all-stylesheets', ['sass2css'], function(){	
	return gulp.src('./src/stylesheets/bundle.css')
	.pipe(sourcemaps.init())
	.pipe(autoprefixer()) // Add browser specific prefixes
	.pipe(rename(function(path){
		path.basename = project.name + '-application';
	}))
	.pipe(sourcemaps.write())
	.pipe(gulp.dest('./app'));
});

// ----------------------------
// $ gulp all-js-packages
// ----------------------------
// Bundle all third-party JavaScript into "app/packages.js"
// IMPORTANT NOTE: jQuery MUST be at the START of packages.js
// and is loaded from a separate folder first for this reason
gulp.task('all-js-packages', ['clean-js'], function(){
	return gulp.src(['./src/packages/jquery/*.js', './src/packages/*.js'])
	.pipe(sourcemaps.init())
	.pipe(concat('packages.js'))
	.pipe(gulpif(argv.env != "dev", uglify()))
	.pipe(sourcemaps.write())	
	.pipe(gulp.dest('./app'));
	console.log(argv.env);
});
// ----------------------------
// $ gulp all-css-packages
// ----------------------------
// Bundle all third-party CSS into "app/packages.css"
gulp.task('all-css-packages', ['clean-css'], function(){
	return gulp.src('./src/packages/*.css')
	.pipe(sourcemaps.init())
	.pipe(concat('packages.css'))	
	.pipe(sourcemaps.write())	
	.pipe(gulp.dest('./app'));
});

function fileChangeHandler(e, fname){
	fname.match('.js') ? bgColor = "bgMagenta" : fname.match('.css') ? bgColor = "bgGreen" : bgColor = "bgCyan";
	bgColor == "bgCyan" ? color = "black" : color = "white";
	setTimeout(function(){
		gutil.log("file: " + gutil.colors[bgColor][color](" " + fname + " ") + " was " + e.type);
	}, 1250);		
};

function errorHandler(e){
	gutil.log(e.name + ":" + e.message + " in " + e.filename);
};