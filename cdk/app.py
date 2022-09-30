#!/usr/bin/env python3
import os
from constructs import Construct
from aws_cdk import (
    App,
    Environment,
    Stack,
    Duration,
    aws_certificatemanager as acm,
    aws_cloudfront as cloudfront,
    aws_cloudfront_origins as origins,
    aws_lambda as lambda_,
    aws_route53 as route53,
    aws_route53_targets as targets,
    aws_s3 as s3,
    aws_s3_deployment as s3_deployment,
)

class OptimizelyEdgeSdkStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # Determine domain name and sub domain from the context variables
        domain_name = self.node.try_get_context('domainName')
        subdomain = 'edge-sdk.{}'.format(domain_name)

        # Assumption: Hosted Zone is created outside of this project
        # Fetch the Route53 Hosted Zone
        zone = route53.HostedZone.from_lookup(
            self, 'Zone',
            domain_name=domain_name,
        )

        # Bucket to store static website files, such as HTML and JavaScript
        bucket = s3.Bucket(self, 'Storage')

        # Copy local files to S3
        s3_deployment.BucketDeployment(
            self, 'Deployment',
            sources=[
                s3_deployment.Source.asset('./src/html'),
            ],
            destination_bucket=bucket,
            prune=False,
            retain_on_delete=False,
        )

        # Give a CloudFront OAI access to the S3 bucket
        origin_identity = cloudfront.OriginAccessIdentity(self, 'Identity')
        bucket.grant_read(origin_identity.grant_principal)

        viewer_request_function = lambda_.Function(
            self, 'ViewerRequestFunction',
            runtime=lambda_.Runtime.NODEJS_16_X,
            code=lambda_.Code.from_asset(
                path='src/viewer-request',
                exclude=[
                    '.gitignore', # Don't need gitignore
                    '**/package-lock.json', # Don't need lock files
                    'node_modules/**/*.!(js|json)', # Exclude anything that isn't JavaScript or JSON
                ],
            ),
            handler='index.handler',
            # current_version_options=lambda_.VersionOptions(
            #     retry_attempts=0,
            # )
        )

        # Public SSL certificate for subdomain
        certificate = acm.DnsValidatedCertificate(
            self, 'Certificate',
            domain_name=subdomain,
            hosted_zone=zone,
            region='us-east-1',
        )

        # Content Delivery Network
        distribution = cloudfront.Distribution(
            self, 'CDN',
            default_root_object='index.html',
            domain_names=[subdomain],
            certificate=certificate,
            default_behavior=cloudfront.BehaviorOptions(
                origin=origins.S3Origin(
                    bucket=bucket,
                    origin_access_identity=origin_identity,
                ),
                viewer_protocol_policy=cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                cache_policy=cloudfront.CachePolicy.CACHING_DISABLED,
            )
        )

        # Both IPv4 and IPv6 addresses
        target = route53.RecordTarget.from_alias(
            alias_target=targets.CloudFrontTarget(distribution)
        )
        route53.AaaaRecord(
            self, 'DnsRecordIpv6',
            record_name=subdomain,
            target=target,
            zone=zone,
        )
        route53.ARecord(
            self, 'DnsRecordIpv4',
            record_name=subdomain,
            target=target,
            zone=zone,
        )


app = App()
OptimizelyEdgeSdkStack(app, 'OptimizelyEdgeSdk',
    env=Environment(
        account=os.getenv('CDK_DEFAULT_ACCOUNT'),
        region='us-east-1', # Needs to be N. Virginia since using Lambda@Edge
    ),
)
app.synth()