const fs = require("node:fs");
const { pgPool } = require("./config");

const sqlFilePath = "./database.sql";
const sqlQuery = fs.readFileSync(sqlFilePath, "utf8");

const handler = async () => {
  // import sql file and run query against database
  try {
    const poolClient = await pgPool.connect();
    const query = await poolClient.query(sqlQuery);
    console.log(query);
    await pgPool.end();
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  handler,
};
