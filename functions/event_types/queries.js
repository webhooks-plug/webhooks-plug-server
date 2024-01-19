const zeroTimestamp = "1970-01-01T00:00:00.000Z";

const queries = {
  CREATE_EVENT_TYPE: `insert into event_types (name, service_id, topic_arn) values ($1, $2, $3) returning id, name, service_id, topic_arn, created_on`,
  UPDATE_EVENT_TYPE: `update event_types set name = $1 where id = $2 and deleted_on = '${zeroTimestamp}' returning id, name, service_id, topic_arn, created_on`,
  DELETE_SUBSCRIPTION: `update subscriptions set deleted_on = now() where event_type_id = $1 and deleted_on = '${zeroTimestamp}'`,
  DELETE_EVENT_TYPE: `update event_types set deleted_on = now() where id = $1 returning id, name, service_id, topic_arn, created_on`,
  GET_EVENT_TYPE: `select id, name, service_id, topic_arn from event_types where id = $1 and deleted_on = '${zeroTimestamp}'`,
  GET_EVENT_TYPE_NAME: `select id, name, service_id, topic_arn from event_types where name = $1 and service_id = $2 and deleted_on = '${zeroTimestamp}'`,
  GET_EVENT_TYPES: `select e.id, e.name, s.name, e.topic_arn from event_types e join services s on s.id = e.service_id where s.id = $1 and s.deleted_on = '${zeroTimestamp}' and e.deleted_on = '${zeroTimestamp}' `,
  GET_SERVICE: `select id, name from services where deleted_on = '${zeroTimestamp}' and id = $1`,
};

module.exports = {
  queries,
};
