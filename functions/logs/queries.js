const zeroTimestamp = "1970-01-01T00:00:00.000Z";

const queries = {
  UPDATE_ENDPOINT: `update messages set delivered_at = $1, delivery_attempts = delivery_attempts + 1, status = $2 where endpoint = $3 and event_id = $4 and deleted_on = '${zeroTimestamp}'`,
};

module.exports = {
  zeroTimestamp,
  queries,
};
