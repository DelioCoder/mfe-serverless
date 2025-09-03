import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient({});
const dynamoDB = DynamoDBDocumentClient.from(client);

type TypeRequest = "create" | "update";

export const getMfeById = async (tableName: string, mfeId: string) => {
    const resp = await dynamoDB.send(new GetCommand({
        TableName: tableName,
        Key: { mfe_id: mfeId }
    }));

    return resp.Item;
}

export const getAllMfes = async (tableName: string, limit: number, cursor?: string) => {

    const params = {
        TableName: tableName,
        IndexName: 'CreatedAtIndex',
        KeyConditionExpression: "pk = :pk",
        ExpressionAttributeValues: {
            ":pk": "MFEs"
        },
        ScanIndexForward: true,
        Limit: limit,
        ExclusiveStartKey: cursor ? JSON.parse(decodeURIComponent(cursor)) : undefined
    };

    const data = await dynamoDB.send(new QueryCommand(params));

    return data;

}

export const insertMfeRequestToBD = async(tableName: string, bodyDb: any, type: TypeRequest) => {
    
    const { solicitado_por, ...body } = bodyDb;

    const requestId = uuidv4();

    await dynamoDB.send(new PutCommand({
        TableName: tableName,
        Item: {
            request_id: requestId,
            type: type,
            status: "pending",
            createdAt: Date.now(),
            metadata: JSON.parse(JSON.stringify(body)),
            solicitado_por: solicitado_por
        }
    }));

    return requestId;
}