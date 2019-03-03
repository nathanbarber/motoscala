const helper = require("./helper"),
    { DBUtil } = require("../db/db_util"),
    db = new DBUtil();

module.exports = async (req, res) => {
    var reqv = await helper.requestValidate([
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
}