const helper = require("./helper"),
    { DBUtil } = require("../db/db_util"),
    db = new DBUtil();

module.exports = async (req, res) => {
    var reqv = await helper.requestValidate([
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
        });
    }
    return res.status(200).send({
        "message": "Log dump success!",
        "log": helper.decodifyLog(result.log)
    });
}