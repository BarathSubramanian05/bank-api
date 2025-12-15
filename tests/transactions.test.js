require("./setup.js"); // load setup first

const request = require("supertest");
const app = require("../app.js");
const db = require("../models/index.js");
const { Account, Transaction } = db;


describe("Transactions API", () => {


let account;


beforeEach(async () => {
account = await Account.create({ holderName: "John", balance: 1000 });
});


it("should deposit money", async () => {
const res = await request(app)
.post(`/accounts/${account.id}/transactions`)
.send({ type: "DEPOSIT", amount: 500 });


expect(res.status).toBe(200);
expect(res.body.balance).toBe(1500);


const tx = await Transaction.findOne();
expect(tx.type).toBe("DEPOSIT");
});


it("should withdraw money", async () => {
const res = await request(app)
.post(`/accounts/${account.id}/transactions`)
.send({ type: "WITHDRAW", amount: 200 });


expect(res.status).toBe(200);
expect(res.body.balance).toBe(800);
});


it("should reject insufficient funds", async () => {
const res = await request(app)
.post(`/accounts/${account.id}/transactions`)
.send({ type: "WITHDRAW", amount: 2000 });


expect([400, 422]).toContain(res.status);


const txCount = await Transaction.count();
expect(txCount).toBe(0);
});


it("should fail for invalid account", async () => {
const res = await request(app)
.post(`/accounts/9999/transactions`)
.send({ type: "DEPOSIT", amount: 100 });


expect(res.status).toBe(404);
});
}); 