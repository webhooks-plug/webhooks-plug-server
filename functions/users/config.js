const { Pool } = require("pg");

const APIResponse = {
  OK: 200,
  VALIDATION_FAILED: 401,
  SERVER_ERROR: 500,
};

const HTTP = {
  GET: "GET",
  POST: "POST",
  DELETE: "DELETE",
  PUT: "PUT",
};

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

module.exports = {
  HTTP,
  pgPool,
  APIResponse,
};
