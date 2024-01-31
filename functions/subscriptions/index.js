const { AppResponse } = require("./api");
const { HTTP, APIResponse } = require("./config");
const {
  createSubscription,
  getSubscriptions,
  getEventType,
  getSubscription,
  deleteSubscription,
  getEventTypeByName,
  isValidUUID,
  getUser,
  getSubscriptionsForUser,
} = require("./utils");

const handler = async (event) => {
  const httpMethod = event.httpMethod;
  const body = JSON.parse(event.body);
  const params = event.pathParameters;
  const subscriptionId = params?.subscription_id;
  const queryParams = event.queryStringParameters;
  const eventTypeId = queryParams?.event_type_id;
  const userId = queryParams?.user_id;

  try {
    if (subscriptionId) {
      switch (httpMethod) {
        case HTTP.GET:
          if (!isValidUUID(subscriptionId)) {
            return AppResponse({
              message: "Subscription ID is not a valid uuid",
              status: APIResponse.VALIDATION_FAILED,
            });
          }

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
          if (!isValidUUID(subscriptionId)) {
            return AppResponse({
              message: "Subscription ID is not a valid uuid",
              status: APIResponse.VALIDATION_FAILED,
            });
          }

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
        // Check if sub exists for event type
        case HTTP.POST:
          const user_id = body?.user_id;
          const url = body?.url;
          const event_type_name = body?.event_type_name;

          if (!isValidUUID(user_id)) {
            return AppResponse({
              message: "User ID is not a valid uuid",
              status: APIResponse.VALIDATION_FAILED,
            });
          }

          if (!user_id || !url || !event_type_name) {
            return AppResponse({
              message: "User ID, url and event type ID is required",
              status: APIResponse.VALIDATION_FAILED,
            });
          }

          const eventType = await getEventTypeByName(event_type_name);

          if (eventType.rowCount === 0) {
            return AppResponse({
              message: "No event type exists with that name",
              status: APIResponse.VALIDATION_FAILED,
            });
          }

          const subscription = await createSubscription(
            user_id,
            url,
            eventType.rows[0]
          );

          const justCreatedSub = await getSubscription(subscription[0].id);

          return AppResponse({
            message: "Subscription created successfully",
            data: justCreatedSub.rows,
          });
        case HTTP.GET:
          if (userId) {
            if (!isValidUUID(userId)) {
              return AppResponse({
                message: "User ID is not a valid uuid",
                status: APIResponse.VALIDATION_FAILED,
              });
            }

            const retrievedUser = await getUser(userId);

            if (retrievedUser.rowCount === 0) {
              return AppResponse({
                message: "User ID is invalid",
                status: APIResponse.VALIDATION_FAILED,
              });
            }

            const subscriptions = await getSubscriptionsForUser(userId);

            return AppResponse({
              message: "Subscriptions retreived successfully",
              data: subscriptions.rows,
            });
          } else if (eventTypeId) {
            if (!isValidUUID(eventTypeId)) {
              return AppResponse({
                message: "Event type ID is not a valid uuid",
                status: APIResponse.VALIDATION_FAILED,
              });
            }

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
