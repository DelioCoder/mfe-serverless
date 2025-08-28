import { APIGatewayProxyHandler } from "aws-lambda";
import { v4 as uuid } from 'uuid';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { sendEmail } from "./resources/sns";
import { plainToInstance } from 'class-transformer';
import { UpdateMfeDto } from "./interfaces/update-mfe.dto";

const client = new DynamoDBClient({});
const dynamoDB = DynamoDBDocumentClient.from(client);

const mfesTabla = process.env.MFES_TABLE!;
const solicitudTabla = process.env.SOLICITUDES_TABLE!;

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    
    const claims = event.requestContext.authorizer?.claims;
    const isAdmin = claims['cognito:groups'] && claims['cognito:groups'].includes('admin') ? true : false;

    if (!isAdmin) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Unauthorized' }) }
    }

    const { body } = event;
    const input = JSON.parse(body || '');
    const bodyFormatted = plainToInstance(UpdateMfeDto, input);

    const id = event.pathParameters?.id;

    switch (event.httpMethod) {

      // PUT /admin/mfes/{id}/approve → aprobar solicitud
      case "PUT":
        if (!id) {
          return { statusCode: 400, body: JSON.stringify({ message: "Falta id" }) };
        }

        const solicitud = await dynamoDB.send(new GetCommand({
          TableName: solicitudTabla,
          Key: {
            request_id: id
          }
        }));

        if (!solicitud.Item) {
          return {
            statusCode: 404,
            body: `Item with id ${id} doesn't exist`
          }
        }

        const informacionMfe = solicitud.Item.metadata;

        const solicitado_por = solicitud.Item.solicitado_por;

        if (event.resource.endsWith("approve")) {

          await dynamoDB.send(new PutCommand({
            TableName: mfesTabla,
            Item: {
              mfe_id: uuid(),
              ...informacionMfe,
              createdAt: new Date().toISOString(),
              status: 'approved'
            }
          }))

          await dynamoDB.send(new UpdateCommand({
            TableName: solicitudTabla,
            Key: { request_id: id },
            UpdateExpression: "SET #st = :approved",
            ExpressionAttributeNames: { "#st": "status" },
            ExpressionAttributeValues: { ":approved": "aprovado" }
          }));

          await sendEmail(solicitado_por, bodyFormatted.mensaje, "aceptado");

          return { statusCode: 200, body: JSON.stringify({ message: "MFE aprobado" }) };
        }

        if (event.resource.endsWith("reject")) {

          await dynamoDB.send(new UpdateCommand({
            TableName: solicitudTabla,
            Key: { request_id: id },
            UpdateExpression: "SET #st = :value",
            ExpressionAttributeNames: { "#st": "status" },
            ExpressionAttributeValues: { ":value": "rechazado" }
          }))

          await sendEmail(solicitado_por, bodyFormatted.mensaje, "rechazado");

          return { statusCode: 200, body: JSON.stringify({ message: "MFE rechazado" }) };
        }

        if (event.resource.endsWith("under-review")) {

          await dynamoDB.send(new UpdateCommand({
            TableName: solicitudTabla,
            Key: { request_id: id },
            UpdateExpression: "SET #st = :value",
            ExpressionAttributeNames: { "#st": "status" },
            ExpressionAttributeValues: { ":value": "Bajo supervisión" }
          }))

          await sendEmail(solicitado_por, bodyFormatted.mensaje, "observado");

          return { statusCode: 200, body: JSON.stringify({ message: "MFE observado" }) };
        }

        return { statusCode: 400, body: JSON.stringify({ message: "Ruta no válida" }) };

      default:
        return { statusCode: 405, body: JSON.stringify({ message: "Método no soportado" }) };
    }
  } catch (err: any) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ message: "Error interno", error: err.message }) };
  }
};