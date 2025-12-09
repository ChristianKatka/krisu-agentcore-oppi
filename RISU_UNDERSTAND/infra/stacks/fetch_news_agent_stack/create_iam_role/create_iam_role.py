from aws_cdk import (
    aws_iam as iam,
)

def create_iam_role(scope):
    return iam.Role(
        scope, "ChristianBlueberryAgentRole",
        role_name="Christian-Blueberry-News-Agent-ExecutionRole",
        description="Execution role for Christian Blueberry News Aggregator Agent",
        assumed_by=iam.ServicePrincipal("bedrock-agentcore.amazonaws.com"),
        managed_policies=[
            iam.ManagedPolicy.from_aws_managed_policy_name(
                "BedrockAgentCoreFullAccess"
            )
        ],
        inline_policies={
            "ChristianBlueberryNewsAgentPolicy": iam.PolicyDocument(
                statements=[
                    iam.PolicyStatement(
                        sid="ECRImagePull",
                        effect=iam.Effect.ALLOW,
                        actions=[
                            "ecr:GetAuthorizationToken",
                            "ecr:BatchCheckLayerAvailability",
                            "ecr:GetDownloadUrlForLayer",
                            "ecr:BatchGetImage",
                        ],
                        resources=["*"],
                    ),
                    iam.PolicyStatement(
                        sid="BedrockModelInvocation",
                        effect=iam.Effect.ALLOW,
                        actions=[
                            "bedrock:InvokeModel",
                            "bedrock:InvokeModelWithResponseStream",
                        ],
                        resources=["*"],
                    ),
                    iam.PolicyStatement(
                        sid="CloudWatchLogs",
                        effect=iam.Effect.ALLOW,
                        actions=[
                            "logs:CreateLogGroup",
                            "logs:CreateLogStream",
                            "logs:PutLogEvents",
                            "logs:DescribeLogStreams",
                        ],
                        resources=["*"],
                    ),
                ]
            )
        },
    )