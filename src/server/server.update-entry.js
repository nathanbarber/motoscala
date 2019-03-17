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
        [req.body.entryid, "string"],
        [req.body.etitle, "string"],
        [req.body.etext, "string"]
    ], true, res);
    if(reqv != true) return;
    // get old entry
    var logRes, entry;
    try {
        logRes = await db.logDump(req.body.logid);
        if(logRes.success == true) {
            console.log(logRes);
            entry = (() => {
                for(let i of logRes.log.entries) {
                    if(i.id == req.body.entryid) {
                        return i;
                    }
                }
            })();
            if(!entry) return res.status(404).send({
                "message": "The entry you're trying to update does not exist"
            });
        } else {
            return res.status(500).send({
                "message": "Could not remove old media.",
                "error": logRes.error
            });
        }
    } catch(err) {
        return res.status(500).send({
            "message": "Could not remove old media.",
            "error": err
        });
    }
    // update media
    var mediaHref = '';
    if(req.body.media && typeof req.body.media == "string") {
        let mediaDir = `${process.env.FSTORE}/${req.body.username}`;
        mediaHref = `${mediaDir}/${crypto.randomBytes(30).toString("hex")}`
        try {
            fs.mkdirsSync(mediaDir);
            fs.writeFileSync(mediaHref, req.body.media);
            if(entry.href) {
                fs.unlinkSync(`${process.env.FSTORE}${entry.href}`);
                console.log("Removed old asset");
            }
        } catch(err) {
            console.log(err);
            return res.status(500).send({
                "message": "Could not write file",
                "error": err
            });
        }
    }
    var result;
    if(mediaHref.length > 0) {
        result = await db.entryUpdate(req.body.logid, req.body.entryid, req.body.etitle, req.body.etext, mediaHref.replace(`${process.env.FSTORE}`, ''));
    } else {
        result = await db.entryUpdate(req.body.logid, req.body.entryid, req.body.etitle, req.body.etext, entry.href);
    }
    console.log(result);
    if(result.success) return res.status(200).send({
        "message": "Entry updated successfully!"
    });
    return res.status(500).send({
        "message": "Entry update failed"
    });
}