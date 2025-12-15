import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import accountModel from "./account.js";
import transactionModel from "./transaction.js";

if (process.env.NODE_ENV === "test") {
  dotenv.config({ path: ".env.test" });
} else {
  dotenv.config();
}

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT || "postgres",
    logging: false
  }
);

const db = {};

const Account = accountModel(sequelize);
const Transaction = transactionModel(sequelize);

db.Account = Account;
db.Transaction = Transaction;

if (Account.associate) Account.associate(db);
if (Transaction.associate) Transaction.associate(db);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
