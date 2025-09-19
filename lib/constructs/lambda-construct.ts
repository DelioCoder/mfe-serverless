import { Construct } from 'constructs';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from "aws-cdk-lib/aws-iam";
import * as path from 'path';
import * as cdk from "aws-cdk-lib";

export interface LambdaConstructProps {
  mfesTable: dynamodb.Table;
  solicitudesTable: dynamodb.Table;
  relacionesTable: dynamodb.Table;
  secuenciaIdTable: dynamodb.Table;
  auditoriaTable: dynamodb.Table;
}

export class LambdaConstruct extends Construct {
  public readonly consultasLambda: lambdaNodejs.NodejsFunction;
  public readonly consultasAdminLambda: lambdaNodejs.NodejsFunction;
  public readonly parseoLambda: lambdaNodejs.NodejsFunction;
  public readonly relacionesLambda: lambdaNodejs.NodejsFunction;

  constructor(scope: Construct, id: string, props: LambdaConstructProps) {
    super(scope, id);

    this.consultasLambda = new lambdaNodejs.NodejsFunction(this, 'ConsultasLambda', {
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: path.join(__dirname, '../../src/lambdas/consultas-mfe/index.ts'),
      handler: 'handler',
      environment: {
        MFES_TABLE: props.mfesTable.tableName,
        SOLICITUDES_TABLE: props.solicitudesTable.tableName,
        RELACIONES_TABLE: props.relacionesTable.tableName
      },
      bundling: {
        forceDockerBundling: false,
        nodeModules: ['uuid', 'class-transformer', 'class-validator', 'reflect-metadata']
      },
      depsLockFilePath: path.join(__dirname, '../../src/lambdas/consultas-mfe/package-lock.json'),
      memorySize: 512,
      timeout: cdk.Duration.seconds(10)
    });

    this.consultasAdminLambda = new lambdaNodejs.NodejsFunction(this, 'ConsultasAdminLambda', {
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: path.join(__dirname, '../../src/lambdas/consultas-admin/index.ts'),
      handler: 'handler',
      environment: {
        MFES_TABLE: props.mfesTable.tableName,
        SOLICITUDES_TABLE: props.solicitudesTable.tableName,
        SECUENCIA_ID_TABLE: props.secuenciaIdTable.tableName,
      },
      bundling: {
        forceDockerBundling: false,
        nodeModules: ['class-transformer', 'class-validator', 'uuid']
      },
      depsLockFilePath: path.join(__dirname, '../../src/lambdas/consultas-admin/package-lock.json'),
      memorySize: 512
    });

    this.relacionesLambda = new lambdaNodejs.NodejsFunction(this, 'ConsultasRelacionesLambda', {
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: path.join(__dirname, '../../src/lambdas/consultas-relaciones/index.ts'),
      handler: 'handler',
      environment: {
        RELACIONES_TABLA: props.relacionesTable.tableName,
      },
      bundling: {
        forceDockerBundling: false,
      },
      depsLockFilePath: path.join(__dirname, '../../src/lambdas/consultas-relaciones/package-lock.json'),
    });

    this.parseoLambda = new lambdaNodejs.NodejsFunction(this, 'CatalogoParserLambda', {
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: path.join(__dirname, '../../src/lambdas/parser/index.ts'),
      handler: 'handler',
      environment: {
        RELACIONES_TABLE: props.relacionesTable.tableName,
      },
      bundling: {
        forceDockerBundling: false,
        nodeModules: ['js-yaml', 'stream', 'uuid', 'class-validator', 'class-transformer', 'reflect-metadata']
      },
      depsLockFilePath: path.join(__dirname, '../../src/lambdas/parser/package-lock.json'),
    });

    this.consultasAdminLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["ses:SendEmail", "ses:SendRawEmail"],
        resources: ["*"], // OJO restringir a identities específicas! OJO
      })
    )

    // props.auditoriaTable.grantReadWriteData(this.consultasAdminLambda);
    props.mfesTable.grantReadWriteData(this.consultasLambda);
    props.mfesTable.grantReadWriteData(this.consultasAdminLambda);
    props.secuenciaIdTable.grantReadWriteData(this.consultasAdminLambda);
    props.solicitudesTable.grantReadWriteData(this.consultasLambda);
    props.solicitudesTable.grantReadWriteData(this.consultasAdminLambda);
    props.relacionesTable.grantReadWriteData(this.parseoLambda);
    props.relacionesTable.grantReadWriteData(this.consultasLambda);
    props.relacionesTable.grantReadData(this.relacionesLambda);
    props.auditoriaTable.grantWriteData(this.consultasAdminLambda);
  }
}
