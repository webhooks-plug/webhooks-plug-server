const zlib = require("zlib");
const base64 = require("base64-js");
const { promisify } = require("util");
const { createClient } = require("/opt");

const handler = async (event) => {
  console.log(event);
  const compressedData = event.awslogs.data;
  const decodedData = base64.toByteArray(compressedData);
  const promisifiedData = promisify(zlib.gunzip);
  const decompressedBuffer = await promisifiedData(decodedData);
  const decompressedText = decompressedBuffer.toString("utf-8");
  console.log(decompressedText);

  const client = await createClient();
};

module.exports = {
  handler,
};
