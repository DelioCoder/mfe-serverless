import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import { Construct } from 'constructs';
import { DynamoDbConstruct } from './constructs/dynamodb-construct';
import { LambdaConstruct } from './constructs/lambda-construct';
import { ApiGatewayCanalConstruct } from './constructs/apigateway-canal-construct';
import { ApiGatewayTecnicaConstruct } from './constructs/apigateway-tecnica-construct';
import { S3Construct } from './constructs/s3-construct';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class MfeServerlessStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const dynamoDB = new DynamoDbConstruct(this, 'DynamoDB Tables');

    const lambdas = new LambdaConstruct(this, 'lambdas', {
      mfesTable: dynamoDB.mfesTable,
      relacionesTable: dynamoDB.relacionesTable,
      solicitudesTable: dynamoDB.solicitudesTable,
      secuenciaIdTable: dynamoDB.secuenciaIdTable,
      auditoriaTable: dynamoDB.auditoriaTable,
    });

    const apiTecnica = new ApiGatewayTecnicaConstruct(this, 'tecnica-api', {
      relacionesLambda: lambdas.relacionesLambda,
      consultasAdminLambda: lambdas.consultasAdminLambda,
      consultasLambda: lambdas.consultasLambda,
      userPoolId: 'us-east-1_Yp30UfnkP'
    })

    const apiCanal = new ApiGatewayCanalConstruct(this, 'canal-api', {
      apiTecnicaUrl: `${apiTecnica.api.url}`,
      userPoolId: 'us-east-1_Yp30UfnkP'
    });

    const s3Construct = new S3Construct(this, 'MfeMetadaBucket');

    s3Construct.metaDataBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED_PUT,
      new s3n.LambdaDestination(lambdas.parseoLambda),
      {
        suffix: "yaml" // -> Aceptar solo .yaml
      }
    )

    s3Construct.metaDataBucket.grantRead(lambdas.parseoLambda);

    new cdk.CfnOutput(this, "ApiCanalUrl", { value: apiCanal.api.url });
    new cdk.CfnOutput(this, "ApiTecnicalUrl", { value: apiTecnica.api.url });
    new cdk.CfnOutput(this, "metadataBucket", { value: s3Construct.metaDataBucket.bucketName })

  }
}
