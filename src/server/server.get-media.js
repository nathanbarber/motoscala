const helper = require("./helper"),
    { DBUtil } = require("../db/db_util"),
    db = new DBUtil();

module.exports = async (req, res) => {
    try {
        let media = fs.readFileSync(`${process.env.FSTORE}${req.query.path}`, "utf-8");
        console.log(media);
        res.send(media);
    } catch(err) {
        res.send({
            "message": "Could not get media",
            "error": err
        });
    }
}