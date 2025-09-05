import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { RelacionItem } from '../../interfaces/relacion';

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

export const insertIntoDynamoDB = async(tabla: string, item: RelacionItem) => {
    await docClient.send(
        new PutCommand({
            TableName: tabla,
            Item: item,
        })
    );
}