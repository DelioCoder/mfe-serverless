import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cdk from "aws-cdk-lib";

export class DynamoDbConstruct extends Construct {
  public readonly mfesTable: dynamodb.Table;
  public readonly solicitudesTable: dynamodb.Table;
  public readonly relacionesTable: dynamodb.Table;
  public readonly auditoriaTable: dynamodb.Table;
  public readonly secuenciaIdTable: dynamodb.Table;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.mfesTable = new dynamodb.Table(this, 'MFEsTable', {
      tableName: 'MFEsTabla',
      partitionKey: { name: 'mfe_id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    this.mfesTable.addGlobalSecondaryIndex({
      indexName: 'CreatedAtIndex',
      partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'createdAt', type: dynamodb.AttributeType.NUMBER },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    this.solicitudesTable = new dynamodb.Table(this, 'SolicitudesTable', {
      tableName: 'SolicitudTabla',
      partitionKey: { name: 'request_id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    this.solicitudesTable.addGlobalSecondaryIndex({
      indexName: 'SolicitadoPorIndex',
      partitionKey: { name: 'solicitado_por', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    this.relacionesTable = new dynamodb.Table(this, "RelacionesTable", {
      tableName: "Relacion-Tabla",
      partitionKey: { name: "app_cmdb", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "mfe_id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // dev
    });

    this.relacionesTable.addGlobalSecondaryIndex({
      indexName: 'MfeIndexId',
      partitionKey: { name: 'mfe_id', type: dynamodb.AttributeType.STRING }
    });

    this.secuenciaIdTable = new dynamodb.Table(this, 'SecuenciaId-Table', {
      tableName: 'SecuenciaId-Tabla',
      partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    this.auditoriaTable = new dynamodb.Table(this, 'LogsAuditoriaTable', {
      tableName: 'Auditorias-Tabla',
      partitionKey: { name: 'log_id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });
  }
}
