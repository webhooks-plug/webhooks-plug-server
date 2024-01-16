const queries = {
  CREATE_EVENT_TYPE: `insert into event_types (name, service_id, topic_arn) values ($1, $2, $3) returning id, name, service_id, topic_arn, created_on`,
};

module.exports = {
  queries,
};
