import { Construct } from 'constructs';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cognito from "aws-cdk-lib/aws-cognito";

export interface ApiGatewayTecnicaConstructProps {
  consultasLambda: lambda.IFunction;
  consultasAdminLambda: lambda.IFunction;
  catalogoParserLambda: lambda.IFunction;
  userPoolId: string;
}

export class ApiGatewayTecnicaConstruct extends Construct {
  public readonly api: apigw.RestApi;

  constructor(scope: Construct, id: string, props: ApiGatewayTecnicaConstructProps) {
    super(scope, id);

    this.api = new apigw.RestApi(this, 'ApiTecnica', {
      restApiName: 'API Técnica',
    });

    const userPool = cognito.UserPool.fromUserPoolId(this, "ImportedUserPool", props.userPoolId);

    const authorizer = new apigw.CognitoUserPoolsAuthorizer(this, "ApiTecnicaAuthorizer", {
      cognitoUserPools: [userPool],
    });

    authorizer._attachToApi(this.api)

    // /mfes/requests
    const requests = this.api.root.addResource("mfes").addResource("requests");
    requests.addMethod("GET", new apigw.LambdaIntegration(props.consultasLambda), {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO
    });
    requests.addMethod("POST", new apigw.LambdaIntegration(props.consultasLambda), {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO
    });

    const requestById = requests.addResource("{id}");

    requestById.addMethod("GET", new apigw.LambdaIntegration(props.consultasLambda), {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO
    });
    requestById.addMethod("PUT", new apigw.LambdaIntegration(props.consultasLambda), {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO
    });


    // /admin/mfes
    const admin = this.api.root.addResource('admin');
    const mfes = admin.addResource('mfes');
    mfes.addMethod('GET', new apigw.LambdaIntegration(props.consultasAdminLambda), {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO
    });
    const mfeById = mfes.addResource('{id}');
    mfeById.addResource('approve').addMethod('PUT', new apigw.LambdaIntegration(props.consultasAdminLambda), {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO
    });
    mfeById.addResource('reject').addMethod('PUT', new apigw.LambdaIntegration(props.consultasAdminLambda), {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO
    });
    mfeById.addResource('under-review').addMethod('PUT', new apigw.LambdaIntegration(props.consultasAdminLambda), {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO
    });

    // /parser
    this.api.root.addResource('parser').addMethod('PUT', new apigw.LambdaIntegration(props.catalogoParserLambda), {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO
    });
  }
}
