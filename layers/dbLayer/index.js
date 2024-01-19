const { Pool } = require("pg");

const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const database = process.env.DB_NAME;
const host = process.env.DB_HOST;
const port = process.env.DB_PORT;

const pgPool = new Pool({
  user,
  host,
  port,
  password,
  database,
});

const createClient = async () => {
  return await pgPool.connect();
};

const closeConnection = async () => {
  await pgPool.end();
};

module.exports = {
  pgPool,
  createClient,
  closeConnection,
};
