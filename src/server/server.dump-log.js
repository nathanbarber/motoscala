const helper = require("./helper"),
    { DBUtil } = require("../db/db_util"),
    db = new DBUtil();

module.exports = async (req, res) => {
    if(
        (await helper.requestValidate([
            [req.query.logid, "string"]
        ], false, res)) != true
    ) return;

    var hexRegex = /[0-9A-Fa-f]/g,
        log = {};
    if(req.query.logid.substring(0,3) == "log" && hexRegex.test(req.query.logid.substring(3))) {
        let result = await db.logDump(req.query.logid);
        console.log(result);
        if(result.success == false) {
            return res.status(500).send({
                "message": "Log dump error",
                "error": result.error
            });
        }
        log = result;
    }
    
    var public = JSON.parse(log.log.public),
        owner = log.log.owner;

    if(public) {
        if(owner == req.query.username) {
            if(
                (await helper.requestValidate([
                    [req.query.username, "string"],
                    [req.query.token, "string"],
                    [req.query.logid, "string"]
                ], true, res)) != true
            ) return;
            return res.status(200).send({
                "message": "Log dump success!",
                "log": helper.decodifyLog(log.log),
                "owner": true
            });
        } else {
            return res.status(200).send({
                "message": "Log dump success!",
                "log": helper.decodifyLog(log.log),
                "owner": false
            });
        }
    } else {
        if(owner == req.query.username) {
            if(
                (await helper.requestValidate([
                    [req.query.username, "string"],
                    [req.query.token, "string"],
                    [req.query.logid, "string"]
                ], true, res)) != true
            ) return;
            return res.status(200).send({
                "message": "Log dump success!",
                "log": helper.decodifyLog(log.log),
                "owner": true
            });
        } else {
            return res.status(403).send({
                "message": "Cannot view private log."
            });
        }
    }
}