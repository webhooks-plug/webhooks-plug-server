const { createClient } = require("/opt");
const { queries } = require("./queries");

const isValidUUID = (uuid) => {
  const uuidRegex =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
  return uuidRegex.test(uuid);
};

const createService = async (name) => {
  const poolClient = await createClient();
  const service = await poolClient.query(queries.CREATE_SERVICE, [name]);
  return service;
};

const getServiceByName = async (name) => {
  const poolClient = await createClient();
  const service = await poolClient.query(queries.GET_SERVICE_NAME, [name]);
  return service;
};

const listServices = async () => {
  const poolClient = await createClient();
  const services = await poolClient.query(queries.LIST_SERVICES);
  return services;
};

const getService = async (serviceId) => {
  const poolClient = await createClient();
  const service = await poolClient.query(queries.GET_SERVICE, [serviceId]);
  return service;
};

const deleteService = async (serviceId) => {
  const poolClient = await createClient();

  const deleteSubscriptions = async () => {
    const service = await poolClient.query(queries.DELETE_SUBSCRIPTIONS, [
      serviceId,
    ]);
    return service;
  };
  const deleteEndpoints = async () => {
    const service = await poolClient.query(queries.DELETE_ENDPOINTS, [
      serviceId,
    ]);
    return service;
  };
  const deleteEvents = async () => {
    const service = await poolClient.query(queries.DELETE_EVENTS, [serviceId]);
    return service;
  };
  const deleteEventTypes = async () => {
    const service = await poolClient.query(queries.DELETE_EVENT_TYPES, [
      serviceId,
    ]);
    return service;
  };
  const deleteUsers = async () => {
    const service = await poolClient.query(queries.DELETE_USERS, [serviceId]);
    return service;
  };
  const deleteService = async () => {
    const service = await poolClient.query(queries.DELETE_SERVICE, [serviceId]);
    return service;
  };

  await deleteSubscriptions();
  await deleteEndpoints();
  await deleteEvents();
  await deleteEventTypes();
  await deleteUsers();
  return await deleteService();
};

module.exports = {
  isValidUUID,
  listServices,
  getService,
  deleteService,
  createService,
  getServiceByName,
};
