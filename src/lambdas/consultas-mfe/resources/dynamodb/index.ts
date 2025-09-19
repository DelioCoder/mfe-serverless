import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { MfeEntity, MfeRelationEntity } from '../../interfaces';
import { MfeMapper } from '../../mappers/mfe-mapper';

const client = new DynamoDBClient({});
const dynamoDB = DynamoDBDocumentClient.from(client);

const relationTable = process.env.RELACIONES_TABLE!;

type TypeRequest = "registro" | "actualización";

export const getMfeDetailInRelations = async (mfe_id: string) => {

    const resp = await dynamoDB.send(new QueryCommand({
        TableName: relationTable,
        IndexName: "MfeIndexId",
        KeyConditionExpression: "#id = :id",
        ExpressionAttributeNames: { "#id": "mfe_id" },
        ExpressionAttributeValues: { ":id": mfe_id }
    }));

    return resp.Items![0] as MfeRelationEntity;

}

export const getOneMfe = async (tableName: string, term: string) => {

    let result: any;
    let mfe: MfeEntity;
    let relationMfe: MfeRelationEntity;

    const isMfeId = (term: string) => /^[A-Z_]+[0-9]{3,}$/.test(term);

    if (isMfeId(term)) {
        result = await dynamoDB.send(new GetCommand({
            TableName: tableName,
            Key: { mfe_id: term }
        }));

        mfe = result.Item as MfeEntity;

        if (!mfe) {
            return `No existe microfrontend con id [${term}]`
        }

        relationMfe = await getMfeDetailInRelations(mfe.mfe_id);

        return MfeMapper.fromEntityToResponse(mfe, relationMfe ? relationMfe : {} as MfeRelationEntity);

    } else {
        result = await dynamoDB.send(new ScanCommand({
            TableName: tableName,
            FilterExpression: "nombre = :n",
            ExpressionAttributeValues: { ":n": term },
        }));

        if (result.Items && result.Items.length > 0) {
            mfe = result.Items[0];

            if (!mfe) {
                return `No existe microfrontend con nombre: ${term}`
            }

            relationMfe = await getMfeDetailInRelations(mfe.mfe_id);

            return MfeMapper.fromEntityToResponse(mfe, relationMfe);
        } else {
            return null;
        }

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

    const mfeArray = data.Items as MfeEntity[];
    const nextKey = data.LastEvaluatedKey;

    return {
        mfeArray: mfeArray.map((item) => {
            return MfeMapper.fromEntityToMfEResponse(item);
        }),
        nextKey
    };

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