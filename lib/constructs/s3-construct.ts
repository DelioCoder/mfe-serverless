import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3'
import { Construct } from "constructs";

export class S3Construct extends Construct {

    protected readonly account = cdk.Stack.of(this).account;
    protected readonly region = cdk.Stack.of(this).region;
    public readonly metaDataBucket: s3.Bucket;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        this.metaDataBucket = new s3.Bucket(this, id, {
            bucketName: `mfe-metadata-${this.account}-${this.region}`,
            versioned: false,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            encryption: s3.BucketEncryption.S3_MANAGED,
            removalPolicy: cdk.RemovalPolicy.DESTROY, // Dev
            autoDeleteObjects: true // Dev
        })
    }

}