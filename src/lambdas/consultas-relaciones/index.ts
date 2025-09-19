import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { getMfesGroupedByPlataforma, getRelacionesByMfeId } from "./resources/dynamodb";

const RELACIONES_TABLA = process.env.RELACIONES_TABLA!;

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {

        if (event.resource === "/mfes/{id}") {
            if (!event.pathParameters?.id) {
                return { statusCode: 400, body: JSON.stringify('No se proporciono el id del microfrontend') }
            }

            const platformName = decodeURIComponent(event.pathParameters.id);

            const result = await getRelacionesByMfeId(RELACIONES_TABLA, platformName);

            return {
                statusCode: 200,
                body: JSON.stringify(result)
            }
        }

        const result = await getMfesGroupedByPlataforma(RELACIONES_TABLA);

        return {
            statusCode: 200,
            body: JSON.stringify(result)
        }

    } catch (error) {
        return { statusCode: 500, body: JSON.stringify(error) }
    }
}