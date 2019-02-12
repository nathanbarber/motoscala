const mysql = require("mysql"),
    fs = require("fs"),
    crypto = require("crypto");

class DBUtil {
    constructor() {
        this.mysql = mysql.createConnection({
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            database: process.env.DB,
            insecureAuth: true,
            multipleStatements: true
        });
    }

    q(query) {
        return new Promise((resolve, reject) => {
            this.mysql.query(query, (err, res, fields) => {
                if(err) reject(err);
                resolve(res);
            });
        });
    }

    d() {
        this.mysql.destroy();
    }

    async dbReset() {
        console.log("Resetting DB according to schema file");
        await this.q('use motoscala');
        await this.q(fs.readFileSync(`./schema/init.sql`).toString());
        console.log("DB reset");
    }

    async userExists(username) {
        var res = await this.q(`select exists(select 1 from users where username='${username}')`);
        return (res[0][`exists(select 1 from users where username=\'${username}\')`] == 1);
    }

    async userCreate(username, password, email, telephone) {
        var res = await this.q(
            `insert into users(username, password, email, telephone, token, logs) values (
                '${username}',
                '${password}',
                '${email || ''}',
                '${telephone || ''}',
                '',
                '[]'
            )`
        );
        return (res.affectedRows == 1);
    }
    
    async userValidate(username, password, email) {
        var res = await this.q(`select password from users where username='${username}'`);
        return res[0].password == password;
    }
    
    async generateAccessToken(username) {
        let tokenbuffer = crypto.randomBytes(64).toString("base64");
        var res = await this.q(`update users set token='${tokenbuffer}' where username='${username}'`);
        return {
            success: res.changedRows == 1,
            token: tokenbuffer
        }
    }
    
    async verifyAccessToken(username, token) {
        var res = await this.q(`select token from users where username='${username}'`);
        return res[0].token == token;
    }
    
    async logCreate(username, logname, description) {
        let log = JSON.stringify({
                "name": logname,
                "description": description,
                "entries": []
            }),
            id = "log" + crypto.randomBytes(64).toString("base64"),
            logRes = await this.q(`insert into logs(id, log) values ('${id}', '${log}')`),
            userLogIds = await this.q(`select logs from users where username='${username}'`),
            userLogArray = JSON.parse(userLogIds[0].logs);
        userLogArray.push(id);
        let userLogRes = await this.q(`update users set logs='${JSON.stringify(userLogArray)}' where username='${username}'`);
        
        return (logRes.affectedRows == 1 && userLogRes.changedRows == 1);
    }
    
    async logList(username) {
        var res = await this.q(`select logs from users where username='${username}'`);
        let logIds = res[0].logs,
            logIdArray = [];
        try {
            logIdArray = JSON.parse(logIds);
            return {
                success: true,
                logs: logIdArray
            }
        } catch(err) {
            console.log(err);
            return {
                success: false,
                error: err
            }
        }
    }
    
    async logDump(logid) {
        var res = await this.q(`select log from logs where id='${logid}'`);
        let log = {};
        try {
            log = JSON.parse(res[0].log);
            return {
                success: true,
                log: log
            }
        } catch(err) {
            return {
                success: false,
                error: err
            }
        }
    }
    
    async logDelete(username, logid) {
        
    }
}

module.exports = { DBUtil };