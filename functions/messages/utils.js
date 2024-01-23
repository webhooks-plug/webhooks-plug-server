const { createClient } = require("/opt");
const { queries } = require("./queries");

const listMessages = async (name) => {
  const poolClient = await createClient();
  const messages = await poolClient.query(queries.LIST_MESSAGES);
  poolClient.release();
  return messages;
};

module.exports = {
  listMessages,
};
