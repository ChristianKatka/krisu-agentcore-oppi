"""
Blueberry News Aggregator - CDK Stack
Deploys the news agent to AWS Agent Core Runtime
"""

from aws_cdk import (
    Stack,
    CfnOutput,
    RemovalPolicy
)
from aws_cdk.aws_ecr_assets import DockerImageAsset, Platform
from constructs import Construct
import os
from .create_iam_role.create_iam_role import create_iam_role
from .create_agentcore_runtime.create_agentcore_runtime import create_agentcore_runtime



class FetchNewsAgentStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # Build and push Docker image to ECR
        # CDK automatically handles the build and push
        docker_image = DockerImageAsset(
            self, "ChristianBlueberryFetchNewsAgentImage",
            directory=os.path.join(os.path.dirname(__file__), "..", "..", "agents", "agentcore_agents", "agentcore_fetch_news_agent"),
            file="Dockerfile",
            platform=Platform.LINUX_ARM64  # Agent Core requires ARM64
        )

        # IAM Role for Agent Execution
        agent_role = create_iam_role(self)

        # Create Agent Core Runtime
        blueberry_runtime = create_agentcore_runtime(self, docker_image, agent_role)

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
