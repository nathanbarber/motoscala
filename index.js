const express = require("express"),
    contentful = require("contentful"),
    bp = require("body-parser"),
    crypto = require("crypto"),
    fs = require("fs-extra"),
    sv = require("serve-favicon"),
    nm = require("nodemailer"),
    createValiateHTML = require("./supporting/email-validate"),
    { DBUtil } = require("./db_util"),
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
            if(req.body.logname) req.body.logname = encodify(req.body.logname);
            if(req.body.description) req.body.description = encodify(req.body.description);
            if(req.body.etitle) req.body.etitle = encodify(req.body.etitle);
            if(req.body.etext) req.body.etext = encodify(req.body.etext);
            next();
        })
        .use(sv(`${__dirname}/icon.png`));

app.listen(PORT, () => {
    console.log("App running on " + PORT);
})

app.post("/login", async (req, res) => {
    // Check for password match
    if(!req.body.username || !req.body.password) {
        return res.status(403).send({
            "message": "Invalid request"
        });
    }
    if(await db.userExists(req.body.username) == false || (await db.userValidate(req.body.username, req.body.password)).validated == false) {
        return res.status(403).send({
            "message": "Incorrect username / password."
        })
    }
    // Password match - generate token
    var tokenbuffer = await db.generateAccessToken(req.body.username);
    if(tokenbuffer.success == false) {
        return res.status(500).send({
            "message": "Error generating tokenbuffer"
        })
    }
    return res.status(200).send({
        "message": "Login successful!",
        "token": tokenbuffer.token
    });
});

app.post("/signup", async (req, res) => {
    if(!req.body.username || !req.body.password || !req.body.email) {
        return res.status(403).send({
            "message": "Invalid request"
        });
    }
    if(await db.userExists(req.body.username) == true) {
        return res.status(403).send({
            "message": "Username already registered"
        });
    }
    var result = await db.userCreate(req.body.username, req.body.password, req.body.email, req.body.phone || '');
    if(result.success == false) {
        return res.status(500).send({
            "message": "Failed to create a new user"
        });
    }
    // Create hash and redirect user to "Validate Email" page
    let hashResult = await db.createHash(req.body.username);
    if(hashResult.success == false || typeof hashResult.hash != "string") {
        return res.status(500).send({
            "message": "Failed to create a validation hash"
        });
    }
    try {
        let validationTransport = nm.createTransport({
                service: 'gmail',
                auth: {
                    user: 'service.motoscala@gmail.com',
                    pass: 's9ns*72nslPP'
                }
            }),
            message = {
                from: "Motoscala Service <service.motoscala@gmail.com>",
                to: req.body.email,
                subject: "Please validate your email.",
                html: createValiateHTML(req.body.username, hashResult.hash)
            }
        result = await validationTransport.sendMail(message);
        return res.send({
            success: true
        });
    } catch(err) {
        return res.status(500).send({
            "message": "Problem sending validation message. Retry recommended"
        });
    }
});

app.get("/validate-email", async(req, res) => {
    let username = req.query.username,
        token = req.query.token;
    var result = await db.validateHash(username, token);
    if(result.error || !result.success || !result.validated) {
        return res.send(500, {
            "message": "Server error, could not validate."
        });
    }
    return res.redirect(301, "/");
});

app.post("/make-log", async (req, res) => {
    var reqv = await requestValidate([
            [req.body.username, "string"],
            [req.body.token, "string"],
            [req.body.logname, "string"],
            [req.body.description, "string"]
        ], true, res);
    if(reqv != true) return;

    var result = await db.logCreate(req.body.username, req.body.logname, req.body.description);
    if(result.success == false) {
        return res.status(500).send({
            "message": "Failed to create a new log"
        })
    }
    return res.status(200).send({
        "message": "Created a new log!",
        "logid": result.logid
    })
});

app.get("/list-log", async (req, res) => {
    var reqv = await requestValidate([
            [req.query.username, "string"],
            [req.query.token, "string"]
        ], true, res);
    if(reqv != true) return;

    var result = await db.logList(req.query.username);
    if(result.success == false) {
        return res.status(500).send({
            "message": "Error listing logs"
        })
    }
    return res.status(200).send({
        "message": "Successfully got list!",
        "logs": result.logs
    });
});

app.get("/dump-log", async (req, res) => {
    var reqv = await requestValidate([
        [req.query.username, "string"],
        [req.query.token, "string"],
        [req.query.logid, "string"]
    ], true, res);
    if(reqv != true) return;

    var userLogs = await db.logList(req.query.username);
    console.log(userLogs);
    console.log(req.query.logid);
    let decodedLogid = req.query.logid;
    if(userLogs == false || !(userLogs.logs.includes(decodedLogid))) {
        return res.status(404).send({
            "message": "That log does not exist!"
        });
    }
    
    var result = await db.logDump(decodedLogid);
    if(result.success == false) {
        return res.status(500).send({
            "message": "Log dump error"
        })
    }
    return res.status(200).send({
        "message": "Log dump success!",
        "log": decodifyLog(result.log)
    })
});

app.post("/delete-log", async (req, res) => {
    var reqv = await requestValidate([
        [req.query.username, "string"],
        [req.query.token, "string"],
        [req.query.logid, "string"]
    ], true, res);
    if(reqv != true) return;

    var result = await db.logDelete(req.query.username, req.query.logid);
    if(result.success) return res.status(200).send({
        "message": "Log deleted successfully!"
    });
    return res.status(500).send({
        "message": "Log delete failed"
    })
});

app.get("/get-media", (req, res) => {
    try {
        let media = fs.readFileSync(`${__dirname}/fstore${req.query.path}`, "utf-8");
        console.log(media);
        res.send(media);
    } catch(err) {
        res.send({
            "message": "Could not get media",
            "error": err
        });
    }
});

app.post("/make-entry", async (req, res) => {
    var reqv = await requestValidate([
        [req.body.username, "string"],
        [req.body.token, "string"],
        [req.body.logid, "string"],
        [req.body.etitle, "string"],
        [req.body.etext, "string"]
    ], true, res);
    if(reqv != true) return;
    // Store image in fstore
    var mediaHref = '';
    if(req.body.media && typeof req.body.media == "string") {
        let mediaDir = `${__dirname}/fstore/${req.body.username}`;
        mediaHref = `${mediaDir}/${crypto.randomBytes(30).toString("hex")}`
        try {
            fs.mkdirsSync(mediaDir);
            fs.writeFileSync(mediaHref, req.body.media);
        } catch(err) {
            console.log(err);
            return res.status(500).send({
                "message": "Could not write file",
                "error": err
            });
        }
    }
    var result = await db.entryCreate(req.body.logid, req.body.etitle, req.body.etext, mediaHref.split("fstore")[1]);
    if(result.success) return res.status(200).send({
        "message": "Entry created successfully!"
    });
    return res.status(500).send({
        "message": "Entry create failed"
    })
});

app.post("/update-entry", async (req, res) => {
    var reqv = await requestValidate([
        [req.body.username, "string"],
        [req.body.token, "string"],
        [req.body.logid, "string"],
        [req.body.entryid, "string"],
        [req.body.etitle, "string"],
        [req.body.etext, "string"]
    ], true, res);
    if(reqv != true) return;

    var assetHREF = '',
        result = await db.entryUpdate(req.body.logid, req.body.entryid, req.body.etitle, req.body.etext, assetHREF);
    if(result.success) return res.status(200).send({
        "message": "Entry updated successfully!"
    });
    return res.status(500).send({
        "message": "Entry update failed"
    });
});

app.post("/delete-entry", async (req, res) => {
    var reqv = await requestValidate([
        [req.body.username, "string"],
        [req.body.token, "string"],
        [req.body.logid, "string"],
        [req.body.entryid, "string"]
    ], true, res);
    if(reqv != true) return;

    var result = await db.entryDelete(req.body.logid, req.body.entryid);
    if(result.success) return res.status(200).send({
        "message": "Entry deleted successfully!"
    });
    return res.status(500).send({
        "message": "Entry delete failed"
    });
});

// REQUEST HELPER METHODS

async function requestValidate(
    exists,
    validate,
    res
) {
    for(let i of exists) {
        if(Array.isArray(i)) {
            if(i[0] == undefined || i[0] == null || typeof i[0] != i[1]) {
                if(res) return res.status(403).send({
                    "message": "Invalid request"
                });
                return false;
            }
        } else {
            if(i == undefined || i == null) {
                if(res) return res.status(403).send({
                    "message": "Invalid request"
                });
                return false;
            }
        }
    }
    if(validate && ((await db.userExists(exists[0][0])) == false || (await db.verifyAccessToken(exists[0][0], exists[1][0])).validated == false)) {
        if(res) return res.status(403).send({
            "message": "You are not authorized to perform this request"
        });
        return false;
    }
    return true;
}

function encodify(entity) {
    return Buffer.from(entity).toString("hex");
}

function decodify(entity) {
    return Buffer.from(entity, "hex").toString();
}

function decodifyLog(log) {
    try {
        decodifiedLog = JSON.parse(JSON.stringify(log))
        decodifiedLog.name = decodify(decodifiedLog.name);
        decodifiedLog.description = decodify(decodifiedLog.description);
        for(let entry of decodifiedLog.entries) {
            entry.title = decodify(entry.title);
            entry.text = decodify(entry.text);
        }
        return decodifiedLog;
    } catch(err) {
        console.log(err);
        return log;
    }
}