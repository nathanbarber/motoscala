const { DBUtil } = require("../db_util")
const assert = require("assert");

describe("DBUtil class methods functioning", () => {
    it("wipes database", async () => {
        let db = new DBUtil();
        await db.dbReset();
        db.d();
    });
    it("can create and find users", async () => {
        let db = new DBUtil();
        assert.equal(await db.userExists("foo"), false);
        assert.equal(await db.userCreate("foo", "bar", "foobar@foo.bar", "000"), true);
        assert.equal(await db.userExists("foo"), true);
        db.d();
    });
    it("can verify user password", async () => {
        let db = new DBUtil();
        assert.equal(await db.userValidate("foo", "bar"), true);
        db.d();
    });
    it("can create and validate a user session token", async () => {
        let db = new DBUtil(),
            token = await db.generateAccessToken("foo");
        assert.equal(token.success, true);
        assert.equal(await db.verifyAccessToken("foo", token.token), true);
        db.d();
    });
    it("can create logs and update the user logID records", async () => {
        let db = new DBUtil();
        assert.equal(await db.logCreate("foo", "foo-log", "log for foo"), true);
        db.d();
    }); 
    it("can list the logIDs for a specified user and use them to fetch the corresponding logs", async () => {
        let db = new DBUtil(),
            list = await db.logList("foo");
        assert.equal(list.success, true);
        assert.equal(Array.isArray(list.logs), true);
        assert.equal(list.error, undefined);

        let log = await db.logDump(list.logs[0]);
        assert.equal(log.success, true);
        assert.equal(log.error, undefined);
        assert.equal(typeof log.log, "object");
        db.d();
    });
})