const helper = require("./helper"),
    { DBUtil } = require("../db/db_util"),
    db = new DBUtil();

module.exports = async (req, res) => {
    var reqv = await helper.requestValidate([
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
}