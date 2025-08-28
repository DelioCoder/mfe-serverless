// import { APIGatewayProxyHandler } from "aws-lambda";
// import * as yaml from "js-yaml";
// import axios from "axios";

// export const handler: APIGatewayProxyHandler = async (event) => {
//   try {
//     console.log("Evento recibido en parser:", event);

//     switch (event.httpMethod) {
//       // POST /parser → sincroniza desde GitHub
//       case "POST": {
//         const { repoURL } = JSON.parse(event.body!);
//         if (!repoURL) {
//           return { statusCode: 400, body: JSON.stringify({ message: "Falta repoURL" }) };
//         }

//         const response = await axios.get(`${repoURL}/raw/main/federation.config.js`);
//         const config = yaml.load(response.data);

//         return { statusCode: 200, body: JSON.stringify({ message: "Config sincronizada", config }) };
//       }

//       default:
//         return { statusCode: 405, body: JSON.stringify({ message: "Método no soportado" }) };
//     }
//   } catch (err: any) {
//     console.error(err);
//     return { statusCode: 500, body: JSON.stringify({ message: "Error interno", error: err.message }) };
//   }
// };
