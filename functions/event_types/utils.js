const { pgPool } = require("./config");
const { queries } = require("./queries");

const createEventType = async (serviceId, eventName) => {
  const poolClient = await pgPool.connect();
  const eventType = await poolClient.query(queries.CREATE_EVENT_TYPE, [
    eventName,
    serviceId,
  ]);
  await pgPool.end();
  return eventType;
};

module.exports = {
  createEventType,
};
