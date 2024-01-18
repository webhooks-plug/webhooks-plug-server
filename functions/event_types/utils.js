const { pgPool } = require("./config");
const { queries } = require("./queries");

const getService = async (serviceId) => {
  const poolClient = await pgPool.connect();
  const service = await poolClient.query(queries.CREATE_EVENT_TYPE, [
    serviceId,
  ]);
  await pgPool.end();
  return service;
};

const createEventType = async (serviceId, eventName, topicArn) => {
  const poolClient = await pgPool.connect();
  const eventType = await poolClient.query(queries.CREATE_EVENT_TYPE, [
    eventName,
    serviceId,
    topicArn,
  ]);
  await pgPool.end();
  return eventType;
};

module.exports = {
  getService,
  createEventType,
};
