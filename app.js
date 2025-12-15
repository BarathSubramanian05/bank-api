import express from "express";
import dotenv from "dotenv";
import accountsRouter from "./routes/accountsRouter.js";
import errorHandler from "./middleware/errorHandler.js";
import morgan from "morgan"

dotenv.config();
const app = express();
app.use(express.json());
app.use(morgan("dev"));
app.use("/accounts", accountsRouter);
app.use(errorHandler);

export default app;