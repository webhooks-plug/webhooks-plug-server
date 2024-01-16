const { APIResponse } = require("./config");

const AppResponse = ({
  data = {},
  error = null,
  message,
  status = APIResponse.OK,
}) => {
  return {
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
