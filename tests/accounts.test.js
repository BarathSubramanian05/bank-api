require("./setup.js"); // load setup first

const request = require("supertest");
const app = require("../app.js");
const db = require("../models/index.js");
const { Account} = db;


describe("Accounts API", () => {


it("should create account with minimal data", async () => {
const res = await request(app)
.post("/accounts")
.send({ holderName: "John Doe" });


expect(res.status).toBe(201);
expect(res.body.balance).toBe(0);
expect(res.body.status).toBe("ACTIVE");


const count = await Account.count();
expect(count).toBe(1);
});


it("should fail when holderName is missing", async () => {
const res = await request(app).post("/accounts").send({});
expect(res.status).toBe(400);
});


it("should fail when holderName is too short", async () => {
const res = await request(app)
.post("/accounts")
.send({ holderName: "Jo" });


expect(res.status).toBe(400);
});


it("should prevent duplicate account number", async () => {
await request(app)
.post("/accounts")
.send({ holderName: "John", accountNumber: "ACC123" });


const res = await request(app)
.post("/accounts")
.send({ holderName: "Jane", accountNumber: "ACC123" });


expect(res.status).toBe(400);
});


it("should list accounts", async () => {
await request(app).post("/accounts").send({ holderName: "A" });
await request(app).post("/accounts").send({ holderName: "B" });
await request(app).post("/accounts").send({ holderName: "C" });


const res = await request(app).get("/accounts");
expect(res.status).toBe(200);
expect(res.body.items.length).toBe(3);
});
});