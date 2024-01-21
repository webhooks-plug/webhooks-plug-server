const { AppResponse } = require("./api");
const { APIResponse, HTTP } = require("./config");
const { publishEvent, getEventType, isValidUUID } = require("./utils");

const handler = async (event) => {
  const httpMethod = event.httpMethod;
  const body = JSON.parse(event.body);
  const params = event.pathParameters;
  const eventTypeId = params?.event_id;

  try {
    switch (httpMethod) {
      case HTTP.POST:
        const { event_type_name, message, user_id } = body;

        if (!event_type_name || !message || !user_id) {
          return AppResponse({
            message: "Event type name, message and user ID is required",
            status: APIResponse.VALIDATION_FAILED,
          });
        }

        if (!isValidUUID(user_id)) {
          return AppResponse({
            message: "User ID is not a valid uuid",
            status: APIResponse.VALIDATION_FAILED,
          });
        }

        const eventType = await getEventType(event_type_name);

        if (eventType.rowCount === 0) {
          return AppResponse({
            message: "Event type name is invalid",
            status: APIResponse.VALIDATION_FAILED,
          });
        }

        // Check if there is a subscription for that event type and user id
        const event = await publishEvent(eventType.rows[0], message, user_id);

        return AppResponse({
          message: "Event published successfully",
          data: event,
        });
    }
  } catch (err) {
    console.log(err);
    return AppResponse({
      message: "Server error occured",
      status: APIResponse.SERVER_ERROR,
      error: err,
    });
  }
};

module.exports = {
  handler,
};
