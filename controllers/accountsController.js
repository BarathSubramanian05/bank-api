import db from "../models/index.js";
import { Op } from "sequelize";
export async function listAccounts(req, res, next) {
  try {
    const page = parseInt(req.query.page || "1", 10);
    const limit = parseInt(req.query.limit || "10", 10);
    const offset = (page - 1) * limit;
    const where = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.minBalance) where.balance = { [Op.gte]: req.query.minBalance };
    if (req.query.maxBalance) where.balance = where.balance ? { ...where.balance, [Op.lte]: req.query.maxBalance } : { [Op.lte]: req.query.maxBalance };
    if (req.query.q) where.holderName = { [Op.iLike]: `%${req.query.q}%` };
    const { count, rows } = await db.Account.findAndCountAll({ where, order: [["createdAt", "DESC"]], limit, offset });
    res.json({ items: rows, totalCount: count, currentPage: page, totalPages: Math.ceil(count / limit) });
  } catch (err) {
    next(err);
  }
}
export async function createAccount(req, res, next) {
  try {
    const payload = { holderName: req.body.holderName, accountNumber: req.body.accountNumber };
    const acc = await db.Account.create(payload);
    res.status(201).json(acc);
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") return res.status(409).json({ error: "conflict", details: err.errors.map(e => e.message) });
    if (err.name && err.name.startsWith("Sequelize")) return res.status(400).json({ error: "validation_failed", details: err.errors ? err.errors.map(e => e.message) : err.message });
    next(err);
  }
}
export async function getAccountTransactions(req, res, next) {
  try {
    const accountId = req.params.id;
    const account = await db.Account.findByPk(accountId);
    if (!account) return res.status(404).json({ error: "account_not_found" });
    const page = parseInt(req.query.page || "1", 10);
    const limit = parseInt(req.query.limit || "10", 10);
    const offset = (page - 1) * limit;
    const where = { accountId };
    if (req.query.type) where.type = req.query.type;
    if (req.query.minAmount) where.amount = { [Op.gte]: req.query.minAmount };
    if (req.query.maxAmount) where.amount = where.amount ? { ...where.amount, [Op.lte]: req.query.maxAmount } : { [Op.lte]: req.query.maxAmount };
    if (req.query.fromDate) where.createdAt = { [Op.gte]: new Date(req.query.fromDate) };
    if (req.query.toDate) where.createdAt = where.createdAt ? { ...where.createdAt, [Op.lte]: new Date(req.query.toDate) } : { [Op.lte]: new Date(req.query.toDate) };
    const { count, rows } = await db.Transaction.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      include: [{ model: db.Account, as: "account", attributes: ["id", "holderName", "accountNumber"] }]
    });
    res.json({ items: rows, totalCount: count, currentPage: page, totalPages: Math.ceil(count / limit) });
  } catch (err) {
    next(err);
  }
}
export async function reportSummary(req, res, next) {
  try {
    const where = {};
    if (req.query.minBalance) where.balance = { [Op.gte]: req.query.minBalance };
    const totalAccounts = await db.Account.count({ where });
    const totalBalanceRow = await db.Account.findAll({ attributes: [[db.Sequelize.fn("SUM", db.Sequelize.col("balance")), "totalBalance"]], where, raw: true });
    const totalBalance = parseFloat(totalBalanceRow[0].totalBalance || 0);
    const averageBalance = totalAccounts ? totalBalance / totalAccounts : 0;
    const topAccounts = await db.Account.findAll({ where, order: [["balance", "DESC"]], limit: 5, attributes: ["id", "holderName", "accountNumber", "balance"] });
    res.json({ totalAccounts, totalBalance, averageBalance, topAccounts });
  } catch (err) {
    next(err);
  }
}
