const { queries } = require("./queries");
const { createClient } = require("/opt");
const { SNSClient, SubscribeCommand } = require("@aws-sdk/client-sns");

const snsClient = new SNSClient({
  region: process.env.REGION,
});

const isValidUUID = (uuid) => {
  const uuidRegex =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
  return uuidRegex.test(uuid);
};

const isHttps = (url) => {
  const httpOrHttpsRegex = /^https?:\/\//;
  return httpOrHttpsRegex.test(url);
};

const validateUrl = (url) => {
  const urlRegex = isHttps(url)
    ? /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/
    : /^(http?|ftp):\/\/[^\s/$.?#].[^\s]*$/;
  return urlRegex.test(url);
};

const createSNSSubscription = async (url, topicArn) => {
  const params = {
    Protocol: isHttps(url) ? "https" : "http",
    TopicArn: topicArn,
    Endpoint: url,
    ReturnSubscriptionArn: true,
  };

  const command = new SubscribeCommand(params);
  const response = await snsClient.send(command);
  return response.SubscriptionArn;
};

const getEventType = async (eventTypeId) => {
  const poolClient = await createClient();
  const eventType = await poolClient.query(queries.GET_EVENT_TYPE, [
    eventTypeId,
  ]);
  return eventType;
};

const getEventTypeByName = async (eventTypeName) => {
  const poolClient = await createClient();
  const eventType = await poolClient.query(queries.GET_EVENT_TYPE_NAME, [
    eventTypeName,
  ]);
  return eventType;
};

const createSubscription = async (userId, url, eventType) => {
  console.log(eventType);
  const poolClient = await createClient();

  const createEndpoint = async () => {
    const endpoint = await poolClient.query(queries.CREATE_ENDPOINT, [
      userId,
      url,
    ]);

    return endpoint;
  };

  const response = await createEndpoint();
  const endpointInfo = response.rows[0];

  const endpointId = endpointInfo.id;

  const snsTopicArn = eventType.topic_arn;

  if (validateUrl(url)) {
    const subscriptionArn = await createSNSSubscription(url, snsTopicArn);

    const subscription = await poolClient.query(queries.CREATE_SUBSCRIPTION, [
      eventType.id,
      endpointId,
      subscriptionArn,
    ]);

    return subscription.rows;
  }

  return [];
};

const getSubscription = async (subscriptionId) => {
  const poolClient = await createClient();
  const subscription = await poolClient.query(queries.GET_SUBSCRIPTION, [
    subscriptionId,
  ]);
  return subscription;
};

const getSubscriptions = async (eventTypeId) => {
  const poolClient = await createClient();
  const subscription = await poolClient.query(queries.GET_SUBSCRIPTIONS, [
    eventTypeId,
  ]);
  return subscription;
};

const deleteSubscription = async (subscriptionId) => {
  const poolClient = await createClient();

  const deleteEndpoints = async () => {
    const endpoints = await poolClient.query(queries.DELETE_ENDPOINTS, [
      subscriptionId,
    ]);
    return endpoints;
  };

  const deleteSubscription = async () => {
    const subscriptions = await poolClient.query(queries.DELETE_SUBSCRIPTION, [
      subscriptionId,
    ]);
    return subscriptions;
  };

  await deleteEndpoints();
  const subscription = await deleteSubscription();

  return subscription;
};

module.exports = {
  getEventType,
  getSubscription,
  getSubscriptions,
  deleteSubscription,
  createSubscription,
  getEventTypeByName,
  isValidUUID,
};
