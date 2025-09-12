import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient({});
const dynamoDB = DynamoDBDocumentClient.from(client);

type TypeRequest = "registro" | "actualización";

export const getOneMfe = async (tableName: string, term: string) => {

    let resp;

    const isMfeId = (term: string) => /^[A-Z_]+[0-9]{3,}$/.test(term);

    if (isMfeId(term)) {
        resp = await dynamoDB.send(new GetCommand({
            TableName: tableName,
            Key: { mfe_id: term }
        }));

        return resp.Item || null;
    } else {
        const resp = await dynamoDB.send(new ScanCommand({
            TableName: tableName,
            FilterExpression: "nombre = :n",
            ExpressionAttributeValues: { ":n": term },
        }));

        return resp.Items && resp.Items.length > 0 ? resp.Items[0] : null;

    }
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

export const getAllMfeRequests = async (tableName: string, request_id: string) => {
    const resp = await dynamoDB.send(new QueryCommand({
        TableName: tableName,
        KeyConditionExpression: "mfe_id = :id",
        ExpressionAttributeValues: { ":id": request_id }
    }));

    return resp.Items;
}

export const getMfeRequestsByUser = async (tableName: string, user_requested: string, nextKey: any) => {

    const result = await dynamoDB.send(new QueryCommand({
        TableName: tableName,
        IndexName: "SolicitadoPorIndex",
        KeyConditionExpression: "#sl_p = :sl_p",
        ExpressionAttributeNames: {
            "#sl_p": "solicitado_por"
        },
        ExpressionAttributeValues: {
            ":sl_p": user_requested
        },
        Limit: 5,
        ExclusiveStartKey: nextKey
    }));

    return result;

}

export const getMfeRequestById = async (tableName: string, request_id: string) => {
    const resp = await dynamoDB.send(new GetCommand({
        TableName: tableName,
        Key: { request_id: request_id }
    }));

    return resp.Item;
}

export const insertMfeRequestToBD = async (tableName: string, bodyDb: any, type: TypeRequest) => {

    const { solicitado_por, ...body } = bodyDb;

    const requestId = uuidv4();

    await dynamoDB.send(new PutCommand({
        TableName: tableName,
        Item: {
            request_id: requestId,
            type: type,
            status: "pendiente",
            createdAt: Date.now(),
            detalle: JSON.parse(JSON.stringify(body)),
            solicitado_por: solicitado_por
        }
    }));

    return requestId;
}