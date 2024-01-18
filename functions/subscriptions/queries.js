const zeroTimestamp = "1970-01-01T00:00:00.000Z";

const queries = {
  CREATE_ENDPOINT: `insert into endpoints (user_id, url) values ($1, $2) returning id, url, created_on`,
  UPDATE_ENDPOINT: `update endpoints set url = $1 where endpoints.id = $2 and endpoints.deleted_on = ${zeroTimestamp}`,
  CREATE_SUBSCRIPTION: `insert into subscriptions (event_type_id, endpoint_id, subscription_arn) values ($1, $2, $3) returning id, event_type_id, endpoint_id`,
  GET_SUBSCRIPTION: `select sub.id, et.name, en.url from subscriptions sub join endpoints en on en.id = sub.endpoint_id join event_types et on et.id = sub.event_type_id where sub.deleted_on = ${zeroTimestamp} and sub.id = $1`,
  GET_SUBSCRIPTIONS: `select sub.id, et.name, en.url from subscriptions sub join endpoints en on en.id = sub.endpoint_id join event_types et on et.id = sub.event_type_id where sub.deleted_on = ${zeroTimestamp} and et.id = $1`,
  GET_EVENT_TYPE: `select id, name, topic_arn from event_types where id = $1 and deleted_on = ${zeroTimestamp}`,
  DELETE_ENDPOINTS: `update endpoints set deleted_on = now() from subscriptions as sub where sub.endpoint_id = endpoints.id and sub.id = $1 and endpoints.deleted_on = ${zeroTimestamp}`,
  DELETE_SUBSCRIPTION: `update subscriptions set deleted_on = now() where id = $1 and deleted_on = ${zeroTimestamp}`,
};

module.exports = {
  zeroTimestamp,
  queries,
};
