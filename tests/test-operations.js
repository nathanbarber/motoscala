const {
    userExists,
    userCreate,
    userValidate,
    generateAccessToken,
    verifyAccessToken,
    logCreate,
    logList,
    logDump,
    logDelete,
    dbReset
} = require("../operations");
const assert = require("assert");

// Spotcheck
(async () => {

    await dbReset();

    let exists, accesstoken;
    assert(await userExists("foo") == false, "dbReset removed users");
    assert(await userCreate("foo", "bar"), "Created new user foo");
    assert(await userValidate("foo", "bar"), "Password match");
    assert((accesstoken = await generateAccessToken("foo")).length == 88, "Accesstoken generated 88 len");
    assert(await verifyAccessToken("foo", accesstoken), "Access token match");
    // assert(await logCreate("foo", "newlog", "a test log"), "Log created");
    console.log("all DB tests passed");
})();