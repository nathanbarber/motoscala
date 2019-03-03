const helper = require("./helper"),
    { DBUtil } = require("../db/db_util"),
    db = new DBUtil();

module.exports = async (req, res) => {
    var reqv = await helper.requestValidate([
        [req.body.username, "string"],
        [req.body.token, "string"],
        [req.body.logname, "string"],
        [req.body.description, "string"]
    ], true, res);
    if(reqv != true) return;

    var result = await db.logCreate(req.body.username, req.body.logname, req.body.description);
    if(result.success == false) {
        return res.status(500).send({
            "message": "Failed to create a new log"
        });
    }
    return res.status(200).send({
        "message": "Created a new log!",
        "logid": result.logid
    });
}