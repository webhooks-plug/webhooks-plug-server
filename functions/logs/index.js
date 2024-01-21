const zlib = require("zlib");
const base64 = require("base64-js");
const { promisify } = require("util");
const { createClient } = require("/opt");
const { queries } = require("./queries");

const updateMessage = async (deliveredAt, status, endpoint, snsMessageId) => {
  const client = await createClient();
  const message = await client.query(queries.UPDATE_MESSAGE, [
    deliveredAt,
    status,
    endpoint,
    snsMessageId,
  ]);
  return message;
};

const handler = async (event) => {
  console.log(event);
  try {
    const compressedData = event.awslogs.data;
    const decodedData = base64.toByteArray(compressedData);
    const promisifiedData = promisify(zlib.gunzip);
    const decompressedBuffer = await promisifiedData(decodedData);
    const decompressedText = decompressedBuffer.toString("utf-8");

    const logEvents = decompressedText.logEvents || [];

    if (logEvents.length > 0) {
      const messageUpdates = logEvents.map((event) => {
        const message = event.message;
        const snsMessageId = message.notification.messageId;
        const timestamp = message.notification.timestamp;
        const endpoint = message.delivery.destination;
        const status = message.status;

        if (status === "SUCCESS") {
          return updateMessage(timestamp, 1, endpoint, snsMessageId);
        }

        return updateMessage(null, 0, endpoint, snsMessageId);
      });

      await Promise.all(messageUpdates);
    }
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  handler,
};
