import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import * as path from 'path'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import * as sns from 'aws-cdk-lib/aws-sns'
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions'

export class DeliveryOrchestratorStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const ordesDlq = new sqs.Queue(this, 'OrdersDlq', {
      queueName: 'OrdersDLQ',
      retentionPeriod: cdk.Duration.days(14),
    })

    const ordersQueue = new sqs.Queue(this, 'OrdersQueue', {
      queueName: 'OrdersQueue',
      visibilityTimeout: cdk.Duration.seconds(30),
      deadLetterQueue: {
        maxReceiveCount: 5,
        queue: ordesDlq
      }
    })

    const producerLambda = new NodejsFunction(this, 'ProducerHandler', {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: path.join(__dirname, '../lambda/producer.ts'),
      handler: 'handler',
      environment: {
        QUEUE_URL: ordersQueue.queueUrl,
      }
    })

    ordersQueue.grantSendMessages(producerLambda)

    const api = new apigateway.RestApi(this, 'DeliveryApi', {
      restApiName: 'Delivery Service',
    })

    const ordersResource = api.root.addResource('orders');
    ordersResource.addMethod('POST', new apigateway.LambdaIntegration(producerLambda))

    new cdk.CfnOutput(this, 'OrdersQueueUrl', {
      value: ordersQueue.queueUrl,
    })

    const ordersTable = new dynamodb.Table(this, 'OrdersTable', {
      partitionKey: { name: 'orderId', type: dynamodb.AttributeType.STRING},
      tableName: 'Orders',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST
    })

    const consumerLambda = new NodejsFunction(this, 'ConsumerHandler', {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: path.join(__dirname, '../lambda/consumer.ts'),
      handler: 'handler',
      environment: {
        TABLE_NAME: ordersTable.tableName
      }
    })

    ordersTable.grantWriteData(consumerLambda);
    ordersQueue.grantConsumeMessages(consumerLambda);

    consumerLambda.addEventSource(new SqsEventSource(ordersQueue, {
      batchSize: 5
    }))

    const orderProcessedTopic = new sns.Topic(this, 'OrderProcessedTopic', {
      topicName: 'OrderProcessedTopic'
    })

    orderProcessedTopic.addSubscription(new subscriptions.EmailSubscription('rhulyanderson2@gmail.com'));
    consumerLambda.addEnvironment('TOPIC_ARN', orderProcessedTopic.topicArn);
    orderProcessedTopic.grantPublish(consumerLambda)

    const getStatusLambda = new NodejsFunction(this, 'GetStatusHandler', {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: path.join(__dirname, '../lambda/get-status.ts'),
      handler: 'handler',
      environment: {
        TABLE_NAME: ordersTable.tableName
      }
    })

    ordersTable.grantReadData(getStatusLambda);

    const singleOrder = ordersResource.addResource('{id}');
    singleOrder.addMethod('GET', new apigateway.LambdaIntegration(getStatusLambda))
  }
}
