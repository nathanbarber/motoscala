const express = require("express"),
    contentful = require("contentful"),
    bp = require("body-parser"),
    crypto = require("crypto"),
    fs = require("fs"),
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
        .use(bp.json())
        .use(bp.urlencoded({extended: false}))
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
        console.log(result);
        return res.redirect("/send-validate.html");
    } catch(err) {
        return res.status(500).send({
            "message": "Problem sending validation message. Retry recommended"
        });
    }
});

app.get("/validate-email", async(req, res) => {
    let username = req.query.username,
        token = req.query.token;
    res.status(200).send(`Hello ${username} with token ${token}`);
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
        "message": "Created a new log!"
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
    if(userLogs == false || !(userLogs.logs.includes(req.query.logid))) {
        return res.status(404).send({
            "message": "That log does not exist!"
        });
    }
    
    var result = await db.logDump(req.query.logid);
    if(result.success == false) {
        return res.status(500).send({
            "message": "Log dump error"
        })
    }
    return res.status(200).send({
        "message": "Log dump success!",
        "log": result.log
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
})

app.post("/make-entry", async (req, res) => {
    var reqv = await requestValidate([
        [req.body.username, "string"],
        [req.body.token, "string"],
        [req.body.logid, "string"],
        [req.body.etitle, "string"],
        [req.body.etext, "string"]
    ], true, res);
    if(reqv != true) return;

    var assetHREF = '',
        result = await db.entryCreate(req.body.logid, req.body.etitle, req.body.etext, assetHREF);
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
    if(validate && (await db.userExists(exists[0][0]) == false || (await db.verifyAccessToken(exists[0][0], exists[0][1])).validated == false)) {
        if(res) return res.status(403).send({
            "message": "You are not authorized to perform this request"
        });
        return false;
    }
    return true;
}