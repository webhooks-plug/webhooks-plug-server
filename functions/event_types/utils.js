const { createClient } = require("/opt");
const { queries } = require("./queries");

const isValidUUID = (uuid) => {
  const uuidRegex =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
  return uuidRegex.test(uuid);
};

const getService = async (serviceId) => {
  const poolClient = await createClient();
  const service = await poolClient.query(queries.GET_SERVICE, [serviceId]);
  poolClient.release();
  return service;
};

const createEventType = async (serviceId, eventName, topicArn) => {
  const poolClient = await createClient();
  const eventType = await poolClient.query(queries.CREATE_EVENT_TYPE, [
    eventName,
    serviceId,
    topicArn,
  ]);
  poolClient.release();
  return eventType;
};

const updateEventType = async (eventTypeId, eventName) => {
  const poolClient = await createClient();
  const eventType = await poolClient.query(queries.UPDATE_EVENT_TYPE, [
    eventName,
    eventTypeId,
  ]);
  poolClient.release();
  return eventType;
};

const deleteEventType = async (eventTypeId) => {
  const deleteSubsciptions = async () => {
    const poolClient = await createClient();
    const subscriptions = await poolClient.query(queries.DELETE_SUBSCRIPTION, [
      eventTypeId,
    ]);
    return subscriptions;
  };

  await deleteSubsciptions();

  const poolClient = await createClient();
  const eventType = await poolClient.query(queries.DELETE_EVENT_TYPE, [
    eventTypeId,
  ]);
  poolClient.release();
  return eventType;
};

const getEventType = async (eventTypeId) => {
  const poolClient = await createClient();
  const eventType = await poolClient.query(queries.GET_EVENT_TYPE, [
    eventTypeId,
  ]);
  poolClient.release();
  return eventType;
};

const getEventTypeByName = async (name, serviceId) => {
  const poolClient = await createClient();
  const eventType = await poolClient.query(queries.GET_EVENT_TYPE_NAME, [
    name,
    serviceId,
  ]);
  poolClient.release();
  return eventType;
};

const getEventTypes = async (serviceId) => {
  const poolClient = await createClient();
  const eventType = await poolClient.query(queries.GET_EVENT_TYPES, [
    serviceId,
  ]);
  poolClient.release();
  return eventType;
};

module.exports = {
  getService,
  createEventType,
  updateEventType,
  deleteEventType,
  getEventType,
  getEventTypeByName,
  isValidUUID,
  getEventTypes,
};
