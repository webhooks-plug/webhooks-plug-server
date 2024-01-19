const zeroTimestamp = "1970-01-01T00:00:00.000Z";

const queries = {
  CREATE_USER: `insert into users (name, service_id) values ($1, $2) returning id, name, created_on`,
  GET_SERVICE: `select id, name from services where deleted_on = '${zeroTimestamp}' and id = $1`,
  GET_USER: `select id, name from users where deleted_on = '${zeroTimestamp}' and id = $1`,
  LIST_USERS: `select users.id, users.name, users.created_on from users join services on services.id = users.service_id where services.id = $1 and users.deleted_on = '${zeroTimestamp}'`,
  DELETE_SUBSCRIPTIONS: `update subscriptions set deleted_on = now() from endpoints as en where subscriptions.endpoint_id = en.id and en.user_id = $1 and subscriptions.deleted_on = '${zeroTimestamp}';`,
  DELETE_ENDPOINTS: `update endpoints set deleted_on = now() where endpoints.user_id = $1 and endpoints.deleted_on = '${zeroTimestamp}'`,
  DELETE_MESSAGES: `update messages set deleted_on = now() where messages.user_id = $1 and messages.deleted_on = '${zeroTimestamp}'`,
  DELETE_EVENTS: `update events set deleted_on = now() where events.user_id = $1 and events.deleted_on = '${zeroTimestamp}'`,
  DELETE_USER: `update users set deleted_on = now() where users.id = $1 and users.deleted_on = '${zeroTimestamp}' returning id, name, deleted_on`,
  UPDATE_USER: `update users set name = $1 where users.id = $2 and users.deleted_on = '${zeroTimestamp}' returning id, name, created_on`,
};

module.exports = {
  zeroTimestamp,
  queries,
};
