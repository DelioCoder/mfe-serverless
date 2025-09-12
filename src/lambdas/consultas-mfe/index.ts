import "reflect-metadata";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getAllMfes, getMfeRequestById, getMfeRequestsByUser, getOneMfe, insertMfeRequestToBD } from './resources/dynamodb';
import { bodyValidation, CreateMfeDto, UpdateMfeDto } from './dto';

const mfesTable = process.env.MFES_TABLE!;
const solicitudesTable = process.env.SOLICITUDES_TABLE!;

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  const { body } = event;

  const queryParams = event.queryStringParameters;

  const limit = parseInt(queryParams?.limit!) || 5;
  const cursor = queryParams?.next || void 0;

  try {

    switch (event.httpMethod) {
      // GET /consultas → lista MFEs
      case "GET":

        if (event.resource === "/mfes/{term}") {
          const term = event.pathParameters!.term;
          const result = await getOneMfe(mfesTable, term!);
          return { statusCode: 200, body: JSON.stringify(result) };
        }

        if (event.resource === "/mfes/requests/by/{user}") {
          const nextKey = event.queryStringParameters?.nextKey
            ? JSON.parse(event.queryStringParameters.nextKey)
            : undefined;
          const userRequested = event.pathParameters!.user;
          const resp = await getMfeRequestsByUser(solicitudesTable, userRequested!, nextKey);
          return {
            statusCode: 200,
            body: JSON.stringify({
              items: resp.Items,
              nextKey: resp.LastEvaluatedKey ? JSON.stringify(resp.LastEvaluatedKey) : null
            })
          };
        }

        if (event.resource === "/mfes/requests/{id}") {
          const requestId = event.pathParameters!.id;
          const request = await getMfeRequestById(solicitudesTable, requestId!);
          return { statusCode: 200, body: JSON.stringify(request) };
        }

        if (event.resource === "/mfes") {
          const result = await getAllMfes(mfesTable, limit, cursor);
          const nextCursor = result.LastEvaluatedKey
            ? encodeURIComponent(JSON.stringify(result.LastEvaluatedKey))
            : null;

          return {
            statusCode: 200,
            body: JSON.stringify({
              data: result.Items,
              next: result.Items!.length < limit ? null : nextCursor,
              meta: {
                hasMore: !!nextCursor
              }
            })
          };
        }

        return { statusCode: 404, body: JSON.stringify({ message: "Ruta GET no encontrada" }) };

      // POST /consultas → solicitud de nuevo MFE
      case "POST":

        if (!body) {
          return { statusCode: 400, body: JSON.stringify({ error: 'Cuerpo vacio' }) }
        }

        const createBody = await bodyValidation(body, CreateMfeDto);

        const createMfeRequestId = await insertMfeRequestToBD(solicitudesTable, createBody, 'registro');

        return { statusCode: 201, body: JSON.stringify({ message: "Solicitud creada", createMfeRequestId }) };

      // PUT /consultas/{id} → solicitud de actualización
      case "PUT":
        if (!event.pathParameters?.id) {
          return { statusCode: 400, body: JSON.stringify({ message: "Falta id" }) };
        }
        if (!body) {
          return { statusCode: 400, body: JSON.stringify({ error: 'No hay información proporcionada' }) }
        }
        const mfeId = event.pathParameters?.id;

        const updateBody = await bodyValidation(body, UpdateMfeDto);

        const updateMfeRequestId = await insertMfeRequestToBD(solicitudesTable, { mfe_id: mfeId, ...updateBody }, 'actualización');

        return { statusCode: 201, body: JSON.stringify({ message: "Solicitud de actualización enviada", requestId: updateMfeRequestId }) };

      default:
        return { statusCode: 400, body: JSON.stringify({ message: "Método no soportado" }) };
    }
  } catch (err: any) {
    return { statusCode: 500, body: JSON.stringify(err.message) };
  }
};