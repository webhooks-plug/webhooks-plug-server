const { AppResponse } = require("./api");
const { APIResponse, HTTP } = require("./config");
const { finalizeSNSTopic } = require("./sns");
const {
  createEventType,
  getService,
  getEventTypes,
  getEventType,
  deleteEventType,
  updateEventType,
  isValidUUID,
  getEventTypeByName,
} = require("./utils");

const handler = async (event) => {
  const httpMethod = event.httpMethod;
  const body = JSON.parse(event.body);
  const params = event.pathParameters;
  const queryParams = event.queryStringParameters;
  const serviceId = queryParams?.service_id;
  const eventTypeId = params?.event_type_id;
  const accountId = event.requestContext.accountId;

  try {
    if (eventTypeId) {
      switch (httpMethod) {
        case HTTP.GET:
          if (!isValidUUID(eventTypeId)) {
            return AppResponse({
              message: "Event type ID is not a valid uuid",
              status: APIResponse.VALIDATION_FAILED,
            });
          }

          const eventType = await getEventType(eventTypeId);

          if (eventType.rowCount === 0) {
            return AppResponse({
              message: "Event Id is invalid",
              status: APIResponse.VALIDATION_FAILED,
            });
          }

          return AppResponse({
            message: "Event type retreived successfully",
            data: eventType.rows,
          });
        case HTTP.DELETE:
          // Delete sns topic, log group and statement ID of event types
          if (!isValidUUID(eventTypeId)) {
            return AppResponse({
              message: "Event type ID is not a valid uuid",
              status: APIResponse.VALIDATION_FAILED,
            });
          }

          const eventTypeToDelete = await getEventType(eventTypeId);

          if (eventTypeToDelete.rowCount === 0) {
            return AppResponse({
              message: "Event Id is invalid",
              status: APIResponse.VALIDATION_FAILED,
            });
          }

          const deletedEventType = await deleteEventType(eventTypeId);

          return AppResponse({
            message: "Event type deleted successfully",
            data: deletedEventType.rows,
          });
        case HTTP.PUT:
          const { name } = body;

          if (!name) {
            return AppResponse({
              message: "Name of event is required",
              status: APIResponse.VALIDATION_FAILED,
            });
          }

          if (!isValidUUID(eventTypeId)) {
            return AppResponse({
              message: "Event type ID is not a valid uuid",
              status: APIResponse.VALIDATION_FAILED,
            });
          }

          const eventTypeToUpdate = await getEventType(eventTypeId);

          if (eventTypeToUpdate.rowCount === 0) {
            return AppResponse({
              message: "Event Id is invalid",
              status: APIResponse.VALIDATION_FAILED,
            });
          }

          const updatedEventType = await updateEventType(eventTypeId, name);

          return AppResponse({
            message: "Event type updated successfully",
            data: updatedEventType.rows,
          });
      }
    } else {
      switch (httpMethod) {
        case HTTP.GET:
          if (!serviceId) {
            return AppResponse({
              message: "Service ID is required",
              status: APIResponse.VALIDATION_FAILED,
            });
          }

          if (!isValidUUID(serviceId)) {
            return AppResponse({
              message: "Service ID is not a valid uuid",
              status: APIResponse.VALIDATION_FAILED,
            });
          }

          const serviceToUse = await getService(serviceId);

          if (serviceToUse.rowCount === 0) {
            return AppResponse({
              message: "Service ID is invalid",
              status: APIResponse.VALIDATION_FAILED,
            });
          }

          const eventTypes = await getEventTypes(serviceId);

          return AppResponse({
            message: "Event types retreived successfully",
            data: eventTypes.rows,
          });
        case HTTP.POST:
          const { name, service_id } = body;

          if (!name || !service_id) {
            return AppResponse({
              message: "Service ID and name of event type is required",
              status: APIResponse.VALIDATION_FAILED,
            });
          }

          if (!isValidUUID(service_id)) {
            return AppResponse({
              message: "Service ID is not a valid uuid",
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

          const eventType = await getEventTypeByName(name, service_id);

          if (eventType.rowCount > 0) {
            return AppResponse({
              message:
                "An event type with that name tied to that service already exists.",
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
              data: eventType.rows,
            });
          }
      }
    }

    return AppResponse({
      message: "No Valid Method Found",
    });
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
