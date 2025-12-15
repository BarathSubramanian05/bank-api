require("./setup.js"); // load setup first

const request = require("supertest");
const app = require("../app.js");
const db = require("../models/index.js");
const { Account} = db;


describe("Reports API", () => {


it("should return empty summary", async () => {
const res = await request(app).get("/reports/accounts/summary");


expect(res.status).toBe(200);
expect(res.body.totalAccounts).toBe(0);
expect(res.body.totalBalance).toBe(0);
});


it("should return correct account summary", async () => {
await Account.create({ holderName: "A", balance: 100 });
await Account.create({ holderName: "B", balance: 200 });


const res = await request(app).get("/reports/accounts/summary");


expect(res.status).toBe(200);
expect(res.body.totalAccounts).toBe(2);
expect(res.body.totalBalance).toBe(300);
expect(res.body.averageBalance).toBe(150);
});
});