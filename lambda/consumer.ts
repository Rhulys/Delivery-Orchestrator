import { SQSEvent, SQSHandler } from 'aws-lambda'
import { DynamoDB, SNS } from 'aws-sdk'

const dynamo = new DynamoDB.DocumentClient();
const sns = new SNS();
const TABLE_NAME = process.env.TABLE_NAME!;
const TOPIC_ARN = process.env.TOPIC_ARN!;

export const handler: SQSHandler = async (event: SQSEvent) => {
    for (const record of event.Records) {
        try {
            const order = JSON.parse(record.body);
            console.log('Processando pedido:', order.orderId)

            const item = {
                ...order,
                processedAt: new Date().toISOString(),
                status: 'PROCESSED'
            }

            await dynamo.put({
                TableName: TABLE_NAME,
                Item: item
            }).promise();

            await sns.publish({
                TopicArn: TOPIC_ARN,
                Message: `O pedido ${order.orderId} foi processado e está pronto para a cozinha!`,
                Subject: 'Novo Pedido para Cozinha',
                MessageAttributes: {
                    status: { DataType: 'String', StringValue: 'PROCESSED'}
                }
            }).promise();

            console.log('Pedido processado e SNS notificado', order.orderId)
        } catch (error) {
            console.error('Erro ao processas mensagem:', error);
            throw error
        }
    }
}