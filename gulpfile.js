const gulp = require('gulp'),
    less = require('gulp-less'),
    html = require('gulp-minify-html'),
    css = require('gulp-csso'),
    concat = require('gulp-concat'),
    fs = require('fs'),
    del = require("del"),
    nodemon = require("gulp-nodemon"),
    spawn = require("child_process").spawn,
    build = `${__dirname}/client`,
    prod = `${__dirname}/dist`,
    node = undefined;

gulp.task("clean", () => {
    return del.sync([__dirname + "/dist", "!" + __dirname])
})

gulp.task("css", () => {
    return gulp.src(build + "/**/*.css")
        .pipe(concat("combined.css"))
        .pipe(gulp.dest(prod))
})

gulp.task("appjs", () => {
    return gulp.src(build + "/app.js")
        .pipe(gulp.dest(prod))
})

gulp.task("combinejs", () => {
    return gulp.src([build + "/**/*.js", "!app.js"])
        .pipe(concat("combined.js"))
        .pipe(gulp.dest(prod))
})

gulp.task("lib", () => {
    return gulp.src(build + "/lib/**/*")
        .pipe(gulp.dest(prod + "/lib"))
})

gulp.task("html", () => {
    return gulp.src(build + "/*.html")
        .pipe(gulp.dest(prod))
})

gulp.task("viewshtml", () => {
    return gulp.src(build + "/views/**/*.html")
        .pipe(gulp.dest(prod + "/views"))
})

gulp.task("build", gulp.parallel("clean", "css", "appjs", "combinejs", "lib", "html", "viewshtml"));

gulp.task("nodemon", () => {
    nodemon({
        ext: "js css html",
        ignore: prod
    }).on("restart", ['build'])
});