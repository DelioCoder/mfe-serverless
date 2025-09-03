import { APIGatewayProxyHandler } from "aws-lambda";
import { sendEmail } from "./resources/sns";
import { bodyValidation, MessageDto } from "./interfaces";
import { getMfeById, getRequestById, insertMfeApproved, updateMfeApproved, updateMfeRequestStatus, updateSecuencialTable } from "./resources/dynamodb";

const mfesTabla = process.env.MFES_TABLE!;
const solicitudTabla = process.env.SOLICITUDES_TABLE!;
const secuenciaIdTabla = process.env.SECUENCIA_ID_TABLE!;

export const handler: APIGatewayProxyHandler = async (event) => {
  try {

    const claims = event.requestContext.authorizer?.claims;
    const isAdmin = claims['cognito:groups'] && claims['cognito:groups'].includes('admin') ? true : false;

    if (!isAdmin) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Unauthorized' }) }
    }

    const { body } = event;

    if (!body) {
      return { statusCode: 400, body: JSON.stringify("No hay información en el cuerpo de solicitud") }
    }

    const input = JSON.parse(body || '');

    await bodyValidation(body, MessageDto);

    const requestId = event.pathParameters?.id;

    if (!requestId) {
      return { statusCode: 400, body: JSON.stringify("Falta id") };
    }

    switch (event.httpMethod) {

      case "PUT":

        const solicitud = await getRequestById(solicitudTabla, requestId);

        if (!solicitud.Item) {
          return {
            statusCode: 404,
            body: `Item with id ${requestId} doesn't exist`
          }
        }

        const informacionMfe = solicitud.Item.metadata;
        const solicitado_por = solicitud.Item.solicitado_por;

        // PUT /admin/mfes/{id}/approve → aprobar solicitud
        if (event.resource.endsWith("approve")) {

          if (informacionMfe.mfe_id) {

            const mfeDb = await getMfeById(mfesTabla, informacionMfe.mfe_id);

            if (mfeDb) {
              await updateMfeApproved(mfesTabla, informacionMfe.mfe_id, { solicitado_por, ...informacionMfe });

              await updateMfeRequestStatus(solicitudTabla, requestId, 'aprobado');

              await sendEmail(solicitado_por, input.mensaje, "aceptado");

              return { statusCode: 200, body: JSON.stringify({ message: `Actualización de MFe ${informacionMfe.mfe_id} aprobada` }) };
            }

          }

          const nombreMfe = informacionMfe.nombre;
          const tipo = informacionMfe.tipo;

          const prefijo = tipo[0].toUpperCase() + nombreMfe.substring(0, 4).toUpperCase();

          const seqResult = await updateSecuencialTable(secuenciaIdTabla);

          const nextNumber = seqResult.Attributes!.lastNumber;
          const mfeId = `${prefijo}${String(nextNumber).padStart(3, "0")}`;

          await insertMfeApproved(mfesTabla, mfeId, {solicitado_por, ...informacionMfe});

          await updateMfeRequestStatus(solicitudTabla, requestId, 'aprobado');

          await sendEmail(solicitado_por, input.mensaje, "aceptado");

          return { statusCode: 200, body: JSON.stringify({ message: `Registro de MFe ${mfeId} aprobada` }) };
        }

        // PUT /admin/mfes/{id}/reject → rechazar solicitud
        if (event.resource.endsWith("reject")) {

          await updateMfeRequestStatus(solicitudTabla, requestId, 'rechazado');

          await sendEmail(solicitado_por, input.mensaje, "rechazado");

          return { statusCode: 200, body: JSON.stringify({ message: "MFE rechazado" }) };
        }

        // PUT /admin/mfes/{id}/under-review → Realizar observaciones a la solicitud
        if (event.resource.endsWith("under-review")) {

          await updateMfeRequestStatus(solicitudTabla, requestId, 'bajo observación');

          await sendEmail(solicitado_por, input.mensaje, "observado");

          return { statusCode: 200, body: JSON.stringify({ message: "MFE observado" }) };
        }

        return { statusCode: 400, body: JSON.stringify({ message: "Ruta no válida" }) };

      default:
        return { statusCode: 405, body: JSON.stringify({ message: "Método no soportado" }) };
    }
  } catch (err: any) {
    return { statusCode: 500, body: JSON.stringify(err.message) };
  }
};