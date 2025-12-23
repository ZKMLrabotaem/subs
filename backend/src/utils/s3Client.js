import AWS from "aws-sdk";

const s3 = new AWS.S3({
    endpoint: "http://minio:9000",
    accessKeyId: "minioadmin",
    secretAccessKey: "minioadmin",
    region: "us-east-1",
    s3ForcePathStyle: true
});

export default s3;
