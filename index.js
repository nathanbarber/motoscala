const express = require("express"),
    pg = require("pg"),
    multer = require("multer"),
    contentful = require("contentful"),
    bp = require("body-parser"),
    crypto = require("crypto"),
    fs = require("fs"),
    sv = require("serve-favicon"),
    { DBUtil } = require("./db_util"),
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

app.post("/signup", async (req, res) => {
    if(!req.body.username || !req.body.password || !req.body.email) {
        return res.send(403, {
            "message": "Invalid request"
        });
    }
    if(await userExists(req.body.username) == true) {
        return res.send(403, {
            "message": "Username already registered"
        })
    }
    var result = await userCreate(req.body.username, req.body.password, req.body.email);
    if(result == false) {
        return res.send(500, {
            "message": "Failed to create a new user"
        })
    }
    return res.send(200, {
        "message": "New user created!"
    })
});

app.post("/make-log", async (req, res) => {
    var reqv = await requestValidate([
            [req.body.username, "string"],
            [req.body.token, "string"],
            [req.body.logname, "string"],
            [req.body.description, "string"]
        ], true, res);
    if(reqv != true) return;

    var result = logCreate(req.body.username, req.body.logname, req.body.description);
    if(result == false) {
        return res.send(500, {
            "message": "Failed to create a new log"
        })
    }
    return res.send(200, {
        "message": "Created a new log!"
    })
});

app.get("/list-log", async (req, res) => {
    var reqv = await requestValidate([
            [req.query.username, "string"],
            [req.query.token, "string"]
        ], true, res);
    if(reqv != true) return;

    var result = await logList(req.query.username);
    if(result == false) {
        return res.send(500, {
            "message": "Error listing logs"
        })
    }
    return res.send(200, {
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

    var userLogs = await logList(req.query.username);
    if(userLogs == false || !(userLogs.logs.includes(req.query.logid))) {
        return res.send(404, {
            "message": "That log does not exist!"
        });
    }
    
    var result = await logDump(req.query.logid);
    if(result == false) {
        return res.send(500, {
            "message": "Log dump error"
        })
    }
    return res.send(200, {
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

    var result = await logDelete(req.query.username, req.query.logid);
    if(result) return res.send(200, {
        "message": "Log deleted successfully!"
    });
    return res.send(500, {
        "message": "Log delete failed"
    })
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

// REQUEST HELPER METHODS

async function requestValidate(
    exists,
    validate,
    res
) {
    for(let i of exists) {
        if(Array.isArray(i)) {
            if(i[0] == undefined || i[0] == null || typeof i[0] != i[1]) {
                if(res) return res.send(403, {
                    "message": "Invalid request"
                });
                return false;
            }
        } else {
            if(i == undefined || i == null) {
                if(res) return res.send(403, {
                    "message": "Invalid request"
                });
                return false;
            }
        }
    }
    if(await userExists(req.body.username) == false || await userValidate(req.body.username, req.body.password) == false) {
        if(res) return res.send(403, {
            "message": "Incorrect username / password."
        })
        return false;
    }
    return true;
}