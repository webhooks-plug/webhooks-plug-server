const zeroTimestamp = "1970-01-01T00:00:00.000Z";

const queries = {
  CREATE_SERVICE: `insert into services (name) values ($1) returning id, name, created_on`,
  LIST_SERVICES: `select id, name, created_on from services where deleted_on = '${zeroTimestamp}'`,
  GET_SERVICE: `select id, name from services where deleted_on = '${zeroTimestamp}' and id = $1`,
  GET_SERVICE_NAME: `select id, name from services where deleted_on = '${zeroTimestamp}' and name = $1`,
  DELETE_USERS: `update users set deleted_on = now() where users.service_id = $1 and users.deleted_on = '${zeroTimestamp}'`,
  DELETE_ENDPOINTS: `update endpoints set deleted_on = now() from users where users.id = endpoints.user_id and users.service_id = $1 and users.deleted_on = '${zeroTimestamp}'`,
  DELETE_EVENT_TYPES: `update event_types set deleted_on = now() where event_types.service_id = $1 and event_types.deleted_on = '${zeroTimestamp}'`,
  DELETE_SUBSCRIPTIONS: `update subscriptions set deleted_on = now() from event_types where event_types.id = subscriptions.event_type_id and event_types.service_id = $1 and event_types.deleted_on = '${zeroTimestamp}'`,
  DELETE_EVENTS: `update events set deleted_on = now() from users where users.id = events.user_id and users.service_id = $1 and events.deleted_on = '${zeroTimestamp}'`,
  DELETE_SERVICE: `update services set deleted_on = now() where id = $1 and deleted_on = '${zeroTimestamp}' returning id, name, created_on`,
};

module.exports = {
  zeroTimestamp,
  queries,
};
