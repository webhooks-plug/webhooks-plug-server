const { AppResponse } = require("./api");
const { APIResponse, HTTP } = require("./config");
const { listMessages } = require("./utils");

const handler = async (event) => {
  const httpMethod = event.httpMethod;
  const body = JSON.parse(event.body);
  const params = event.pathParameters;
  const messageId = params?.message_id;

  try {
    if (messageId) {
      switch (httpMethod) {
      }
    } else {
      switch (httpMethod) {
        case HTTP.GET:
          const messages = await listMessages();

          return AppResponse({
            message: "Messages retrieved successfully",
            data: messages.rows,
          });
      }
    }

    return AppResponse({
      message: "No Valid method found",
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
