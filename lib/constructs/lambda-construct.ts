import { Construct } from 'constructs';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from "aws-cdk-lib/aws-iam";
import * as path from 'path';

export interface LambdaConstructProps {
  mfesTable: dynamodb.Table;
  solicitudesTable: dynamodb.Table;
  relacionesTable: dynamodb.Table;
  secuenciaIdTable: dynamodb.Table;
  auditoriaTable?: dynamodb.Table;
}

export class LambdaConstruct extends Construct {
  public readonly consultasLambda: lambdaNodejs.NodejsFunction;
  public readonly consultasAdminLambda: lambdaNodejs.NodejsFunction;
  public readonly catalogoParserLambda: lambdaNodejs.NodejsFunction;

  constructor(scope: Construct, id: string, props: LambdaConstructProps) {
    super(scope, id);

    this.consultasLambda = new lambdaNodejs.NodejsFunction(this, 'ConsultasLambda', {
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: path.join(__dirname, '../../src/lambdas/consultas/index.ts'),
      handler: 'handler',
      environment: {
        MFES_TABLE: props.mfesTable.tableName,
        SOLICITUDES_TABLE: props.solicitudesTable.tableName,
      },
      bundling: {
        forceDockerBundling: false,
        nodeModules: ['uuid', 'class-transformer', 'class-validator']
      },
      depsLockFilePath: path.join(__dirname, '../../src/lambdas/consultas/package-lock.json'),
      
    });


    this.consultasAdminLambda = new lambdaNodejs.NodejsFunction(this, 'ConsultasAdminLambda', {
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: path.join(__dirname, '../../src/lambdas/admin/index.ts'),
      handler: 'handler',
      environment: {
        MFES_TABLE: props.mfesTable.tableName,
        SOLICITUDES_TABLE: props.solicitudesTable.tableName,
        SECUENCIA_ID_TABLE: props.secuenciaIdTable.tableName,
      },
      bundling: {
        forceDockerBundling: false,
        nodeModules: ['uuid', 'class-transformer', 'class-validator']
      },
      depsLockFilePath: path.join(__dirname, '../../src/lambdas/admin/package-lock.json'),
    });

    this.consultasAdminLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["ses:SendEmail", "ses:SendRawEmail"],
        resources: ["*"], // Ojo: puedes restringir a identities específicas
      })
    )
    
    this.catalogoParserLambda = new lambdaNodejs.NodejsFunction(this, 'CatalogoParserLambda', {
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: path.join(__dirname, '../../src/lambdas/catalogo-parser/index.ts'),
      handler: 'handler',
      environment: {
        RELACIONES_TABLE: props.relacionesTable.tableName,
      },
      bundling: {
        forceDockerBundling: false,
      },
    });
    // props.auditoriaTable.grantReadWriteData(this.consultasAdminLambda);
    props.mfesTable.grantReadWriteData(this.consultasLambda);
    props.mfesTable.grantReadWriteData(this.consultasAdminLambda);
    props.secuenciaIdTable.grantReadWriteData(this.consultasAdminLambda);
    props.solicitudesTable.grantReadWriteData(this.consultasLambda);
    props.solicitudesTable.grantReadWriteData(this.consultasAdminLambda);
    props.relacionesTable.grantReadWriteData(this.catalogoParserLambda);
  }
}
