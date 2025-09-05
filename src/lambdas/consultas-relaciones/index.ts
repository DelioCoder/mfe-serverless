import { APIGatewayProxyHandler } from "aws-lambda";
import { getRelacionesByMfeId } from "./resources/dynamodb";

const RELACIONES_TABLA = process.env.RELACIONES_TABLA!;

export const handler: APIGatewayProxyHandler = async (event) => {
    try {

        if(!event.pathParameters?.id){
            return { statusCode: 400, body: JSON.stringify('No se proporciono nombre de plataforma') }
        }

        const platformName = decodeURIComponent(event.pathParameters.id);

        const result = await getRelacionesByMfeId(RELACIONES_TABLA, platformName);

        return {
            statusCode: 200,
            body: JSON.stringify(result)
        }
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify(error) }
    }
}