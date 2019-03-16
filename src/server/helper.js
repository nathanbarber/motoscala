const { DBUtil } = require("../db/db_util"),
    fs = require("fs-extra"),
    db = new DBUtil();

module.exports = {
    requestValidate: async (exists, validate, res) => {
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
    },
    encodify: (entity) => {
        return Buffer.from(entity).toString("hex");
    },
    decodify: (entity) => {
        return Buffer.from(entity, "hex").toString();
    },
    decodifyLog: (log) => {
        function decodify(entity) {
            return Buffer.from(entity, "hex").toString();
        }
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
    },
    createValidateHTML: function (username, token) {    
        return `<!DOCTYPE HTML>
            <html>
                <head>
                    <style>
                        div, span {
                            font-family: 'Segoe UI', 'Avenir', Tahoma, Geneva, Verdana, sans-serif;
                            text-align: center;
                        }
                        .img-container {
                            text-align: center;
                        }
                        img {
                            width: 150px;
                            margin: 50px;
                        }
                        .header {
                            margin-top: 40px;
                            width: 100%;
                            font-size: 20px;
                            color: #676767;
                            padding-bottom: 30px;
                            font-family: 'New York', Georgia, Times, 'Times New Roman', serif;
                        }
                        .button-container {
                            width: 100%;
                            position: relative;
                            text-align: center;
                        }
                        .button {
                            padding: 10px;
                            padding-top: 5px;
                            padding-bottom: 5px;
                            margin-top: 45px;
                            background-color: #DD6666;
                            border-radius: 5px;
                            color: white;
                            box-shadow: 0px 10px 10px #efefef;
                            transition: all 150ms ease-in;
                            font-size: 16px;
                            cursor: pointer;
                            user-select: none;
                            margin-bottom: 60px;
                        }
                        .button:hover {
                            background-color: rgb(235, 122, 122);
                        }
                        a {
                            text-decoration: none;
                            color: #efefef;
                        }
                    </style>
                </head>
                <body>
                    <div class="img-container"><img src="cid:928375109"></div>
                    <div class="header">Click below to validate your email.</div>
                    <div class="button-container">
                        <a 
                            class="button" 
                            style="color: #efefef" 
                            href="${process.env.VALIDATE_HOST || 'https://www.motoscala.com'}/validate-email?username=${username}&token=${token}">
                                Confirm
                        </a>
                    </div>
                    <br>
                </body>
            </html>`
    }
}