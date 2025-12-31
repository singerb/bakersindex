import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as synced_folder from "@pulumi/synced-folder";

// ---------- CONFIG VALUES & SECRETS -------------

const config = new pulumi.Config();

const path = "../bi-frontend/build/client"
const indexDocument = "index.html";
const databaseUrl = config.requireSecret("databaseUrl");
const issuerUrl = config.requireSecret("issuerUrl");
const audience = config.requireSecret("audience");

// ---------- LAMBDA & API GATEWAY -------------

const stack = pulumi.getStack();

const apiGatewayLogGroup = new aws.cloudwatch.LogGroup("api-gateway-log-group", {
    // AWS automatically names the log group in a specific format if you don't provide a name,
    // but explicitly naming it gives you more control (e.g., retention settings).
    retentionInDays: 7,
});

const apiGatewayCloudWatchRole = new aws.iam.Role("api-gw-cloudwatch-role", {
    assumeRolePolicy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [{
            Action: "sts:AssumeRole",
            Effect: "Allow",
            Principal: {
                Service: "apigateway.amazonaws.com",
            },
        }],
    }),
});

const apiGatewayCloudWatchPolicy = new aws.iam.RolePolicy("api-gw-cloudwatch-policy", {
    role: apiGatewayCloudWatchRole.id,
    policy: pulumi
        .all([apiGatewayLogGroup.arn])
        .apply(([logGroupArn]) =>
            JSON.stringify({
                Version: "2012-10-17",
                Statement: [
                    {
                        Effect: "Allow",
                        Action: [
                            "logs:CreateLogGroup",
                            "logs:CreateLogStream",
                            "logs:PutLogEvents",
                        ],
                        Resource: logGroupArn,
                    },
                ],
            })
        ),
});

const lambdaRole = new aws.iam.Role("lambdaRole", {
    assumeRolePolicy: {
        Version: "2012-10-17",
        Statement: [
            {
                Action: "sts:AssumeRole",
                Principal: {
                    Service: "lambda.amazonaws.com",
                },
                Effect: "Allow",
                Sid: "",
            },
        ],
    },
});

const lambdaRoleAttachment = new aws.iam.RolePolicyAttachment("lambdaRoleAttachment", {
    role: lambdaRole,
    policyArn: aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole,
});

const lambda = new aws.lambda.Function("lambdaFunction", {
    code: new pulumi.asset.FileArchive("../bi-backend/lambda-handlers/formulas/bootstrap.zip"),
    runtime: "provided.al2023",
    role: lambdaRole.arn,
    handler: "bootstrap",
    environment: {
        variables: {
            DATABASE_URL: databaseUrl,
        }
    },
});

const apigw = new aws.apigatewayv2.Api("httpApiGateway", {
    protocolType: "HTTP",
});

const lambdaPermission = new aws.lambda.Permission("lambdaPermission", {
    action: "lambda:InvokeFunction",
    principal: "apigateway.amazonaws.com",
    function: lambda,
    sourceArn: pulumi.interpolate`${apigw.executionArn}/*/*`,
}, { dependsOn: [apigw, lambda] });

const integration = new aws.apigatewayv2.Integration("lambdaIntegration", {
    apiId: apigw.id,
    integrationType: "AWS_PROXY",
    integrationUri: lambda.arn,
    integrationMethod: "POST",
    payloadFormatVersion: "2.0",
    passthroughBehavior: "WHEN_NO_MATCH",
});

// Create the JWT Authorizer
const jwtAuthorizer = new aws.apigatewayv2.Authorizer("jwtAuthorizer", {
    apiId: apigw.id,
    authorizerType: "JWT",
    identitySources: ["$request.header.Authorization"], // Tells API GW where to find the token
    jwtConfiguration: {
        audiences: [audience],
        issuer: issuerUrl,
    },
});

const route = new aws.apigatewayv2.Route("apiRoute", {
    apiId: apigw.id,
    routeKey: "GET /api/formulas",
    target: pulumi.interpolate`integrations/${integration.id}`,
    authorizationType: "JWT", // Specify JWT authorization
    authorizerId: jwtAuthorizer.id, // Link the authorizer
});

const stage = new aws.apigatewayv2.Stage("apiStage", {
    apiId: apigw.id,
    name: stack,
    routeSettings: [
        {
            routeKey: route.routeKey,
            throttlingBurstLimit: 5000,
            throttlingRateLimit: 10000,
        },
    ],
    autoDeploy: true,
    defaultRouteSettings: {
        detailedMetricsEnabled: true,
    },
    accessLogSettings: {
        destinationArn: apiGatewayLogGroup.arn,
        // Define the log format (e.g., JSON, CSV)
        format: JSON.stringify({
            requestId: "$context.requestId",
            ip: "$context.identity.sourceIp",
            caller: "$context.identity.caller",
            userAgent: "$context.identity.userAgent",
            requestTime: "$context.requestTime",
            httpMethod: "$context.httpMethod",
            resourcePath: "$context.resourcePath",
            status: "$context.status",
            protocol: "$context.protocol",
            responseLength: "$context.responseLength",
            authorizerError: "$context.authorizer.error",
            authorizerSubject: "$context.authorizer.claims.sub",
            integrationStatus: "$context.integration.status",
            integrationLatency: "$context.integrationLatency",
        }),
    },
}, { dependsOn: [route] });

export const endpoint = pulumi.interpolate`${apigw.apiEndpoint}/${stage.name}`;

// ---------- STATIC & CLOUDFRONT -------------

// Create an S3 bucket and configure it as a website.
const bucket = new aws.s3.Bucket("bucket");

const bucketWebsite = new aws.s3.BucketWebsiteConfiguration("bucketWebsite", {
    bucket: bucket.bucket,
    indexDocument: { suffix: indexDocument },
});

// Configure ownership controls for the new S3 bucket
const ownershipControls = new aws.s3.BucketOwnershipControls("ownership-controls", {
    bucket: bucket.bucket,
    rule: {
        objectOwnership: "ObjectWriter",
    },
});

// Configure public ACL block on the new S3 bucket
const publicAccessBlock = new aws.s3.BucketPublicAccessBlock("public-access-block", {
    bucket: bucket.bucket,
    blockPublicAcls: false,
});

// Use a synced folder to manage the files of the website.
const bucketFolder = new synced_folder.S3BucketFolder("bucket-folder", {
    path: path,
    bucketName: bucket.bucket,
    acl: "public-read",
}, { dependsOn: [ownershipControls, publicAccessBlock] });

// 1. Create a CloudWatch Log Group in us-east-1 region.
// Note: The provider must be explicitly set to 'us-east-1' for the log group resource.
const usEast1Provider = new aws.Provider("us-east-1", {
    region: "us-east-1",
});

const cfLogGroup = new aws.cloudwatch.LogGroup("cloudfront-logs", {
    // You can specify retention policies, e.g., 7 days
    retentionInDays: 7,
}, { provider: usEast1Provider });

// 2. Create an IAM Role for CloudFront to write to the Log Group
const cloudfrontLogRole = new aws.iam.Role("cloudfront-log-role", {
    assumeRolePolicy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [{
            Action: "sts:AssumeRole",
            Effect: "Allow",
            Principal: {
                Service: "cloudfront.amazonaws.com",
            },
        }],
    }),
});

// 3. Attach a policy to the IAM role
const logPolicyAttachment = new aws.iam.RolePolicy("cloudfront-log-policy", {
    role: cloudfrontLogRole.id,
    policy: pulumi.all([cfLogGroup.arn]).apply(([arn]) => JSON.stringify({
        Version: "2012-10-17",
        Statement: [{
            Action: [
                "logs:CreateLogStream",
                "logs:PutLogEvents",
            ],
            Effect: "Allow",
            Resource: `${arn}:*`,
        }],
    })),
});

/*
// 2. Create the Origin Access Control (OAC)
const oac = new aws.cloudfront.OriginAccessControl("myOAC", {
    originAccessControlOriginType: "s3",
    signingBehavior: "always",
    signingProtocol: "sigv4",
});

// 3. Create the Bucket Policy to grant the OAC necessary permissions
const bucketPolicy = new aws.s3.BucketPolicy("spaBucketPolicy", {
    bucket: bucket.id, // Reference the bucket created above
    policy: pulumi.all([bucket.arn, oac.id]).apply(([bucketArn, oacId]) => JSON.stringify({
        Version: "2012-10-17",
        Statement: [
            {
                Sid: "CloudFrontOACPolicy",
                Effect: "Allow",
                Principal: {
                    Service: "cloudfront.amazonaws.com",
                },
                Action: "s3:GetObject", // CloudFront only needs GetObject for standard use
                Resource: `${bucketArn}/*`, // Grant access to all objects in the bucket
                Condition: {
                    StringEquals: {
                        "AWS:SourceArn": oacId,
                    },
                },
            },
            // If you specifically need ListBucket for a specific use case, add it here:
            {
                Sid: "CloudFrontOACListBucket",
                Effect: "Allow",
                Principal: {
                    Service: "cloudfront.amazonaws.com",
                },
                Action: "s3:ListBucket",
                Resource: bucketArn, // ListBucket permission is on the bucket ARN itself, not the objects
                Condition: {
                    StringEquals: {
                        "AWS:SourceArn": oacId,
                    },
                },
            },
        ],
    })),
});
*/

// Create a CloudFront CDN to distribute and cache the website.
const cdn = new aws.cloudfront.Distribution("cdn", {
    enabled: true,
    origins: [
        {
            originId: bucket.arn,
            domainName: bucketWebsite.websiteEndpoint,
            // originAccessControlId: oac.id,
            customOriginConfig: {
                originProtocolPolicy: "http-only",
                httpPort: 80,
                httpsPort: 443,
                originSslProtocols: ["TLSv1.2"],
            },
        },
        {
            originId: apigw.arn,
            domainName: apigw.apiEndpoint.apply(url => url.replace("https://", "").replace("/", "")),
            originPath: pulumi.interpolate`/${stage.name}`,
            customOriginConfig: {
                originProtocolPolicy: "https-only",
                httpPort: 80,
                httpsPort: 443,
                originSslProtocols: ["TLSv1.2"],
            },
        },
    ],
    defaultCacheBehavior: {
        targetOriginId: bucket.arn,
        viewerProtocolPolicy: "redirect-to-https",
        allowedMethods: [
            "GET",
            "HEAD",
            "OPTIONS",
        ],
        cachedMethods: [
            "GET",
            "HEAD",
            "OPTIONS",
        ],
        defaultTtl: 600,
        maxTtl: 600,
        minTtl: 600,
        forwardedValues: {
            queryString: true,
            cookies: {
                forward: "all",
            },
        },
    },
    orderedCacheBehaviors: [
        {
            pathPattern: "/api/*", // Specific behavior for /api/* routes
            targetOriginId: apigw.arn, // Routes to API Gateway origin
            viewerProtocolPolicy: "redirect-to-https",
            allowedMethods: ["GET", "HEAD", "OPTIONS", "PUT", "POST", "DELETE", "PATCH"],
            cachedMethods: ["GET", "HEAD", "OPTIONS"],
            compress: true,
            forwardedValues: { // API behavior typically needs to forward headers/query strings
                queryString: true,
                cookies: { forward: "all" },
                headers: ["Accept", "Authorization", "Content-Type", "Origin", "Referer"],
            },
            minTtl: 0,
            defaultTtl: 0, // API responses generally shouldn't be cached by CloudFront
            maxTtl: 0,
        },
    ],
    priceClass: "PriceClass_100",
    customErrorResponses: [
        {
            errorCode: 404,
            responseCode: 200,
            responsePagePath: `/${indexDocument}`,
        },
        {
            errorCode: 403, // TODO: get the S3 bucket serving as a bucket not a website, and use OAC to give Cloudfront ListBucket perms so you can remove this error response
            responseCode: 200,
            responsePagePath: `/${indexDocument}`,
        },
    ],
    restrictions: {
        geoRestriction: {
            restrictionType: "none",
        },
    },
    viewerCertificate: {
        cloudfrontDefaultCertificate: true,
    },
});

const cfLogsDeliveryDestination = new aws.cloudwatch.LogDeliveryDestination("cf-logs-delivery", {
    name: "cf-logs-delivery",
    deliveryDestinationConfiguration: {
        destinationResourceArn: cfLogGroup.arn,
    },
});

const cfLogDeliverySource = new aws.cloudwatch.LogDeliverySource("cf-logs-source", {
    region: "us-east-1",
    name: "cloudfront-logs",
    logType: "ACCESS_LOGS",
    resourceArn: cdn.arn,
});

const cfLogDelivery = new aws.cloudwatch.LogDelivery("cf-logs", {
    region: "us-east-1",
    deliverySourceName: cfLogDeliverySource.name,
    deliveryDestinationArn: cfLogsDeliveryDestination.arn,
});

// Export the URLs and hostnames of the bucket and distribution.
export const originURL = pulumi.interpolate`http://${bucketWebsite.websiteEndpoint}`;
export const originHostname = bucketWebsite.websiteEndpoint;
export const cdnURL = pulumi.interpolate`https://${cdn.domainName}`;
export const cdnHostname = cdn.domainName;
