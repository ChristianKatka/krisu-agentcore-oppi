"""
Blueberry News Aggregator - CDK Stack
Deploys the news agent to AWS Agent Core Runtime
"""

from aws_cdk import (
    Stack,
    aws_iam as iam,
    aws_bedrockagentcore as bedrockagentcore,
    CfnOutput,
    RemovalPolicy
)
from aws_cdk.aws_ecr_assets import DockerImageAsset, Platform
from constructs import Construct
import os

class BlueberryNewsStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # Build and push Docker image to ECR
        # CDK automatically handles the build and push
        # Build context is the project root so we can access ../requirements.txt
        docker_image = DockerImageAsset(
            self, "ChristianBlueberryNewsImage",
            directory=os.path.join(os.path.dirname(__file__), "..", ".."),  # Project root
            file="phase2_agentcore/Dockerfile",  # Path to Dockerfile from root
            platform=Platform.LINUX_ARM64  # Agent Core requires ARM64
        )

        # IAM Role for Agent Execution
        agent_role = iam.Role(
            self, "ChristianBlueberryAgentRole",
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
                        # ECR permissions (required to pull Docker image)
                        iam.PolicyStatement(
                            sid="ECRImagePull",
                            effect=iam.Effect.ALLOW,
                            actions=[
                                "ecr:GetAuthorizationToken",
                                "ecr:BatchCheckLayerAvailability",
                                "ecr:GetDownloadUrlForLayer",
                                "ecr:BatchGetImage"
                            ],
                            resources=["*"]
                        ),
                        # Bedrock model access (for Nova Pro)
                        iam.PolicyStatement(
                            sid="BedrockModelInvocation",
                            effect=iam.Effect.ALLOW,
                            actions=[
                                "bedrock:InvokeModel",
                                "bedrock:InvokeModelWithResponseStream"
                            ],
                            resources=["*"]
                        ),
                        # CloudWatch Logs (for basic monitoring)
                        iam.PolicyStatement(
                            sid="CloudWatchLogs",
                            effect=iam.Effect.ALLOW,
                            actions=[
                                "logs:CreateLogGroup",
                                "logs:CreateLogStream",
                                "logs:PutLogEvents",
                                "logs:DescribeLogStreams"
                            ],
                            resources=["*"]
                        )
                    ]
                )
            }
        )

        # Create Agent Core Runtime
        blueberry_runtime = bedrockagentcore.CfnRuntime(
            self, "ChristianBlueberryRuntime",
            agent_runtime_name="Christian_Blueberry_News_Agent",
            agent_runtime_artifact=bedrockagentcore.CfnRuntime.AgentRuntimeArtifactProperty(
                container_configuration=bedrockagentcore.CfnRuntime.ContainerConfigurationProperty(
                    container_uri=docker_image.image_uri
                )
            ),
            network_configuration=bedrockagentcore.CfnRuntime.NetworkConfigurationProperty(
                network_mode="PUBLIC"  # Use PUBLIC for easier testing
            ),
            protocol_configuration="HTTP",
            role_arn=agent_role.role_arn,
            description="Christian Blueberry News Aggregator - Fetches tech, AI, and world news from HackerNews and Dev.to",
            environment_variables={
                "AWS_DEFAULT_REGION": self.region,
                "AGENT_NAME": "Christian-Blueberry-News-Agent",
                "OWNER": "Christian",
                "PHASE": "2"
            }
        )

        # Outputs
        CfnOutput(
            self, "ChristianBlueberryAgentRuntimeId",
            description="Christian Blueberry News Agent - Runtime ID",
            value=blueberry_runtime.attr_agent_runtime_id,
            export_name=f"{self.stack_name}-RuntimeId"
        )

        CfnOutput(
            self, "ChristianBlueberryAgentRuntimeArn",
            description="Christian Blueberry News Agent - Runtime ARN (use this to invoke the agent)",
            value=blueberry_runtime.attr_agent_runtime_arn,
            export_name=f"{self.stack_name}-RuntimeArn"
        )

        CfnOutput(
            self, "ChristianBlueberryAgentRoleArn",
            description="Christian Blueberry News Agent - Execution Role ARN",
            value=agent_role.role_arn,
            export_name=f"{self.stack_name}-RoleArn"
        )

        CfnOutput(
            self, "ChristianBlueberryDockerImageUri",
            description="Christian Blueberry News Agent - Docker Image URI in ECR",
            value=docker_image.image_uri,
            export_name=f"{self.stack_name}-ImageUri"
        )
