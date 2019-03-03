const helper = require("./helper"),
    { DBUtil } = require("../db/db_util"),
    nm = require("nodemailer"),
    db = new DBUtil();

module.exports = async (req, res) => {
    if(!req.body.username || !req.body.password || !req.body.email) {
        return res.status(403).send({
            "message": "Invalid request"
        });
    }
    if(await db.userExists(req.body.username) == true) {
        return res.status(403).send({
            "message": "Username already registered"
        });
    }
    var result = await db.userCreate(req.body.username, req.body.password, req.body.email, req.body.phone || '');
    if(result.success == false) {
        console.log(result);
        return res.status(500).send({
            "message": "Failed to create a new user",
            "error": result.error
        });
    }
    // Create hash and redirect user to "Validate Email" page
    let hashResult = await db.createHash(req.body.username);
    console.log(hashResult);
    if(hashResult.success == false || typeof hashResult.hash != "string") {
        return res.status(500).send({
            "message": "Failed to create a validation hash",
            "error": result.error
        });
    }
    try {
        let validationTransport = nm.createTransport({
                service: 'gmail',
                auth: {
                    user: 'service.motoscala@gmail.com',
                    pass: 's9ns*72nslPP'
                }
            }),
            message = {
                from: "Motoscala Service <service.motoscala@gmail.com>",
                to: req.body.email,
                subject: "Please validate your email.",
                html: helper.createValidateHTML(req.body.username, hashResult.hash)
            }
        result = await validationTransport.sendMail(message);
        return res.send({
            success: true
        });
    } catch(err) {
        console.log(err);
        return res.status(500).send({
            "message": "Problem sending validation message. Retry recommended"
        });
    }
}