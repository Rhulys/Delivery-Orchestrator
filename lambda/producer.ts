import { SQSEvent, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { SQS } from 'aws-sdk';

const sqs = new SQS();
const QUEUE_URL = process.env.QUEUE_URL!;

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const body = JSON.parse(event.body || '{}');

        if (!body.orderId || !body.items) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Pedido inválido: orderId e items são obrigatórios'}),
            }
        }

        await sqs.sendMessage({
            QueueUrl: QUEUE_URL,
            MessageBody: JSON.stringify({
                ...body,
                status: 'PENDING',
                createdAt: new Date().toISOString()
            })
        }).promise()

        return {
            statusCode: 201,
            body: JSON.stringify({ message: 'Pedido enviado para a fila com sucesso!', orderId: body.orderId}),
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Erro interno ao processar pedido'})
        }
    }
}