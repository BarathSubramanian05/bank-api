import db from "../models/index.js";
export async function applyTransaction(req, res, next) {
  const t = await db.sequelize.transaction();
  try {
    const accountId = req.params.id;
    const type = req.body.type;
    const amount = parseFloat(req.body.amount);
    const description = req.body.description || null;
    const account = await db.Account.findByPk(accountId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!account) {
      await t.rollback();
      return res.status(404).json({ error: "account_not_found" });
    }
    if (account.status !== "ACTIVE") {
      await t.rollback();
      return res.status(400).json({ error: "account_not_active" });
    }
    if (type === "DEPOSIT") {
      const newBalance = parseFloat(account.balance) + amount;
      await account.update({ balance: newBalance }, { transaction: t });
      const tx = await db.Transaction.create({ accountId, type, amount, description, balanceAfter: newBalance }, { transaction: t });
      await t.commit();
      const updated = await db.Account.findByPk(accountId);
      return res.status(201).json({ account: updated, transaction: tx });
    }
    if (type === "WITHDRAW") {
      const current = parseFloat(account.balance);
      if (current < amount) {
        await t.rollback();
        return res.status(400).json({ error: "insufficient_funds" });
      }
      const newBalance = current - amount;
      await account.update({ balance: newBalance }, { transaction: t });
      const tx = await db.Transaction.create({ accountId, type, amount, description, balanceAfter: newBalance }, { transaction: t });
      await t.commit();
      const updated = await db.Account.findByPk(accountId);
      return res.status(201).json({ account: updated, transaction: tx });
    }
    await t.rollback();
    return res.status(400).json({ error: "invalid_type" });
  } catch (err) {
    await t.rollback();
    next(err);
  }
}
export async function transferFunds(req, res, next) {
  const t = await db.sequelize.transaction();
  try {
    const fromId = req.body.fromAccountId;
    const toId = req.body.toAccountId;
    const amount = parseFloat(req.body.amount);
    const description = req.body.description || null;
    if (fromId === toId) {
      await t.rollback();
      return res.status(400).json({ error: "cannot_transfer_to_same_account" });
    }
    const fromAcc = await db.Account.findByPk(fromId, { transaction: t, lock: t.LOCK.UPDATE });
    const toAcc = await db.Account.findByPk(toId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!fromAcc || !toAcc) {
      await t.rollback();
      return res.status(404).json({ error: "account_not_found" });
    }
    if (fromAcc.status !== "ACTIVE" || toAcc.status !== "ACTIVE") {
      await t.rollback();
      return res.status(400).json({ error: "account_not_active" });
    }
    const fromCurrent = parseFloat(fromAcc.balance);
    if (fromCurrent < amount) {
      await t.rollback();
      return res.status(400).json({ error: "insufficient_funds" });
    }
    const fromNew = fromCurrent - amount;
    const toNew = parseFloat(toAcc.balance) + amount;
    await fromAcc.update({ balance: fromNew }, { transaction: t });
    await toAcc.update({ balance: toNew }, { transaction: t });
    const txOut = await db.Transaction.create({ accountId: fromId, type: "TRANSFER_OUT", amount, description, balanceAfter: fromNew }, { transaction: t });
    const txIn = await db.Transaction.create({ accountId: toId, type: "TRANSFER_IN", amount, description, balanceAfter: toNew }, { transaction: t });
    await t.commit();
    const updatedFrom = await db.Account.findByPk(fromId);
    const updatedTo = await db.Account.findByPk(toId);
    res.status(201).json({ from: updatedFrom, to: updatedTo, transactions: { out: txOut, in: txIn } });
  } catch (err) {
    await t.rollback();
    next(err);
  }
}
