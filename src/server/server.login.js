const helper = require("./helper"),
    { DBUtil } = require("../db/db_util"),
    db = new DBUtil();
    
module.exports = async (req, res) => {
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
}