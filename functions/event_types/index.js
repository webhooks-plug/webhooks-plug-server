const { AppResponse } = require("./api");
const { APIResponse, HTTP } = require("./config");
const { finalizeSNSTopic } = require("./sns");
const { createEventType, getService } = require("./utils");

const event_types = async (event) => {
  const httpMethod = event.httpMethod;
  const body = JSON.parse(event.body);
  const params = event.pathParameters;
  const eventTypeId = params.event_type_id;
  const accountId = event.requestContext.accountId;

  try {
    if (eventTypeId) {
      switch (httpMethod) {
        case HTTP.POST:
          const { name, service_id } = body;

          if (!name || !service_id) {
            return AppResponse({
              message: "Service ID and name of event type is required",
              status: APIResponse.VALIDATION_FAILED,
            });
          }

          const service = await getService(service_id);

          if (service.rowCount === 0) {
            return AppResponse({
              message: "Service ID is invalid",
              status: APIResponse.VALIDATION_FAILED,
            });
          }

          const snsTopicARN = await finalizeSNSTopic(
            service_id,
            name,
            accountId
          );

          if (snsTopicARN) {
            const eventType = await createEventType(
              service_id,
              name,
              snsTopicARN
            );

            return AppResponse({
              message: "Event type created successfully",
              data: eventType,
            });
          }
      }
    }

    return AppResponse({
      message: "No Valid Method Found",
    });
  } catch (err) {
    return AppResponse({
      message: "Server error occured",
      status: APIResponse.SERVER_ERROR,
      error: err,
    });
  }
};

module.exports = {
  event_types,
};

// Create event type
// Update event type
// Delete event type
