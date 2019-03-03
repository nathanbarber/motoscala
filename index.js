const express = require("express"),
    contentful = require("contentful"),
    bp = require("body-parser"),
    crypto = require("crypto"),
    fs = require("fs-extra"),
    sv = require("serve-favicon"),
    { DBUtil } = require("./src/db/db_util"),
    server = {
        login: require("./src/server/server.login"),
        signup: require("./src/server/server.signup"),
        validateEmail: require("./src/server/server.validate-email"),
        makeLog: require("./src/server/server.make-log"),
        listLog: require("./src/server/server.list-log"),
        dumpLog: require("./src/server/server.dump-log"),
        deleteLog: require("./src/server/server.delete-log"),
        getMedia: require("./src/server/server.get-media"),
        makeEntry: require("./src/server/server.make-entry"),
        updateEntry: require("./src/server/server.update-entry"),
        deleteEntry: require("./src/server/server.delete-entry"),
        helper: require("./src/server/helper")
    }
    dist = `${__dirname}/dist`,
    PORT = 8080;

var db = new DBUtil();

var app = express()
    .use(express.static(dist))
    .use("/jquery", express.static(`${__dirname}/node_modules/jquery/dist/jquery.js`))
    .use("/media", express.static(`${__dirname}/fstore`))
    .use(bp.json({limit: '10mb'}))
    .use(bp.urlencoded({limit: '10mb', extended: false}))
    .use((req, res, next) => {
        if(req.body.logname) req.body.logname = server.helper.encodify(req.body.logname);
        if(req.body.description) req.body.description = server.helper.encodify(req.body.description);
        if(req.body.etitle) req.body.etitle = server.helper.encodify(req.body.etitle);
        if(req.body.etext) req.body.etext = server.helper.encodify(req.body.etext);
        next();
    })
    .use(sv(`${__dirname}/icon.png`));

app.listen(PORT, () => {
    console.log("App running on " + PORT);
});

app.post("/login", server.login);
app.post("/signup", server.signup);
app.get("/validate-email", server.validateEmail);
app.post("/make-log", server.makeLog);
app.get("/list-log", server.listLog);
app.get("/dump-log", server.dumpLog);
app.post("/delete-log", server.deleteLog);
app.get("/get-media", server.getMedia);
app.post("/make-entry", server.makeEntry);
app.post("/update-entry", server.updateEntry);
app.post("/delete-entry", server.deleteEntry);