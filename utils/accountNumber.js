export async function generateAccountNumber(sequelize) {
  const prefix = "ACC";
  while (true) {
    const num = Math.floor(Math.random() * 900000 + 100000).toString();
    const candidate = `${prefix}${Date.now().toString().slice(-5)}${num}`;
    const [results] = await sequelize.query("SELECT 1 FROM accounts WHERE account_number = :acct LIMIT 1", { replacements: { acct: candidate } });
    if (!results.length) return candidate;
  }
}
