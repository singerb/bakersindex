import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

// Create an AWS resource (S3 Bucket)
const bucket = new aws.s3.Bucket("my-bucket");

// Export the name of the bucket
export const bucketName = bucket.id;

// Turn the bucket into a website:
const website = new aws.s3.BucketWebsiteConfiguration("website", {
    bucket: bucket.id,
    indexDocument: {
        suffix: "index.html",
    },
});

// Permit access control configuration:
const ownershipControls = new aws.s3.BucketOwnershipControls("ownership-controls", {
    bucket: bucket.id,
    rule: {
        objectOwnership: "ObjectWriter"
    }
});

// Enable public access to the website:
const publicAccessBlock = new aws.s3.BucketPublicAccessBlock("public-access-block", {
    bucket: bucket.id,
    blockPublicAcls: false,
});

// Create an S3 Bucket object
const bucketObject = new aws.s3.BucketObject("index.html", {
    bucket: bucket.id,
    source: new pulumi.asset.FileAsset("index.html"),
    contentType: "text/html",
    acl: "public-read",
}, { dependsOn: [ownershipControls, publicAccessBlock] });

// Export the bucket's autoassigned URL:
export const url = pulumi.interpolate`http://${website.websiteEndpoint}`;
