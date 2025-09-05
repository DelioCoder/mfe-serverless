import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dynamoDB = DynamoDBDocumentClient.from(client);

export const getRelationByPlatform = async(tableName: string, platformName: string) => {

    const result = await dynamoDB.send(new QueryCommand({
        TableName: tableName,
        KeyConditionExpression: "#pl = :pl_value",
        ExpressionAttributeNames: {
            "#pl": "plataforma"
        },
        ExpressionAttributeValues: {
            ":pl_value": platformName
        }
    }));

    const data = result.Items;

    const mfesArray = data?.map((item) => {
        return {
            mfe_id: item.mfe_id,
            mfe_nombre: item.nombre,
            mfe_repositorio: item.repositorio,
            mfe_tipo: item.tipo
        }
    });

    return {
        plataforma: platformName,
        mfes: mfesArray,
    };
}

export async function getRelacionesByMfeId(tableName: string, mfeId: string) {
  
  const respMfe = await dynamoDB.send(
    new QueryCommand({
      TableName: tableName,
      IndexName: "MfeIndexId",
      KeyConditionExpression: "mfe_id = :mfe_id",
      ExpressionAttributeValues: {
        ":mfe_id": mfeId,
      },
    })
  );

  if (!respMfe.Items || respMfe.Items.length === 0) {
    return { statusCode: 404, body: JSON.stringify({ error: "MFE no encontrado" }) };
  }

  const plataforma = respMfe.Items[0].plataforma;

  const respPlataforma = await dynamoDB.send(
    new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: "#pk = :plataforma",
      ExpressionAttributeNames: {
        "#pk": "plataforma",
      },
      ExpressionAttributeValues: {
        ":plataforma": plataforma,
      },
    })
  );

  return {
    plataforma,
    mfes: respPlataforma.Items?.map((mfe) => ({
      mfe_id: mfe.mfe_id,
      mfe_nombre: mfe.nombre,
      repositorio: mfe.repositorio,
    })),
  };
}