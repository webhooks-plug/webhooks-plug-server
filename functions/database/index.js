const fs = require("node:fs");
const { pgPool } = require("./config");

const sqlFilePath = "./database.sql";
const sqlQuery = fs.readFileSync(sqlFilePath, "utf8");

const handler = async () => {
  try {
    const poolClient = await pgPool.connect();
    await poolClient.query(sqlQuery);
    await pgPool.end();
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  handler,
};
