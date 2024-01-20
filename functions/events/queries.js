const zeroTimestamp = "1970-01-01T00:00:00.000Z";

const queries = {
  CREATE_EVENT: `insert into events (payload, user_id, event_type_id, event_unique_key) values ($1, $2, $3, $4) returning id, user_id, event_type_id, event_unique_key, created_on`,
  CREATE_MESSAGE: `insert into messages (status, user_id, event_id, endpoint) values ($1, $2, $3, $4) returning id, user_id, event_id, endpoint, created_on`,
  GET_EVENT_TYPE: `select id, name, service_id, topic_arn from event_types where name = $1 and deleted_on = '${zeroTimestamp}'`,
  GET_SUBSCRIPTIONS: `select s.id, e.url, s.endpoint_id from subscriptions s join endpoints e on e.id = s.endpoint_id where s.event_type_id = $1 and e.user_id = $2 and s.deleted_on = '${zeroTimestamp}'`,
};

module.exports = {
  queries,
};
