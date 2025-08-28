import { APIGatewayProxyHandler } from "aws-lambda";
import axios from "axios";

export const handler: APIGatewayProxyHandler = async (event) => {
  try {

    const baseUrl = process.env.API_TECNICA_URL!;

    const queryString = event.queryStringParameters
      ? "?" +
      new URLSearchParams(
        Object.entries(event.queryStringParameters).reduce((acc, [k, v]) => {
          if (v) acc[k] = v;
          return acc;
        }, {} as Record<string, string>)
      ).toString()
      : "";

    const targetUrl = `${baseUrl}${event.path}${queryString}`.replace(/([^:]\/)\/+/g, "$1");

    const headers: Record<string, string> = {};

    const authHeader = event.headers["authorization"] || event.headers["Authorization"] || event.headers["AUTHORIZATION"];

    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const contentTypeHeader = event.headers["content-type"] || event.headers["Content-Type"] || event.headers["CONTENT-TYPE"];

    if (contentTypeHeader) {
      headers["Content-Type"] = contentTypeHeader;
    }

    const response = await axios.request({
      url: targetUrl,
      method: event.httpMethod,
      headers,
      data: event.body ? JSON.parse(event.body) : undefined,
    });

    return {
      statusCode: response.status,
      body: JSON.stringify(response.data),
    };
  } catch (error: any) {
    console.error("Error en Lambda Proxy:", error);
    return {
      statusCode: error.response?.status || 500,
      body: JSON.stringify({
        message: "Error en comunicación con API Técnica",
        error: error.response?.data || error.message,
      }),
    };
  }
};
