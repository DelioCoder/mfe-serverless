import "reflect-metadata";
import { APIGatewayProxyHandler } from 'aws-lambda';
import { getAllMfes, getMfeById, insertMfeRequestToBD } from './resources/dynamodb';
import { bodyValidation, CreateMfeDto, UpdateMfeDto } from './dto';

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

          const result = await getMfeById(mfesTable, event.pathParameters?.id);

          return { statusCode: 200, body: JSON.stringify(result) };
        }

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
              hasMore: nextCursor ? true : false
            }
          })
        };

      // POST /consultas → solicitud de nuevo MFE
      case "POST":

        if (!body) {
          return { statusCode: 400, body: JSON.stringify({ error: 'Empty body' }) }
        }

        const createBody = await bodyValidation(body, CreateMfeDto);

        const createMfeRequestId = await insertMfeRequestToBD(solicitudesTable, createBody, 'create');

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

        const updateMfeRequestId = await insertMfeRequestToBD(solicitudesTable, { mfe_id: mfeId, ...updateBody }, 'update');

        return { statusCode: 201, body: JSON.stringify({ message: "Solicitud de actualización enviada", requestId: updateMfeRequestId }) };

      default:
        return { statusCode: 400, body: JSON.stringify({ message: "Método no soportado" }) };
    }
  } catch (err: any) {
    return { statusCode: 500, body: JSON.stringify(err.message) };
  }
};