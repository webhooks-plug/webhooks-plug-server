const { AppResponse } = require("./api");
const { APIResponse, HTTP } = require("./config");
const { finalizeSNSTopic } = require("./sns");
const { createEventType } = require("./utils");

const event_types = async (event) => {
  const httpMethod = event.httpMethod;
  const body = JSON.parse(event.body);
  const params = event.pathParameters;
  const serviceId = params.service_id;
  const eventTypeId = params.event_id;

  if (serviceId) {
    switch (httpMethod) {
      case HTTP.POST:
        const { name } = body;

        if (!name || !serviceId) {
          return AppResponse({
            message: "Service ID and name of event type is required",
            status: APIResponse.VALIDATION_FAILED,
          });
        }

        const snsTopicARN = await finalizeSNSTopic();

        if (snsTopicARN) {
          const eventType = await createEventType(serviceId, name);

          return AppResponse({
            message: "Event type created successfully",
            data: eventType,
          });
        }
    }
  }
};

module.exports = {
  event_types,
};

// Create event type
// Update event type
// Delete event type
