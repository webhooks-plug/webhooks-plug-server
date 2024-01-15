const { APIResponse, HTTP } = require("./config");

const permittedRoutes = ["/services"];

const handler = async (event) => {
  const route = event.path;
  const httpMethod = event.httpMethod;

  if (!permittedRoutes.includes(route)) {
    return {
      statusCode: APIResponse.SERVER_ERROR,
      body: JSON.stringify({
        message: "Route is not permitted",
      }),
    };
  }

  switch (httpMethod) {
    case HTTP.GET:
      console.log("Get request");
      break;
  }

  console.log(event);
  // create app wide services here
  return {
    statusCode: APIResponse.OK,
    body: JSON.stringify({
      status: APIResponse.OK,
      message: "Successful response",
    }),
  };
};

module.exports = {
  handler,
};
