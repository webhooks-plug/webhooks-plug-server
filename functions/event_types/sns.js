const { SNSClient, CreateTopicCommand } = require("@aws-sdk/client-sns");
const {
  CloudWatchLogsClient,
  PutSubscriptionFilterCommand,
  CreateLogGroupCommand,
} = require("@aws-sdk/client-cloudwatch-logs");

const config = {
  region: process.env.REGION,
};

const snsClient = new SNSClient(config);
const logsClient = new CloudWatchLogsClient(config);

const logDestinationLambdaArn = process.env.LOG_DESTINATION_FUNCTION_ARN;

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

const finalizeSNSTopic = async (serviceId, eventTypeName, accountId) => {
  const topicName = `WebhooksPlug-${serviceId}-${eventTypeName}`;
  const successLogGroupName = `/aws/sns/${topicName}`;
  const failureLogGroupName = `/aws/sns/${topicName}/Failure`;
  const snsTopic = await createSNSTopic(topicName, accountId);

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
