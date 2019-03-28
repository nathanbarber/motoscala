const helper = require("./helper"),
    { DBUtil } = require("../db/db_util"),
    fs = require("fs-extra"),
    db = new DBUtil();

module.exports = async (req, res) => {
    var reqv = await helper.requestValidate([
        [req.body.username, "string"],
        [req.body.token, "string"],
        [req.body.logid, "string"],
        [req.body.entryid, "string"]
    ], true, res);
    if(reqv != true) return;

    var log = await db.logDump(req.body.logid);
    for(let entry of log.log.entries) {
        if(entry.id == req.body.entryid) {
            if(typeof entry.href == "string") {
                let delPath = `${process.env.FSTORE}${entry.href}`;
                try {
                    fs.unlinkSync(delPath);
                } catch(err) {
                    console.log("Delete failed for ", delPath, err);
                }
            }
        }
    }

    var result = await db.entryDelete(req.body.logid, req.body.entryid);
    if(result.success) return res.status(200).send({
        "message": "Entry deleted successfully!"
    });
    console.log(result);
    return res.status(500).send({
        "message": "Entry delete failed"
    });
}