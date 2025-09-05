import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
const s3 = new S3Client({});

export const getFileFromBucket = async(bucket: string, key: string) => {

    const result = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));

    return result;

}