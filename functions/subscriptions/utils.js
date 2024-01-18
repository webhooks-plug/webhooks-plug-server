const { pgPool } = require("./config");
const { queries } = require("./queries");
const { SNSClient, SubscribeEndpointCommand } = require("@aws-sdk/client-sns");

const snsClient = new SNSClient({
  region: process.env.REGION,
});

const isHttps = () => {
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
  };

  const command = new SubscribeEndpointCommand(params);
  const response = await snsClient.send(command);
  return response.SubscriptionArn;
};

const getEventType = async (eventTypeId) => {
  const poolClient = await pgPool.connect();
  const eventType = await poolClient.query(queries.GET_EVENT_TYPE, [
    eventTypeId,
  ]);
  await pgPool.end();
  return eventType;
};

const createSubscription = async (userId, url, eventTypeId) => {
  const poolClient = await pgPool.connect();

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

  const eventResponse = await getEventType(eventTypeId);
  const eventInfo = eventResponse.rows[0];
  const snsTopicArn = eventInfo.topic_arn;

  if (validateUrl(url)) {
    const subscriptionArn = await createSNSSubscription(url, snsTopicArn);

    const subscription = await poolClient.query(queries.CREATE_SUBSCRIPTION, [
      eventTypeId,
      endpointId,
      subscriptionArn,
    ]);

    await pgPool.end();
    return subscription.rows;
  }

  await pgPool.end();

  return [];
};

const getSubscription = async (subscriptionId) => {
  const poolClient = await pgPool.connect();
  const subscription = await poolClient.query(queries.GET_SUBSCRIPTION, [
    subscriptionId,
  ]);
  await pgPool.end();
  return subscription;
};

const getSubscriptions = async (eventTypeId) => {
  const poolClient = await pgPool.connect();
  const subscription = await poolClient.query(queries.GET_SUBSCRIPTIONS, [
    eventTypeId,
  ]);
  await pgPool.end();
  return subscription;
};

const deleteSubscription = async (subscriptionId) => {
  const poolClient = await pgPool.connect();

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

  await pgPool.end();
  return subscription;
};

module.exports = {
  getEventType,
  getSubscription,
  getSubscriptions,
  deleteSubscription,
  createSubscription,
};
