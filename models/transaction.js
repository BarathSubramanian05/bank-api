import { DataTypes } from "sequelize";
export default (sequelize) => {
  const Transaction = sequelize.define("Transaction", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    accountId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "account_id"
    },
    type: {
      type: DataTypes.ENUM("DEPOSIT", "WITHDRAW", "TRANSFER_IN", "TRANSFER_OUT"),
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        min: 0.01
      }
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
      set(value) {
        if (typeof value === "string") this.setDataValue("description", value.trim());
        else this.setDataValue("description", value);
      }
    },
    balanceAfter: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      field: "balance_after"
    }
  }, {
    tableName: "transactions",
    timestamps: true
  });
  Transaction.associate = (models) => {
    Transaction.belongsTo(models.Account, { foreignKey: "accountId", as: "account" });
  };
  return Transaction;
};
