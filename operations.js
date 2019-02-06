const pg = require("pg")
    crypto = require("crypto"),
    fs = require("fs");

module.exports = {
    dbReset: dbReset,
    userExists: userExists,
    userCreate: userCreate,
    userValidate: userValidate,
    generateAccessToken: generateAccessToken,
    verifyAccessToken: verifyAccessToken,
    logCreate: logCreate,
    logList: logList,
    logDump: logDump,
    logDelete: logDelete
}

async function dbReset() {
    console.log("Resetting DB according to schema file");
    let psql = new pg.Client();
    await psql.connect();
    await psql.query(fs.readFileSync(`./schema/init.sql`).toString());
    await psql.end();
    console.log("DB reset");
}

function userExists(username) {
    return new Promise(async (resolve, reject) => {
        let psql = new pg.Client();
        await psql.connect();
        var res = await psql.query(`select exists(select 1 from users where username='${username}')`),
            exists = res.rows[0].exists;
        await psql.end();
        resolve(exists);
    });
}

function userCreate(username, password, email, telephone) {
    return new Promise(async (resolve, reject) => {
        let psql = new pg.Client();
        await psql.connect();
        var res = await psql.query(
                `insert into users(username, password, email, telephone, token, logs) values (
                    '${username}',
                    '${password}',
                    '${email || ''}',
                    '${telephone || ''}',
                    '',
                    '[]'
                )`
            );
        await psql.end();
        if(res.rowCount == 1) return resolve(true);
        return resolve(false);
    })
}

function userValidate(username, password, email) {
    return new Promise(async (resolve, reject) => {
        let psql = new pg.Client();
        await psql.connect();
        var res = await psql.query(`select password from users where username='${username}'`);
        await psql.end();
        if(res.rows[0].password == password) return resolve(true);
        return resolve(false);
    });
}

function generateAccessToken(username) {
    return new Promise(async (resolve, reject) => {
        let tokenbuffer = crypto.randomBytes(64).toString("base64");
        let psql = new pg.Client();
        await psql.connect();
        var res = await psql.query(`update users set token='${tokenbuffer}' where username='${username}'`);
        await psql.end();
        if(res.rowCount == 1) return resolve(tokenbuffer);
        return resolve(false);
    });
}

function verifyAccessToken(username, token) {
    return new Promise(async (resolve, reject) => {
        let psql = new pg.Client();
        await psql.connect();
        var res = await psql.query(`select token from users where username='${username}'`);
        await psql.end();
        if(res.rows[0].token == token) return resolve(true);
        return resolve(false);
    });
}

function logCreate(username, logname, description) {
    return new Promise(async (resolve, reject) => {
        let log = JSON.stringify({
                "name": logname,
                "description": description,
                "entries": []
            }),
            id = "log" + crypto.randomBytes(64).toString("base64");
        // Insert into logs and users table
    });
}

function logList(username) {
    return new Promise(async (resolve, reject) => {
        let psql = new pg.Client();
        await psql.connect();
        var res = await psql.query(`select logs from users where username='${username}'`);
        await psql.end();
        if(res.rows.length > 0) return resolve(res.rows[0]);
        return resolve(false);
    });
}

function logDump(logid) {
    return new Promise(async (resolve, reject) => {
        let psql = new pg.Client();
        await psql.connect();
        var res = await psql.query(`select log from logs where id='${logid}'`);
        await psql.end();
        if(res.rows.length > 0) return resolve(res.rows[0]);
        return resolve(false);
    });
}

function logDelete(username, logid) {
    return new Promise(async (resolve, reject) => {
        // delete from logs and users table
    });
}