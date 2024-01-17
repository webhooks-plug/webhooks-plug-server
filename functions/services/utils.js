const { pgPool } = require("./config");
const { queries } = require("./queries");

const createService = async (name) => {
  const poolClient = await pgPool.connect();
  const service = await poolClient.query(queries.CREATE_SERVICE, [name]);
  await pgPool.end();
  return service;
};

const listServices = async () => {
  const poolClient = await pgPool.connect();
  const service = await poolClient.query(queries.LIST_SERVICES);
  await pgPool.end();
  return service;
};

const getService = async (serviceId) => {
  const poolClient = await pgPool.connect();
  const service = await poolClient.query(queries.GET_SERVICE, [serviceId]);
  await pgPool.end();
  return service;
};

const deleteService = async (serviceId) => {
  const deleteSubscriptions = async () => {
    const poolClient = await pgPool.connect();
    const service = await poolClient.query(queries.DELETE_USERS, [serviceId]);
    await pgPool.end();
    return service;
  };
  const deleteEndpoints = async () => {
    const poolClient = await pgPool.connect();
    const service = await poolClient.query(queries.DELETE_ENDPOINTS, [
      serviceId,
    ]);
    await pgPool.end();
    return service;
  };
  const deleteEvents = async () => {
    const poolClient = await pgPool.connect();
    const service = await poolClient.query(queries.DELETE_EVENTS, [serviceId]);
    await pgPool.end();
    return service;
  };
  const deleteEventTypes = async () => {
    const poolClient = await pgPool.connect();
    const service = await poolClient.query(queries.DELETE_EVENTS, [serviceId]);
    await pgPool.end();
    return service;
  };
  const deleteUsers = async () => {
    const poolClient = await pgPool.connect();
    const service = await poolClient.query(queries.DELETE_USERS, [serviceId]);
    await pgPool.end();
    return service;
  };
  const deleteService = async () => {
    const poolClient = await pgPool.connect();
    const service = await poolClient.query(queries.DELETE_SERVICE, [serviceId]);
    await pgPool.end();
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
  listServices,
  getService,
  deleteService,
  createService,
};
