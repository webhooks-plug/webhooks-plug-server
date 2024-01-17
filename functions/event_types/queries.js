const queries = {
  CREATE_EVENT_TYPE: `insert into event_types (name, service_id, topic_arn) values ($1, $2, $3) returning id, name, service_id, topic_arn, created_on`,
  GET_SERVICE: `select id, name from services where deleted_on = ${zeroTimestamp} and id = $1`,
};

module.exports = {
  queries,
};
