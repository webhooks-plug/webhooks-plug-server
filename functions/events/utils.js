const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
const { queries } = require("./queries");
const { v4: uuid } = require("uuid");
const { createClient } = require("/opt");

const snsClient = new SNSClient({
  region: process.env.REGION,
});

const isValidUUID = (uuid) => {
  const uuidRegex =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
  return uuidRegex.test(uuid);
};

const publishSNS = async (topicArn, message, userId, eventId) => {
  const params = {
    TopicArn: topicArn,
    Message: message,
    MessageAttributes: {
      userId: {
        DataType: "String",
        StringValue: userId,
      },
      messageId: {
        DataType: "String",
        StringValue: eventId,
      },
    },
  };

  const command = new PublishCommand(params);
  const response = await snsClient.send(command);
  return response.MessageId;
};

const getEventType = async (eventTypeName) => {
  const poolClient = await createClient();
  const eventType = await poolClient.query(queries.GET_EVENT_TYPE, [
    eventTypeName,
  ]);
  poolClient.release();
  return eventType;
};

const createEvent = async (payload, userId, eventTypeId, eventUniqueKey) => {
  const poolClient = await createClient();
  const eventType = await poolClient.query(queries.CREATE_EVENT, [
    payload,
    userId,
    eventTypeId,
    eventUniqueKey,
  ]);
  poolClient.release();
  return eventType.rows;
};

const createMessage = async (status, userId, eventId, endpoint, messageId) => {
  const poolClient = await createClient();
  const message = await poolClient.query(queries.CREATE_MESSAGE, [
    status,
    userId,
    eventId,
    endpoint,
    messageId,
  ]);
  poolClient.release();
  return message.rows;
};

const getSubscriptions = async (eventTypeId, userId) => {
  const poolClient = await createClient();
  const subscriptions = await poolClient.query(queries.GET_SUBSCRIPTIONS, [
    eventTypeId,
    userId,
  ]);
  poolClient.release();
  return subscriptions.rows;
};

const publishEvent = async (eventType, message, userId) => {
  const eventUniqueKey = uuid();

  const event = await createEvent(
    message,
    userId,
    eventType.id,
    eventUniqueKey
  );

  const eventId = event[0].id;

  const stringifiedMessage = JSON.stringify({
    messageMeta: {
      eventId,
      userId,
    },
    message,
  });

  const messageId = await publishSNS(
    eventType.topic_arn,
    stringifiedMessage,
    userId,
    eventId
  );

  const subscriptions = await getSubscriptions(eventType.id, userId);

  const messages = subscriptions.map((sub) => {
    const endpoint = sub.url;
    const message = createMessage(0, userId, eventId, endpoint, messageId);
    return message;
  });

  await Promise.all(messages);

  return event;
};

module.exports = {
  getEventType,
  publishEvent,
  isValidUUID,
};
