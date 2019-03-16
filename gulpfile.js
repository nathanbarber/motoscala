const gulp = require('gulp'),
    less = require('gulp-less'),
    html = require('gulp-minify-html'),
    css = require('gulp-csso'),
    concat = require('gulp-concat'),
    fs = require('fs'),
    del = require("del"),
    nodemon = require("gulp-nodemon"),
    zip = require('gulp-zip'),
    spawn = require("child_process").spawn,
    build = `${__dirname}/client`,
    prod = `${__dirname}/dist`,
    node = undefined;

gulp.task("clean", () => {
    del.sync([__dirname + "/prod", "!" + __dirname])
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
    return gulp.src(build + "/views/*.html")
        .pipe(gulp.dest(prod + "/views"))
})

gulp.task("build", ["clean", "css", "appjs", "combinejs", "lib", "html", "viewshtml"])

gulp.task("nodemon", () => {
    gulp.run("build");
    nodemon({
        ext: "js css html",
        ignore: prod
    }).on("restart", ['build'])
});

// Deploytime

gulp.task("collect", () => {
    let bundlename = `${__dirname}/MotoScala-${require('./package.json').version}`;
    del.sync([`${__dirname}/Motoscala-Dist.zip`, `!${__dirname}`]);
    gulp.src([
        `${__dirname}/*.json`,
        `${__dirname}/index.js`,
        `${__dirname}/icon.png`,
        `${__dirname}/.env`
    ]).pipe(gulp.dest(bundlename));
    gulp.src(`${__dirname}/src/**`)
        .pipe(gulp.dest(bundlename + "/src"));
    gulp.src(`${__dirname}/dist/**`)
        .pipe(gulp.dest(bundlename + "/dist"));
});

gulp.task("compress", () => {
    let bundlename = `${__dirname}/MotoScala-${require('./package.json').version}/**`;
    gulp.src(bundlename)
        .pipe(zip("Motoscala-Dist.zip"))
        .pipe(gulp.dest(`${__dirname}`));
});

gulp.task("cdf", () => {
    let bundlename = `${__dirname}/MotoScala-${require('./package.json').version}`;
    del.sync([bundlename, `!${__dirname}`]);
});