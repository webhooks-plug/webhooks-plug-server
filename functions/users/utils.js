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

const createUser = async (name, serviceId) => {
  const poolClient = await createClient();
  const user = await poolClient.query(queries.CREATE_USER, [name, serviceId]);
  return user;
};

const updateUser = async (userId, name) => {
  const poolClient = await createClient();
  const user = await poolClient.query(queries.UPDATE_USER, [name, userId]);
  return user;
};

const getUser = async (userId) => {
  const poolClient = await createClient();
  const user = await poolClient.query(queries.GET_USER, [userId]);
  return user;
};

const listUsers = async (serviceId) => {
  const poolClient = await createClient();
  const user = await poolClient.query(queries.LIST_USERS, [serviceId]);
  return user;
};

const deleteUser = async (userId) => {
  const poolClient = await createClient();

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
  return user;
};

module.exports = {
  getService,
  updateUser,
  getUser,
  createUser,
  listUsers,
  deleteUser,
  isValidUUID,
};
