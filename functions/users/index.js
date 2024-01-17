const { AppResponse } = require("./api");
const { HTTP, APIResponse } = require("./config");
const {
  createUser,
  getService,
  listUsers,
  getUser,
  updateUser,
  deleteUser,
} = require("./utils");

const handler = async (event) => {
  const httpMethod = event.httpMethod;
  const body = JSON.parse(event.body);
  const params = event.pathParameters;
  const userId = params.user_id;

  try {
    if (userId) {
      switch (httpMethod) {
        case HTTP.POST:
          const { name } = body;

          const userToUpdate = await getUser(userId);

          if (userToUpdate.rowCount === 0) {
            return AppResponse({
              message: "No user exists with that ID",
              status: APIResponse.VALIDATION_FAILED,
            });
          }

          const updatedUser = await updateUser(userId, name);

          return AppResponse({
            message: "User updated successfully",
            data: updatedUser.rows,
          });
        case HTTP.GET:
          const retrievedUser = await getUser(userId);

          if (retrievedUser.rowCount === 0) {
            return AppResponse({
              message: "No user exists with that ID",
              status: APIResponse.VALIDATION_FAILED,
            });
          }

          return AppResponse({
            message: "User retreived successfully",
            data: retrievedUser.rows,
          });
        case HTTP.DELETE:
          const userToDelete = await getUser(userId);

          if (userToDelete.rowCount === 0) {
            return AppResponse({
              message: "No user exists with that ID",
              status: APIResponse.VALIDATION_FAILED,
            });
          }

          const deletedUser = await deleteUser(userId);

          return AppResponse({
            message: "User deleted successfully",
            data: deletedUser.rows,
          });
      }
    } else {
      switch (httpMethod) {
        case HTTP.POST:
          const { name, service_id } = body;

          if (!name || !service_id) {
            return AppResponse({
              message: "Service ID and name of event type is required",
              status: APIResponse.VALIDATION_FAILED,
            });
          }

          const service = await getService(service_id);

          if (service.rowCount === 0) {
            return AppResponse({
              message: "Service ID is invalid",
              status: APIResponse.VALIDATION_FAILED,
            });
          }

          const user = await createUser();

          return AppResponse({
            message: "User created successfully",
            data: user.rows,
          });
        case HTTP.GET:
          const users = await listUsers();

          return AppResponse({
            message: "Users retreived successfully",
            data: users.rows,
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
