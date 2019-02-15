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
        try {
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
            return {
                success: (res.affectedRows == 1)
            }
        } catch(err) {
            return {
                success: false,
                error: err
            }
        }
    }
    
    async userValidate(username, password, email) {
        try {
            var res = await this.q(`select password from users where username='${username}'`),
                validated = res[0].password == password;
            return {
                success: true,
                validated: validated
            }
        } catch(err) {
            return {
                success: false,
                validated: false,
                error: err
            }
        }
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
        try {
            var res = await this.q(`select token from users where username='${username}'`),
                validated = (res[0].token == token);
            return {
                validated: validated,
                success: true
            }
        } catch(err) {
            return {
                success: false,
                validated: false,
                error: err
            }
        }
    }
    
    async logCreate(username, logname, description) {
        try {
            let log = JSON.stringify({
                    "name": logname,
                    "description": description,
                    "entries": []
                }),
                id = "log" + crypto.randomBytes(64).toString("base64"),
                userLogIds = await this.q(`select logs from users where username='${username}'`),
                userLogArray = JSON.parse(userLogIds[0].logs);
            userLogArray.push(id);
            let userLogRes = await this.q(`update users set logs='${JSON.stringify(userLogArray)}' where username='${username}'`),
                logRes = await this.q(`insert into logs(id, log) values ('${id}', '${log}')`);
            return {
                success: (logRes.affectedRows == 1 && userLogRes.changedRows == 1),
                logid: id
            }
        } catch(err) {
            return {
                success: false,
                error: err
            }
        }
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
        try {
            var userLogArray = await this.q(`select logs from users where username='${username}'`),
                parsedLogArray = JSON.parse(userLogArray[0].logs),
                newUserLogArray = [];
            for(let l of parsedLogArray) {
                if(l != logid) {
                    newUserLogArray.push(l);
                }
            }
            var stringifiedUserLogArray = JSON.stringify(newUserLogArray),
                updateUserLogArray = await this.q(`update users set logs='${stringifiedUserLogArray}' where username='${username}'`),
                logDeleteRes = await this.q(`delete from logs where id='${logid}'`);

            return {
                success: (logDeleteRes.affectedRows == 1 && updateUserLogArray.changedRows == 1)
            }
        } catch(err) {
            return {
                success: false,
                error: err
            }
        }
    }

    async entryCreate(logid, title, text, href) {
        try {
            var entry = {
                    "id": "entry" + crypto.randomBytes(64).toString("base64"),
                    "title": title,
                    "text": text,
                    "href": href || null,
                    "created": Date.now()
                },
                log = await this.q(`select log from logs where id='${logid}'`),
                parsedLog = JSON.parse(log[0].log);
            parsedLog.entries.push(entry);
            var stringifiedLog = JSON.stringify(parsedLog),
                updateLog = await this.q(`update logs set log='${stringifiedLog}' where id='${logid}'`);
            return updateLog.changedRows == 1;
        } catch(err) {
            return {
                success: false,
                error: err
            }
        }
    }

    async entryDelete(logid, entryid) {
        try {
            var log = await this.q(`select log from logs where id='${logid}'`),
                parsedLog = JSON.parse(log[0].log),
                updatedEntries = [];
            for(let e of parsedLog.entries) {
                if(e.id != entryid) {
                    updatedEntries.push(e);
                }
            }
            parsedLog.entries = updatedEntries;
            var stringifiedLog = JSON.stringify(parsedLog);
            var updateLog = await this.q(`update logs set log='${stringifiedLog}' where id='${logid}'`);
            return updateLog.changedRows == 1;
        } catch(err) {
            return {
                success: false,
                error: err
            }
        }
    }

    async entryUpdate(logid, entryid, title, text, href) {
        try {
            var log = await this.q(`select log from logs where id='${logid}'`),
                parsedLog = JSON.parse(log[0].log),
                updatedEntries = [];
            for(let e of parsedLog.entries) {
                if(e.id == entryid) {
                    e.title = title || e.title;
                    e.text = text || e.text;
                    e.href = href || e.href;
                    updatedEntries.push(e);
                } else {
                    updatedEntries.push(e);
                }
            }
            parsedLog.entries = updatedEntries;
            var stringifiedLog = JSON.stringify(parsedLog);
            var updateLog = await this.q(`update logs set log='${stringifiedLog}' where id='${logid}'`);
            return updateLog.changedRows == 1;
        } catch(err) {
            return {
                success: false, 
                error: err
            }
        }
    }
}

module.exports = { DBUtil };