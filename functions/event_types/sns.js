const { SNSClient, CreateTopicCommand } = require("@aws-sdk/client-sns");
const {
  CloudWatchLogsClient,
  PutSubscriptionFilterCommand,
  CreateLogGroupCommand,
} = require("@aws-sdk/client-cloudwatch-logs");
const { IAMClient, CreateRoleCommand } = require("@aws-sdk/client-iam");

const config = {
  region: process.env.REGION,
};

const snsClient = new SNSClient(config);
const logsClient = new CloudWatchLogsClient(config);
const iamClient = new IAMClient(config);

const logDestinationLambdaArn = process.env.LOG_DESTINATION_FUNCTION_ARN;

const createRole = async (RoleName, Description) => {
  const input = {
    RoleName,
    AssumeRolePolicyDocument: JSON.stringify({
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Action: "logs:*",
          Resource: "*",
        },
      ],
    }),
    Description,
  };
  const command = new CreateRoleCommand(input);
  const response = await iamClient.send(command);
  return response.Role;
};

const createSuccessLogGroup = async (
  logGroupName,
  destinationArn,
  topicName
) => {
  const input = {
    logGroupName,
  };
  const command = new CreateLogGroupCommand(input);
  await logsClient.send(command);

  const inputSubFilter = {
    logGroupName,
    filterName: `${topicName}SuccessLogGroupTrigger`,
    filterPattern: "",
    destinationArn,
  };
  const commandSubFilter = new PutSubscriptionFilterCommand(inputSubFilter);
  await client.send(commandSubFilter);
};

const createFailureLogGroup = async (
  logGroupName,
  destinationArn,
  topicName
) => {
  const input = {
    logGroupName,
  };
  const command = new CreateLogGroupCommand(input);
  await logsClient.send(command);

  const inputSubFilter = {
    logGroupName,
    filterName: `${topicName}SuccessLogGroupTrigger`,
    filterPattern: "",
    destinationArn,
  };
  const commandSubFilter = new PutSubscriptionFilterCommand(inputSubFilter);
  await client.send(commandSubFilter);
};

const createSNSTopic = async (topicName) => {
  const successRole = await createRole(
    "SNSSuccessRole",
    "Role for SNS success notification"
  );
  const failureRole = await createRole(
    "SNSFailureRole",
    "Role for SNS failure notification"
  );

  const input = {
    Name: topicName,
    Attributes: {
      // Figure out how to set the success and failure iam roles here
      HTTPSuccessFeedbackRoleArn: successRole.Arn,
      HTTPFailureFeedbackRoleArn: failureRole.Arn,
      DeliveryPolicy: JSON.stringify({
        http: {
          healthyRetryPolicy: {
            minDelayTarget: 1,
            maxDelayTarget: 60,
            numRetries: 50,
            numNoDelayRetries: 3,
            numMinDelayRetries: 2,
            numMaxDelayRetries: 35,
            backoffFunction: "exponential",
          },
          throttlePolicy: {
            maxReceivesPerSecond: 10,
          },
        },
      }),
    },
  };

  const command = new CreateTopicCommand(input);
  const response = await snsClient.send(command);
  return response.TopicArn;
};

const finalizeSNSTopic = async (serviceId, eventTypeName) => {
  const topicName = `WebhooksPlug-${serviceId}-${eventTypeName}`;
  const successLogGroupName = `/aws/sns/${topicName}`;
  const failureLogGroupName = `/aws/sns/${topicName}/Failure`;
  const snsTopic = await createSNSTopic();

  await createSuccessLogGroup(
    successLogGroupName,
    logDestinationLambdaArn,
    topicName
  );
  await createFailureLogGroup(
    failureLogGroupName,
    logDestinationLambdaArn,
    topicName
  );

  return snsTopic;
};

module.exports = {
  finalizeSNSTopic,
};
