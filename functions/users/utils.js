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

const listUsers = async (serviceId) => {
  const poolClient = await pgPool.connect();
  const user = await poolClient.query(queries.LIST_USERS, [serviceId]);
  await pgPool.end();
  return user;
};

const deleteUser = async (userId) => {
  const poolClient = await pgPool.connect();

  const deleteSubscriptions = async () => {
    const subscriptions = await poolClient.query(queries.DELETE_SUBSCRIPTIONS, [
      userId,
    ]);
    return subscriptions;
  };
  const deleteEndpoints = async () => {
    const endpoints = await poolClient.query(queries.DELETE_ENDPOINTS, [
      userId,
    ]);
    return endpoints;
  };
  const deleteMessages = async () => {
    const messages = await poolClient.query(queries.DELETE_MESSAGES, [userId]);
    return messages;
  };
  const deleteEvents = async () => {
    const events = await poolClient.query(queries.DELETE_EVENTS, [userId]);
    return events;
  };
  const deleteUser = async () => {
    const users = await poolClient.query(queries.DELETE_USER, [userId]);
    return users;
  };

  await deleteSubscriptions();
  await deleteEndpoints();
  await deleteMessages();
  await deleteEvents();

  const user = await deleteUser();
  await pgPool.end();

  return user;
};

module.exports = {
  getService,
  updateUser,
  getUser,
  createUser,
  listUsers,
  deleteUser,
};
