import db from "../models/index.js";

beforeAll(async () => {
  await db.sequelize.sync();
});

beforeEach(async () => {
  await db.sequelize.sync({ force: true });
});

afterAll(async () => {
  await db.sequelize.close();
});
