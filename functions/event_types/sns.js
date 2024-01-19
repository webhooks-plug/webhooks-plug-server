const { SNSClient, CreateTopicCommand } = require("@aws-sdk/client-sns");
const {
  CloudWatchLogsClient,
  PutSubscriptionFilterCommand,
  CreateLogGroupCommand,
} = require("@aws-sdk/client-cloudwatch-logs");
const {
  LambdaClient,
  AddPermissionCommand,
} = require("@aws-sdk/client-lambda");

const config = {
  region: process.env.REGION,
};

const snsClient = new SNSClient(config);
const logsClient = new CloudWatchLogsClient(config);
const lambdaClient = new LambdaClient(config);

const logDestinationLambdaArn = process.env.LOG_DESTINATION_FUNCTION_ARN;
const logDestinationLambdaName = process.env.LOG_DESTINATION_FUNCTION_NAME;

const createSuccessLogGroup = async (
  logGroupName,
  destinationArn,
  topicName,
  accountId
) => {
  const input = {
    logGroupName,
  };

  const command = new CreateLogGroupCommand(input);
  await logsClient.send(command);

  const addPermissionInput = {
    Action: "lambda:InvokeFunction",
    FunctionName: logDestinationLambdaName,
    Principal: "logs.amazonaws.com",
    SourceArn: `arn:aws:logs:${config.region}:${accountId}:log-group:${logGroupName}:*`,
    StatementId: `${topicName}LogLambdaTriggerSuccess`,
  };

  const addPermissionCommand = new AddPermissionCommand(addPermissionInput);
  await lambdaClient.send(addPermissionCommand);

  const inputSubFilter = {
    logGroupName,
    filterName: `${topicName}SuccessLogGroupTrigger`,
    filterPattern: "",
    destinationArn,
  };
  const commandSubFilter = new PutSubscriptionFilterCommand(inputSubFilter);
  await logsClient.send(commandSubFilter);
};

const createFailureLogGroup = async (
  logGroupName,
  destinationArn,
  topicName,
  accountId
) => {
  const input = {
    logGroupName,
  };

  const command = new CreateLogGroupCommand(input);
  await logsClient.send(command);

  const addPermissionInput = {
    Action: "lambda:InvokeFunction",
    FunctionName: logDestinationLambdaName,
    Principal: "logs.amazonaws.com",
    SourceArn: `arn:aws:logs:${config.region}:${accountId}:log-group:${logGroupName}:*`,
    StatementId: `${topicName}LogLambdaTriggerFailure`,
  };

  const addPermissionCommand = new AddPermissionCommand(addPermissionInput);
  await lambdaClient.send(addPermissionCommand);

  const inputSubFilter = {
    logGroupName,
    filterName: `${topicName}FailureLogGroupTrigger`,
    filterPattern: "",
    destinationArn,
  };
  const commandSubFilter = new PutSubscriptionFilterCommand(inputSubFilter);
  await logsClient.send(commandSubFilter);
};

const createSNSTopic = async (topicName, accountId) => {
  const successRoleArn = `arn:aws:iam::${accountId}:role/SNSSuccessRole`;
  const failureRoleArn = `arn:aws:iam::${accountId}:role/SNSFailureRole`;

  const input = {
    Name: topicName,
    Attributes: {
      HTTPSuccessFeedbackRoleArn: successRoleArn,
      HTTPFailureFeedbackRoleArn: failureRoleArn,
      DeliveryPolicy: JSON.stringify({
        http: {
          defaultHealthyRetryPolicy: {
            minDelayTarget: 1,
            maxDelayTarget: 60,
            numRetries: 50,
            numNoDelayRetries: 3,
            numMinDelayRetries: 2,
            numMaxDelayRetries: 35,
            backoffFunction: "exponential",
          },
          disableSubscriptionOverrides: true,
        },
      }),
    },
  };

  const command = new CreateTopicCommand(input);
  const response = await snsClient.send(command);
  return response.TopicArn;
};

const finalizeSNSTopic = async (serviceId, eventTypeName, accountId) => {
  const topicName = `WebhooksPlug-${serviceId}-${eventTypeName}`;
  const successLogGroupName = `/aws/sns/${topicName}`;
  const failureLogGroupName = `/aws/sns/${topicName}/Failure`;
  const snsTopic = await createSNSTopic(topicName, accountId);

  await createSuccessLogGroup(
    successLogGroupName,
    logDestinationLambdaArn,
    topicName,
    accountId
  );
  await createFailureLogGroup(
    failureLogGroupName,
    logDestinationLambdaArn,
    topicName,
    accountId
  );

  return snsTopic;
};

module.exports = {
  finalizeSNSTopic,
};
