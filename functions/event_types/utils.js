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
  return service;
};

const createEventType = async (serviceId, eventName, topicArn) => {
  const poolClient = await createClient();
  const eventType = await poolClient.query(queries.CREATE_EVENT_TYPE, [
    eventName,
    serviceId,
    topicArn,
  ]);
  return eventType;
};

const updateEventType = async (eventTypeId, eventName) => {
  const poolClient = await createClient();
  const eventType = await poolClient.query(queries.UPDATE_EVENT_TYPE, [
    eventName,
    eventTypeId,
  ]);
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
  return eventType;
};

const getEventType = async (eventTypeId) => {
  const poolClient = await createClient();
  const eventType = await poolClient.query(queries.GET_EVENT_TYPE, [
    eventTypeId,
  ]);
  return eventType;
};

const getEventTypeByName = async (name, serviceId) => {
  const poolClient = await createClient();
  const eventType = await poolClient.query(queries.GET_EVENT_TYPE_NAME, [
    name,
    serviceId,
  ]);
  return eventType;
};

const getEventTypes = async (serviceId) => {
  const poolClient = await createClient();
  const eventType = await poolClient.query(queries.GET_EVENT_TYPES, [
    serviceId,
  ]);
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
