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

const createUser = async (name, serviceId) => {
  const poolClient = await pgPool.connect();
  const user = await poolClient.query(queries.CREATE_USER, [name, serviceId]);
  await pgPool.end();
  return user;
};

const updateUser = async (userId, name) => {
  const poolClient = await pgPool.connect();
  const user = await poolClient.query(queries.UPDATE_USER, [name, userId]);
  await pgPool.end();
  return user;
};

const getUser = async (userId) => {
  const poolClient = await pgPool.connect();
  const user = await poolClient.query(queries.GET_USER, [userId]);
  await pgPool.end();
  return user;
};

const listUsers = async () => {
  const poolClient = await pgPool.connect();
  const user = await poolClient.query(queries.LIST_USERS);
  await pgPool.end();
  return user;
};

const deleteUser = async (userId) => {
  const deleteEndpoints = async () => {
    const poolClient = await pgPool.connect();
    const endpoints = await poolClient.query(queries.DELETE_ENDPOINTS, [
      userId,
    ]);
    await pgPool.end();
    return endpoints;
  };
  const deleteMessages = async () => {
    const poolClient = await pgPool.connect();
    const messages = await poolClient.query(queries.DELETE_MESSAGES, [userId]);
    await pgPool.end();
    return messages;
  };
  const deleteEvents = async () => {
    const poolClient = await pgPool.connect();
    const events = await poolClient.query(queries.DELETE_EVENTS, [userId]);
    await pgPool.end();
    return events;
  };
  const deleteUser = async () => {
    const poolClient = await pgPool.connect();
    const user = await poolClient.query(queries.DELETE_USER, [userId]);
    await pgPool.end();
    return user;
  };

  await deleteEndpoints();
  await deleteMessages();
  await deleteEvents();
  return await deleteUser();
};

module.exports = {
  getService,
  updateUser,
  getUser,
  createUser,
  listUsers,
  deleteUser,
};
