import { v4 as uuid } from 'uuid';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const dynamoDB = DynamoDBDocumentClient.from(client);

export const insertIntoAuditTable = async(tableName: string, body: any) => {

    const generatedUUID = uuid();

    const item = { log_id: generatedUUID, ...body, fecha: Date.now() }

    await dynamoDB.send(new PutCommand({
        TableName: tableName,
        Item: item
    }));

}