import dotenv from "dotenv";
import db from "./models/index.js";
import app from "./app.js";
dotenv.config();
const port = process.env.PORT;
async function start() {
  await db.sequelize.sync();
  app.listen(port);
  console.log(`Server started on port : ${process.env.PORT}`);
}
start();