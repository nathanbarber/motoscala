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
        assert.equal((await db.userCreate("foo", "bar", "foobar@foo.bar", "000")).success, true);
        assert.equal(await db.userExists("foo"), true);
        db.d();
    });
    it("can verify user password", async () => {
        let db = new DBUtil();
        assert.equal(JSON.stringify(await db.userValidate("foo", "bar")), JSON.stringify({success: true, validated: true}));
        db.d();
    });
    it("can create and validate a user session token", async () => {
        let db = new DBUtil(),
            token = await db.generateAccessToken("foo");
        assert.equal(token.success, true);
        assert.equal(JSON.stringify(await db.verifyAccessToken("foo", token.token)), JSON.stringify({validated: true, success: true}));
        db.d();
    });
    it("can create logs and update the user logID records", async () => {
        let db = new DBUtil(),
            logCreate = await db.logCreate("foo", "foo-log", "log for foo");
        assert.equal(logCreate.success, true);
        assert.equal(typeof logCreate.logid, "string");
        db.d();
    }); 
    it("list user logids, fetch logs, delete logs", async () => {
        let db = new DBUtil(),
            list = await db.logList("foo");
        assert.equal(list.success, true);
        assert.equal(Array.isArray(list.logs), true);
        assert.equal(list.error, undefined);

        let log = await db.logDump(list.logs[0]);
        assert.equal(log.success, true);
        assert.equal(log.error, undefined);
        assert.equal(typeof log.log, "object");

        let deleteLog = await db.logDelete("foo", list.logs[0]);
        assert.equal(deleteLog.success, true);
        db.d();
    });
    it("can create a log and add/update/get/delete an entry, dump log, then delete log", async () => {
        let db = new DBUtil(),
            logCreate = await db.logCreate("foo", "foo-log", "log-for-foo");
        assert.equal(logCreate.success, true);
        assert.equal(typeof logCreate.logid, "string");

        let entryCreate = await db.entryCreate(logCreate.logid, "foo-entry", "entry-for-foo", null);
        assert.equal(entryCreate, true);

        let log = await db.logDump(logCreate.logid);
        assert.equal(log.error, undefined);
        assert.equal(log.success, true);
        assert.equal(typeof log.log, "object");
        assert.equal(log.log.entries.length > 0, true);
        assert.equal(typeof log.log.entries[0].id, "string");
        assert.equal(log.log.entries[0].id.includes("entry"), true);
        assert.equal(log.log.entries[0].title, "foo-entry");
        assert.equal(log.log.entries[0].text, "entry-for-foo");
        assert.equal(typeof log.log.entries[0].created, "number");
        assert.equal(log.log.entries[0].href, undefined);

        let updateEntry = await db.entryUpdate(logCreate.logid, log.log.entries[0].id, "foo-entry-updated", "entry-for-foo-updated", "/href/added");
        assert.equal(updateEntry, true);

        log = await db.logDump(logCreate.logid),
        numEntries = log.log.entries.length;
        assert.equal(log.error, undefined);
        assert.equal(log.success, true);
        assert.equal(typeof log.log, "object");
        assert.equal(log.log.entries.length > 0, true);
        assert.equal(typeof log.log.entries[0].id, "string");
        assert.equal(log.log.entries[0].id.includes("entry"), true);
        assert.equal(log.log.entries[0].title, "foo-entry-updated");
        assert.equal(log.log.entries[0].text, "entry-for-foo-updated");
        assert.equal(typeof log.log.entries[0].created, "number");
        assert.equal(log.log.entries[0].href, "/href/added");

        let deleteEntry = await db.entryDelete(logCreate.logid, log.log.entries[0].id);
        assert.equal(deleteEntry, true);

        log = await db.logDump(logCreate.logid);
        assert.equal(log.log.entries.length, numEntries - 1);

        let deleteLog = await db.logDelete("foo", logCreate.logid);
        assert.equal(deleteLog.success, true);

        db.d();
    });
});

describe("DBUtil class methods error correctly", () => {
    it("wipes database", async () => {
        let db = new DBUtil();
        await db.dbReset();
        db.d();
    });
    it("handles deleting an imaginary log", async () => {
        let db = new DBUtil(),
            logDelete = await db.logDelete("foo", "notalog");
        assert.equal(logDelete.success, false);
        assert.equal(typeof logDelete.error, "object");
        db.d();
    });
    it("handles creation of log without user", async () => {
        let db = new DBUtil(),
            logCreate = await db.logCreate("foo", "foo-log", "");
        assert.equal(logCreate.success, false);
        assert.equal(typeof logCreate.error, "object");
        db.d();
    });
    it("handles creation of duplicate user", async () => {
        let db = new DBUtil(),
            userCreate = await db.userCreate("foo", "bar", "", "[]");
        assert.equal(userCreate.success, true);
        let dupUserCreate = await db.userCreate("foo", "bar", "", "");
        assert.equal(dupUserCreate.success, false);
        assert.equal(typeof dupUserCreate.error, "object");
        db.d();
    }); 
    it("handles validating imaginary user", async () => {
        let db = new DBUtil(),
            userValidate = await db.userValidate("bar", "foo", "");
        assert.equal(userValidate.success, false);
        assert.equal(typeof userValidate.error, "object");
        db.d();
    });
    it("handles entry ops on an imaginary log", async () => {
        let db = new DBUtil(),
            createEntry = await db.entryCreate("notalog", "fake", "", ""),
            updateEntry = await db.entryUpdate("notalog", "fake-updated", "", ""),
            deleteEntry = await db.entryDelete("notalog", "fake-updated", "", "");
        assert.equal(createEntry.success || updateEntry.success || deleteEntry.success, false);
        assert.equal(typeof createEntry.error, "object");
        assert.equal(typeof updateEntry.error, "object");
        assert.equal(typeof deleteEntry.error, "object");
        db.d();
    });
});