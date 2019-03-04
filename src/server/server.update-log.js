const helper = require("./helper"),
    { DBUtil } = require("../db/db_util"),
    fs = require("fs-extra"),
    crypto = require("crypto"),
    db = new DBUtil();

module.exports = async (req, res) => {
    var reqv = await helper.requestValidate([
        [req.body.username, "string"],
        [req.body.token, "string"],
        [req.body.logid, "string"],
        [req.body.logname, "string"],
        [req.body.description, "string"],
    ], true, res);
    if(reqv != true) return;

    var response = await db.logUpdate(req.body.logid, req.body.username, req.body.logname, req.body.description);
    console.log(response);
    if(response.success == true && response.updated == true) 
        return res.status(200).send({
            "message": "Successfully updated log"
        });
    return res.status(500).send({
        "message": "Log update failed",
        "error": response.error
    });
}