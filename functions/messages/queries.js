const zeroTimestamp = "1970-01-01T00:00:00.000Z";

const queries = {
  LIST_MESSAGES: `select m.status, m.delivery_attempts, m.delivered_at, m.endpoint, m.created_on, u.name as "nameOfUser", e.payload from messages m join users u on u.id = m.user_id join events e on e.id = m.event_id where m.deleted_on = '${zeroTimestamp}' order by m.created_on desc`,
};

module.exports = {
  queries,
};
