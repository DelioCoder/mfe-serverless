import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export class DynamoDbConstruct extends Construct {
  public readonly mfesTable: dynamodb.Table;
  public readonly solicitudesTable: dynamodb.Table;
  public readonly relacionesTable: dynamodb.Table;
  public readonly auditoriaTable: dynamodb.Table;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.mfesTable = new dynamodb.Table(this, 'MFEsTable', {
      tableName: 'MFEsTabla',
      partitionKey: { name: 'mfe_id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    this.solicitudesTable = new dynamodb.Table(this, 'SolicitudesTable', {
      tableName: 'SolicitudTabla',
      partitionKey: { name: 'request_id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    this.relacionesTable = new dynamodb.Table(this, 'RelacionesTable', {
      tableName: 'RelacionesTabla',
      partitionKey: { name: 'relation_id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    // this.auditoriaTable = new dynamodb.Table(this, 'LogsAuditoriaTable', {
    //   partitionKey: { name: 'log_id', type: dynamodb.AttributeType.STRING },
    //   billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    // });
  }
}
