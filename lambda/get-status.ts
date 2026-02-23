import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDB } from "aws-sdk";

const dynamo = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME!;

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try{
        const orderId = event.pathParameters?.id;

        if (!orderId) {
            return { statusCode: 400, body: JSON.stringify({ message: 'Missing orderId'}) }
        }

        const result = await dynamo.get({
            TableName: TABLE_NAME,
            Key: { orderId }
        }).promise();

        if (!result.Item) {
            return { statusCode: 404, body: JSON.stringify({ message: 'Pedido não encontrado'}) }
        }

        return {
            statusCode: 200,
            body: JSON.stringify(result.Item)
        }
    } catch (err) {
        console.error(err);
        return { statusCode: 500, body: JSON.stringify({ message: 'Erro ao buscar pedido'}) }
    }
}