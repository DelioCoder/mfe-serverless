import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DynamoDbConstruct } from './constructs/dynamodb-construct';
import { LambdaConstruct } from './constructs/lambda-construct';
import { ApiGatewayCanalConstruct } from './constructs/apigateway-canal-construct';
import { ApiGatewayTecnicaConstruct } from './constructs/apigateway-tecnica-construct';
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
      secuenciaIdTable: dynamoDB.secuenciaIdTable
    });

    const apiTecnica = new ApiGatewayTecnicaConstruct(this, 'tecnica-api', {
      catalogoParserLambda: lambdas.catalogoParserLambda,
      consultasAdminLambda: lambdas.consultasAdminLambda,
      consultasLambda: lambdas.consultasLambda,
      userPoolId: 'us-east-1_Yp30UfnkP'
    })

    const apiCanal = new ApiGatewayCanalConstruct(this, 'canal-api', {
      apiTecnicaUrl: `${apiTecnica.api.url}`,
      userPoolId: 'us-east-1_Yp30UfnkP'
    });

    new cdk.CfnOutput(this, "ApiCanalUrl", { value: apiCanal.api.url });
    new cdk.CfnOutput(this, "ApiTecnicalUrl", { value: apiTecnica.api.url });

  }
}
