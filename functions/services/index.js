const { AppResponse } = require("./api");
const { APIResponse, HTTP } = require("./config");
const {
  createService,
  listServices,
  deleteService,
  getService,
} = require("./utils");

const handler = async (event) => {
  const httpMethod = event.httpMethod;
  const body = JSON.parse(event.body);
  const params = event.pathParameters;
  const serviceId = params.service_id;

  try {
    if (serviceId) {
      switch (httpMethod) {
        case HTTP.GET:
          const retreivedService = await getService(serviceId);

          if (retreivedService.rowCount === 0) {
            return AppResponse({
              message: "No service exists with that ID",
              status: APIResponse.VALIDATION_FAILED,
            });
          }

          return AppResponse({
            message: "Service retreived successfully",
            status: APIResponse.OK,
            data: retreivedService.rows,
          });
        case HTTP.DELETE:
          const serviceToDelete = await getService(serviceId);

          if (serviceToDelete.rowCount === 0) {
            return AppResponse({
              message: "No service exists with that ID",
              status: APIResponse.VALIDATION_FAILED,
            });
          }

          const deletedService = await deleteService(serviceId);

          return AppResponse({
            message: "Service deleted successfully",
            status: APIResponse.OK,
            data: deletedService.rows,
          });
      }
    } else {
      switch (httpMethod) {
        case HTTP.GET:
          const services = await listServices();
          return AppResponse({
            message: "Services retrieved successfully",
            data: services.rows,
          });
        case HTTP.POST:
          const { name } = body;

          if (!name) {
            return AppResponse({
              message: "Name of service is required",
              status: APIResponse.VALIDATION_FAILED,
            });
          }

          const service = await createService(name);

          return AppResponse({
            message: "Service created successfully",
            data: service.rows,
          });
      }
    }

    return AppResponse({
      message: "No Valid Method Found",
    });
  } catch (err) {
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
