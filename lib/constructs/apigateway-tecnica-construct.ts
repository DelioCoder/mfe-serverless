import { Construct } from 'constructs';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cognito from "aws-cdk-lib/aws-cognito";

export interface ApiGatewayTecnicaConstructProps {
  consultasLambda: lambda.IFunction;
  consultasAdminLambda: lambda.IFunction;
  relacionesLambda: lambda.IFunction;
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
    // /mfes
    const mfes = this.api.root.addResource("mfes");

    mfes.addMethod('GET', new apigw.LambdaIntegration(props.consultasLambda), {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO
    });

    const mfeByTerm = mfes.addResource("{term}");
    mfeByTerm.addMethod("GET", new apigw.LambdaIntegration(props.consultasLambda), {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO
    });

    // /mfes/requests
    const requests = mfes.addResource("requests");
    requests.addMethod("POST", new apigw.LambdaIntegration(props.consultasLambda), {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO
    });

    const requestsByUser = requests.addResource('by');

    requestsByUser.addResource('{user}').addMethod('GET', new apigw.LambdaIntegration(props.consultasLambda), {
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
    const adminRoute = this.api.root.addResource('admin');

    const adminMfesRoute = adminRoute.addResource('mfes-request');
    adminMfesRoute.addMethod('GET', new apigw.LambdaIntegration(props.consultasAdminLambda), {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO
    });

    const adminMfeRequestRoute = adminMfesRoute.addResource('{id}');
    adminMfeRequestRoute.addMethod("GET", new apigw.LambdaIntegration(props.consultasAdminLambda), {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO
    });
    adminMfeRequestRoute.addResource('approve').addMethod('PUT', new apigw.LambdaIntegration(props.consultasAdminLambda), {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO
    });
    adminMfeRequestRoute.addResource('reject').addMethod('PUT', new apigw.LambdaIntegration(props.consultasAdminLambda), {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO
    });
    adminMfeRequestRoute.addResource('under-review').addMethod('PUT', new apigw.LambdaIntegration(props.consultasAdminLambda), {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO
    });

    // [/relaciones]
    const mfeRelaciones = this.api.root.addResource('mfe-relaciones');
    mfeRelaciones.addMethod('GET', new apigw.LambdaIntegration(props.relacionesLambda), { authorizer, authorizationType: apigw.AuthorizationType.COGNITO })

    mfeRelaciones.addResource('{id}')
      .addMethod('GET', new apigw.LambdaIntegration(props.relacionesLambda), { authorizer, authorizationType: apigw.AuthorizationType.COGNITO })

  }

}
