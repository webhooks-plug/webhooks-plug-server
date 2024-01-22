const { APIResponse } = require("./config");

const AppResponse = ({
  data = {},
  error = null,
  message,
  status = APIResponse.OK,
}) => {
  return {
    statusCode: status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE",
    },
    body: JSON.stringify({
      error,
      data,
      status,
      message,
    }),
  };
};

module.exports = {
  AppResponse,
};
