import { query, validationResult, body } from "express-validator";
const handle = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: "validation_failed", details: errors.array() });
  next();
};
export const validateAccountCreation = [
  body("holderName").exists().bail().isString().trim().isLength({ min: 3, max: 120 }),
  body("accountNumber").optional().isString().trim().notEmpty(),
  handle
];
export const validateTransaction = [
  body("type").exists().isIn(["DEPOSIT", "WITHDRAW"]),
  body("amount").exists().isFloat({ gt: 0 }),
  body("description").optional().isString().trim().isLength({ max: 255 }),
  handle
];
export const validateTransfer = [
  body("fromAccountId").exists().isUUID(),
  body("toAccountId").exists().isUUID(),
  body("amount").exists().isFloat({ gt: 0 }),
  body("description").optional().isString().trim().isLength({ max: 255 }),
  handle
];
export const validateListAccounts = [
  query("status").optional().isIn(["ACTIVE", "BLOCKED"]),
  query("minBalance").optional().isFloat(),
  query("maxBalance").optional().isFloat(),
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1 }),
  query("q").optional().isString().trim(),
  handle
];
export const validateListTransactions = [
  query("type").optional().isIn(["DEPOSIT", "WITHDRAW", "TRANSFER_IN", "TRANSFER_OUT"]),
  query("minAmount").optional().isFloat(),
  query("maxAmount").optional().isFloat(),
  query("fromDate").optional().isISO8601(),
  query("toDate").optional().isISO8601(),
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1 }),
  handle
];
