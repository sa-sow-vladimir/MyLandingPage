import * as core from 'aws-cdk-lib';
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cr from "aws-cdk-lib/custom-resources";
import * as apiGateway from "aws-cdk-lib/aws-apigateway";
import fs = require("fs");
import { Construct } from 'constructs';

export interface FrontendConfigProps extends core.NestedStackProps {
    siteBucket: s3.Bucket;
    api: apiGateway.RestApi;
}

export class FrontendConfig extends core.NestedStack {
  public readonly config: string;

  constructor(scope: Construct, id: string, props: FrontendConfigProps) {
    super(scope, id);

    this.config = JSON.stringify({
        API_URL: props.api.url,
    });

    new cr.AwsCustomResource(this, "WriteS3ConfigFile", {
        onUpdate: {
            service: "S3",
            action: "putObject",
            parameters: {
                Body: this.config,
                Bucket: props.siteBucket.bucketName,
                Key: "config.json",
            },
            physicalResourceId: cr.PhysicalResourceId.of(
                Date.now().toString()
            ), // always write this file
        },
        policy: cr.AwsCustomResourcePolicy.fromSdkCalls({
            resources: cr.AwsCustomResourcePolicy.ANY_RESOURCE,
        }),
    });
  }
}