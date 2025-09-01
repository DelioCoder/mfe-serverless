import { APIGatewayProxyHandler } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { CreateMfeDto } from './dto/create-mfe.dto';

const client = new DynamoDBClient({});
const dynamoDB = DynamoDBDocumentClient.from(client);

const mfesTable = process.env.MFES_TABLE!;
const solicitudesTable = process.env.SOLICITUDES_TABLE!;

export const handler: APIGatewayProxyHandler = async (event) => {

  const { body } = event;

  const queryParams = event.queryStringParameters;

  const limit = parseInt(queryParams?.limit!) || 5;
  const cursor = queryParams?.next || void 0;

  try {

    switch (event.httpMethod) {
      // GET /consultas → lista MFEs
      case "GET":
        if (event.pathParameters?.id) {
          const resp = await dynamoDB.send(new GetCommand({
            TableName: mfesTable,
            Key: { mfe_id: event.pathParameters.id }
          }));
          return { statusCode: 200, body: JSON.stringify(resp.Item) };
        }

        const params = {
          TableName: mfesTable,
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

        const nextCursor = data.LastEvaluatedKey
          ? encodeURIComponent(JSON.stringify(data.LastEvaluatedKey))
          : null;

        return {
          statusCode: 200,
          body: JSON.stringify({
            data: data.Items,
            next: data.Items!.length < limit ? null : nextCursor,
            meta: {
              hasMore: nextCursor ? true : false
            }
          })
        };

      // POST /consultas → solicitud de nuevo MFE
      case "POST":

        if (!body) {
          return { statusCode: 400, body: JSON.stringify({ error: 'Empty body' }) }
        }

        const input = JSON.parse(body);
        const dtoBody = plainToInstance(CreateMfeDto, input);
        const errors = await validate(dtoBody, { whitelist: true, forbidNonWhitelisted: true });

        if (errors.length > 0) {
          return {
            statusCode: 400,
            body: JSON.stringify({ errors: 'Validation failed', details: errors })
          }
        }

        const { solicitado_por, ...bodyDb } = dtoBody;

        const requestId = uuidv4();

        await dynamoDB.send(new PutCommand({
          TableName: solicitudesTable,
          Item: {
            request_id: requestId,
            type: "create",
            status: "pending",
            createdAt: new Date().toISOString(),
            metadata: JSON.parse(JSON.stringify(bodyDb)),
            solicitado_por
          }
        }));

        return { statusCode: 201, body: JSON.stringify({ message: "Solicitud creada", requestId }) };

      // PUT /consultas/{id} → solicitud de actualización
      case "PUT":
        if (!event.pathParameters?.id) {
          return { statusCode: 400, body: JSON.stringify({ message: "Falta id" }) };
        }
        const bodyUpdate = event.body ? JSON.parse(event.body) : {};
        const updateId = uuidv4();

        await dynamoDB.send(new PutCommand({
          TableName: solicitudesTable,
          Item: {
            request_id: updateId,
            mfe_id: event.pathParameters.id,
            type: "update",
            status: "pending",
            createdAt: new Date().toISOString(),
            metadata: bodyUpdate
          }
        }));

        return { statusCode: 201, body: JSON.stringify({ message: "Solicitud de actualización enviada", requestId: updateId }) };

      default:
        return { statusCode: 400, body: JSON.stringify({ message: "Método no soportado" }) };
    }
  } catch (err: any) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ message: "Error interno", error: err.message }) };
  }
};
