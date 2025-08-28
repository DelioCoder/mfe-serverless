import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import * as cognito from "aws-cdk-lib/aws-cognito";

interface ApiGatewayCanalConstructProps extends cdk.StackProps {
  apiTecnicaUrl: string;
  userPoolId: string;
}

export class ApiGatewayCanalConstruct extends Construct {
  public readonly api: apigateway.RestApi;

  constructor(scope: Construct, id: string, props: ApiGatewayCanalConstructProps) {
    super(scope, id);

    // Lambda Proxy
    const proxyLambda = new lambda.Function(this, "LambdaProxyCanal", {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: "proxy.handler",
      code: lambda.Code.fromAsset(path.join(__dirname, "../../src/lambdas/canal")),
      environment: {
        API_TECNICA_URL: props.apiTecnicaUrl,
      },
    });

    // API Gateway Canal
    this.api = new apigateway.RestApi(this, "ApiCanal", {
      restApiName: "API Canal MFE",
      description: "API expuesta al cliente final para el catálogo de MFEs",
    });

    const userPool = cognito.UserPool.fromUserPoolId(this, "ImportedUserPool", props.userPoolId);

    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, "ApiCanalAuthorizer", {
      cognitoUserPools: [userPool],
    });

    // Proxy ANY → Lambda
    const proxyIntegration = new apigateway.LambdaIntegration(proxyLambda);
    this.api.root.addProxy({
      defaultIntegration: proxyIntegration,
      anyMethod: true,
      defaultMethodOptions: {
        authorizer,
        authorizationType: apigateway.AuthorizationType.COGNITO,
      },
    });
  }
}
