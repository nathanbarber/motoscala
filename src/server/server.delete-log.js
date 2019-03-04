const helper = require("./helper"),
    { DBUtil } = require("../db/db_util"),
    db = new DBUtil();

module.exports = async (req, res) => {
    var reqv = await helper.requestValidate([
        [req.body.username, "string"],
        [req.body.token, "string"],
        [req.body.logid, "string"]
    ], true, res);
    if(reqv != true) return;

    var result = await db.logDelete(req.body.username, req.body.logid);
    console.log(result);
    if(result.success) return res.status(200).send({
        "message": "Log deleted successfully!"
    });
    return res.status(500).send({
        "message": "Log delete failed"
    });
}