const helper = require("./helper"),
    { DBUtil } = require("../db/db_util"),
    db = new DBUtil();

module.exports = async (req, res) => {
    let username = req.query.username,
        token = req.query.token;
    var result = await db.validateHash(username, token);
    if(result.error || !result.success || !result.validated) {
        return res.send(500, {
            "message": "Server error, could not validate."
        });
    }
    return res.redirect(301, "/");
}