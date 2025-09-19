import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { RelationMfeEntity } from "../../interfaces/Relations-entity";

const client = new DynamoDBClient({});
const dynamoDB = DynamoDBDocumentClient.from(client);

export async function getMfesGroupedByPlataforma(tableName: string) {
  const result = await dynamoDB.send(new ScanCommand({ TableName: tableName }));

  const items = result.Items as RelationMfeEntity[] || [];

  const grouped: Record<string, any[]> = {};
  for (const item of items) {
    if (!grouped[item.app_cmdb]) {
      grouped[item.app_cmdb] = [];
    }
    grouped[item.app_cmdb].push({
      relacionId: item.relacion_id,
      mfeId: item.mfe_id,
      nombre: item.nombre,
      tipo: item.tipo,
      version: item.version,
      repositorio: item.repositorio,
      path: item.path,
      estado: item.estado,
      funcionalidades: item.funcionalidades,
      authProviders: item.authProviders,
      timestamp: item.timestamp
    });
  }

  return Object.entries(grouped).map(([appCmdb, mfes]) => ({
    appCmdb,
    mfes
  }));
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