import { DataTypes } from "sequelize";
import { generateAccountNumber } from "../utils/accountNumber.js";
export default (sequelize) => {
  const Account = sequelize.define("Account", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    holderName: {
      type: DataTypes.STRING(120),
      allowNull: false,
      validate: {
        len: [3, 120]
      }
    },
    accountNumber: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
      field: "account_number",
      validate: {
        notEmpty: true
      }
    },
    balance: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.0,
      validate: {
        min: 0
      }
    },
    status: {
      type: DataTypes.ENUM("ACTIVE", "BLOCKED"),
      allowNull: false,
      defaultValue: "ACTIVE"
    }
  }, {
    tableName: "accounts",
    timestamps: true
  });
  Account.beforeValidate(async (account) => {
    if (typeof account.holderName === "string") account.holderName = account.holderName.trim();
    if (!account.accountNumber) account.accountNumber = await generateAccountNumber(sequelize);
  });
  Account.associate = (models) => {
    Account.hasMany(models.Transaction, { foreignKey: "accountId", as: "transactions" });
  };
  return Account;
};
