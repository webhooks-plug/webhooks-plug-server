import { Pool } from "pg";

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

module.exports.dbInfo = pgPool;
