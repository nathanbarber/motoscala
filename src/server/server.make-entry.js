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
        [req.body.etitle, "string"],
        [req.body.etext, "string"]
    ], true, res);
    if(reqv != true) return;
    // Store image in fstore
    var mediaHref = '';
    if(req.body.media && typeof req.body.media == "string") {
        let mediaDir = `${__dirname}/../../fstore/${req.body.username}`;
        mediaHref = `${mediaDir}/${crypto.randomBytes(30).toString("hex")}`
        try {
            fs.mkdirsSync(mediaDir);
            fs.writeFileSync(mediaHref, req.body.media);
        } catch(err) {
            console.log(err);
            return res.status(500).send({
                "message": "Could not write file",
                "error": err
            });
        }
    }
    var result = await db.entryCreate(req.body.logid, req.body.etitle, req.body.etext, mediaHref.split("fstore")[1]);
    if(result.success) return res.status(200).send({
        "message": "Entry created successfully!"
    });
    return res.status(500).send({
        "message": "Entry create failed"
    });
}