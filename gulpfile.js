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
    pg = require("pg"),
    prod = `${__dirname}/dist`,
    node = undefined;

gulp.task("clean", () => {
    del.sync([__dirname + "/prod", "!" + __dirname])
})

gulp.task("css", () => {
    return gulp.src(build + "/**/*.css")
        .pipe(css())
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
    return gulp.src(build + "/lib/*")
        .pipe(gulp.dest(prod + "/lib"))
})

gulp.task("indexhtml", () => {
    return gulp.src(build + "/index.html")
        .pipe(gulp.dest(prod))
})

gulp.task("viewshtml", () => {
    return gulp.src(build + "/views/*.html")
        .pipe(gulp.dest(prod + "/views"))
})

gulp.task("build", ["clean", "css", "appjs", "combinejs", "lib", "indexhtml", "viewshtml"])

gulp.task("nodemon", () => {
    gulp.run("build");
    nodemon({
        ext: "js css html",
        ignore: prod
    }).on("restart", ['build'])
})

gulp.task("db-init", async () => {
    let psql = new pg.Client();
    await psql.connect();
    await psql.query(fs.readFileSync(`${__dirname}/schema/init.sql`).toString());
    await psql.end();
});