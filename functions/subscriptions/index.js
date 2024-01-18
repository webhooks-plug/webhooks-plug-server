const { AppResponse } = require("./api");
const { HTTP, APIResponse } = require("./config");
const {
  createSubscription,
  getSubscriptions,
  getEventType,
  getSubscription,
  deleteSubscription,
} = require("./utils");

const handler = async (event) => {
  const httpMethod = event.httpMethod;
  const body = JSON.parse(event.body);
  const params = event.pathParameters;
  const subscriptionId = params.subscription_id;

  try {
    if (subscriptionId) {
      switch (httpMethod) {
        case HTTP.GET:
          const subscription = await getSubscription(subscriptionId);

          if (subscription.rowCount === 0) {
            return AppResponse({
              message: "Subscription ID is invalid",
              status: APIResponse.VALIDATION_FAILED,
            });
          }

          return AppResponse({
            message: "Subscription retreived successfully",
            data: subscription.rows,
          });
        case HTTP.DELETE:
          const subscriptionToDelete = await getSubscription(subscriptionId);

          if (subscriptionToDelete.rowCount === 0) {
            return AppResponse({
              message: "Subscription ID is invalid",
              status: APIResponse.VALIDATION_FAILED,
            });
          }

          const deletedSubscription = await deleteSubscription(subscriptionId);

          return AppResponse({
            message: "Subscription deleted successfully",
            data: deletedSubscription.rows,
          });
      }
    } else {
      switch (httpMethod) {
        case HTTP.POST:
          const { user_id, url, event_type_id } = body;

          if (!user_id || !url || !event_type_id) {
            return AppResponse({
              message: "User ID, url and event type ID is required",
              status: APIResponse.VALIDATION_FAILED,
            });
          }

          const subscription = createSubscription(user_id, url, event_type_id);

          return AppResponse({
            message: "Subscription created successfully",
            data: subscription,
          });
        case HTTP.GET:
          const { event_type_id: eventTypeId } = body;

          const retrievedEventType = await getEventType(eventTypeId);

          if (retrievedEventType.rowCount === 0) {
            return AppResponse({
              message: "Event type ID is invalid",
              status: APIResponse.VALIDATION_FAILED,
            });
          }

          const subscriptions = await getSubscriptions(eventTypeId);

          return AppResponse({
            message: "Subscriptions retreived successfully",
            data: subscriptions.rows,
          });
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
  handler,
};
