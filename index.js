const express = require("express"),
    pg = require("pg"),
    multer = require("multer"),
    contentful = require("contentful"),
    bp = require("body-parser"),
    crypto = require("crypto"),
    fs = require("fs"),
    sv = require("serve-favicon"),
    dist = `${__dirname}/dist`,
    PORT = 8080;

var app = express()
        .use(express.static(dist))
        .use("/jquery", express.static(`${__dirname}/node_modules/jquery/dist/jquery.js`))
        .use(bp.json())
        .use(bp.urlencoded({extended: false})),
    upload = multer({
        storage: multer.diskStorage({
            destination: (req, file, cb) => {
                let type = req.params.type,
                    user = req.params.username, 
                    path = `${__dirname}/fstore/${user}`
                fs.mkdirSync(path);
                cb(null, path);
            },
            filename: (req, file, cb) => {
                let logid = req.params.logid,
                    assetid = req.params.assetid,
                    ext = file.originalname.split(".").pop();
                cb(null, `${logid}-${assetid}.${ext}`);
            }
        })
    });

app.listen(PORT, () => {
    console.log("App running on " + PORT);
})

app.post("/login", async (req, res) => {
    // Check for password match
    if(!req.body.username || !req.body.password) {
        return res.send(403, {
            "message": "Invalid request"
        });
    }
    if(await userExists(req.body.username) == false || await userValidate(req.body.username, req.body.password) == false) {
        return res.send(403, {
            "message": "Incorrect username / password."
        })
    }
    // Password match - generate token
    var tokenbuffer = await generateAccessToken(req.body.username);
    if(tokenbuffer == false) {
        return res.send(500, {
            "message": "Error generating tokenbuffer"
        })
    }
    return res.send(200, {
        "message": "Login successful!",
        "token": tokenbuffer
    });
});

app.post("/signup", (req, res) => {
    // Check for password match
    if(!req.body.username || !req.body.password) {
        return res.send(403, {
            "message": "Invalid request"
        });
    }
    if(await userExists(req.body.username) == false || await userValidate(req.body.username, req.body.password) == false) {
        return res.send(403, {
            "message": "Incorrect username / password."
        })
    }
});

app.get("/list-log", (req, res) => {

});

app.get("/dump-log", (req, res) => {

});

app.post("/make-log", (req, res) => {

});

app.post("/delete-log", (req, res) => {

})

app.post("/log-make-entry", (req, res) => {

});

app.post("/log-make-asset", upload.single(), (req, res) => {

});

app.post("/log-update-entry", (req, res) => {

});

app.post("/log-update-asset", upload.single(), (req, res) => {

});

app.post("/log-delete-entry", (req, res) => {

});

app.post("/log-delete-asset", (req, res) => {

});


// DB HELPER METHODS


function userExists(username) {
    return new Promise(async (resolve, reject) => {
        let psql = new pg.Client();
        await psql.connect();
        var res = await psql.query(`select exists(select 1 from users where username='${username}')`),
            exists = res.rows[0].exists;
        await psql.end();
        resolve(exists);
    });
}

function userCreate(username, password, email, telephone) {
    return new Promise(async (resolve, reject) => {
        let psql = new pg.Client();
        await psql.connect();
        var res = await psql.query(
                `insert into users(username, password, email, telephone) values (
                    '${username}',
                    '${password}',
                    '${email || ''}',
                    '${telephone || ''}'
                )`
            );
        await psql.end();
        if(res.rowCount == 1) return resolve(true);
        return resolve(false);
    })
}

function userValidate(username, password, email) {
    return new Promise(async (resolve, reject) => {
        let psql = new pg.Client();
        await psql.connect();
        var res = await psql.query(`select password from users where username='${username}'`);
        await psql.end();
        if(res.rows[0].password == password) return resolve(true);
        return resolve(false);
    });
}

function generateAccessToken(username) {
    return new Promise(async (resolve, reject) => {
        let tokenbuffer = crypto.randomBytes(64).toString("base64");
        let psql = new pg.Client();
        await psql.connect();
        var res = await psql.query(`update users set token='${tokenbuffer}' where username='${username}'`);
        await psql.end();
        if(res.rowCount == 1) return resolve(tokenbuffer);
        return resolve(false);
    });
}



userExists("foo").then(res => { console.log(res) })
userCreate("bar", "foo").then(res => { console.log(res) });
userValidate("foo", "bar").then(res => { console.log(res) });
generateAccessToken("foo").then(res => { console.log(res) });