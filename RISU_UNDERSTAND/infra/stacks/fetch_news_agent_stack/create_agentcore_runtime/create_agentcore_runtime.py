from aws_cdk import (
    aws_bedrockagentcore as bedrockagentcore,
)

def create_agentcore_runtime(scope, docker_image, agent_role):
    return bedrockagentcore.CfnRuntime(
            scope, "ChristianBlueberryAgentcoreRuntime",
            agent_runtime_name="Christian_Blueberry_Agentcore_Runtime",
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
                "AWS_DEFAULT_REGION": scope.region,
                "AGENT_NAME": "Christian-Blueberry-News-Agent",
                "OWNER": "Christian",
                "PHASE": "2"
            }
        )