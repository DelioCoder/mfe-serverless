import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { UpdateMfeDto } from "../../interfaces";

const client = new DynamoDBClient({});
const dynamoDB = DynamoDBDocumentClient.from(client);

type RequestStatus = "aprobado" | "rechazado" | "bajo observación";

export const getMfeById = async (tableName: string, mfeId: string) => {
    const mfeDB = await dynamoDB.send(new GetCommand({
        TableName: tableName,
        Key: {
            mfe_id: mfeId
        }
    }));

    return mfeDB;
}

export const getRequestById = async (tableName: string, requestId: string) => {
    const solicitud = await dynamoDB.send(new GetCommand({
        TableName: tableName,
        Key: {
            request_id: requestId
        }
    }));

    return solicitud;
}

export const updateSecuencialTable = async (tableName: string) => {

    const seqResult = await dynamoDB.send(new UpdateCommand({
        TableName: tableName,
        Key: { pk: "global_counter" },
        UpdateExpression: "SET lastNumber = if_not_exists(lastNumber, :start) + :inc",
        ExpressionAttributeValues: {
            ":start": 0,
            ":inc": 1
        },
        ReturnValues: "UPDATED_NEW"
    }));

    return seqResult;

}

export const insertMfeApproved = async (mfeTable: string, mfeId: string, mfeBody: any) => {

    const now = Date.now();

    await dynamoDB.send(new PutCommand({
        TableName: mfeTable,
        Item: {
            mfe_id: mfeId,
            ...mfeBody,
            pk: "MFEs",
            createdAt: now,
            updatedAt: now,
            status: 'aprobado'
        }
    }));

}

export const updateMfeApproved = async (mfeTable: string, mfeId: string, updateBody: UpdateMfeDto) => {

    const now = Date.now();

    const updateExpr: string[] = [];
    const exprAttrNames: Record<string, string> = {};
    const exprAttrValues: Record<string, any> = {};

    Object.entries(updateBody).forEach(([key, value]) => {
        if (value !== undefined && key !== "mfe_id" && key !== "pk" && value !== undefined) {
            const attrName = `#${key}`;
            const attrValue = `:${key}`;
            updateExpr.push(`${attrName} = ${attrValue}`);
            exprAttrNames[attrName] = key;
            exprAttrValues[attrValue] = value;
        }
    });

    updateExpr.push("#updatedAt = :updatedAt");
    exprAttrNames["#updatedAt"] = "updatedAt";
    exprAttrValues[":updatedAt"] = now;

    updateExpr.push("#createdAt = if_not_exists(#createdAt, :createdAt)");
    exprAttrNames["#createdAt"] = "createdAt";
    exprAttrValues[":createdAt"] = now;

    const command = new UpdateCommand({
        TableName: mfeTable,
        Key: { mfe_id: mfeId },
        UpdateExpression: "SET " + updateExpr.join(", "),
        ExpressionAttributeNames: exprAttrNames,
        ExpressionAttributeValues: exprAttrValues,
        ReturnValues: "ALL_NEW",
    });

    await dynamoDB.send(command);

}

export const updateMfeRequestStatus = async (solicitudTable: string, requestId: string, status: RequestStatus) => {

    await dynamoDB.send(new UpdateCommand({
        TableName: solicitudTable,
        Key: { request_id: requestId },
        UpdateExpression: "SET #st = :status_value",
        ExpressionAttributeNames: { "#st": "status" },
        ExpressionAttributeValues: { ":status_value": status }
    }));

}