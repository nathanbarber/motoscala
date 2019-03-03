const helper = require("./helper"),
    { DBUtil } = require("../db/db_util"),
    db = new DBUtil();

module.exports = async (req, res) => {
    var reqv = await helper.requestValidate([
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
}