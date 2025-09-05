import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2'

const ses = new SESv2Client({ region: "us-east-1" });

type Estado = "aceptado" | "rechazado" | "observado";

export const sendEmail = async (destinatario: string, cuerpo: string, estado: Estado) => {

    let subject;
    let htmlBody;

    switch (estado) {
        case 'aceptado':
            subject = "✅ Tu solicitud fue aprobada";
            htmlBody = `
                <h1>¡Felicidades!</h1>
                <p>Tu microfrontend ha sido <b>aprobado</b> y está listo para publicarse</p>
                <hr/>
                <p><b>Mensaje del administrador:</b></p>
                <p>${cuerpo}</p>
            `;
            break;

        case 'rechazado':
            subject = "❌ Tu solicitud fue rechazada";
            htmlBody = `
                <h1>Lo sentimos</h1>
                <p>Tu microfrontend fue <b>rechazado</b>. Por favor revisa la información enviada.</p>
                <hr/>
                <p><b>Mensaje del administrador:</b></p>
                <p>${cuerpo}</p>
            `;
            break;

        case 'observado':
            subject = "🔍 Tu solicitud tiene observaciones";
            htmlBody = `
                <h1>Observaciones</h1>
                <p>Tu microfrontend tiene <b>observaciones</b>. Por favor subsanar.</p>
                <hr/>
                <p><b>Mensaje del administrador:</b></p>
                <p>${cuerpo}</p>
            `;
            break;

        default:
            subject = "";
            htmlBody = "";
            break;
    }

    const command = new SendEmailCommand({
        FromEmailAddress: "davideveriwhere@gmail.com",
        Destination: { ToAddresses: [destinatario] },
        Content: {
            Simple: {
                Subject: { Data: subject },
                Body: {
                    Text: { Data: cuerpo },
                    Html: { Data: htmlBody }
                }
            }
        }
    })

    await ses.send(command);

}