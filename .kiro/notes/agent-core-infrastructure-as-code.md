# Agent Core Infrastructure as Code (IaC)

## Overview

AWS provides multiple ways to deploy Agent Core infrastructure using Infrastructure as Code (IaC). This allows you to:

- Deploy AgentCore resources consistently across environments
- Automate infrastructure provisioning
- Maintain version control of your infrastructure
- Implement AWS best practices for security and monitoring

## Deployment Options

### 1. AWS CDK (Recommended for Python developers)

- **Language**: Python
- **Advantages**:
  - Uses `DockerImageAsset` for container building (no CodeBuild needed in some cases)
  - Cleaner construct separation and reusability
  - Type safety and IDE support
  - Faster deployment times
  - Programmatic infrastructure definition

### 2. CloudFormation

- **Language**: YAML/JSON templates
- **Advantages**:
  - Declarative infrastructure
  - No additional tools needed beyond AWS CLI
  - Native AWS service

### 3. Terraform

- **Language**: HCL (HashiCorp Configuration Language)
- **Advantages**:
  - Declarative infrastructure with state management
  - Multi-cloud support
  - Large ecosystem of providers

## Available Deployment Patterns

### 1. Basic Runtime

**What it deploys**:

- AgentCore Runtime with simple Strands agent
- ECR Repository for Docker images
- IAM roles with least-privilege policies
- CodeBuild project for automated ARM64 Docker builds
- Lambda functions for custom resources

**Use case**: Learning AgentCore basics without complexity

**Deployment time**: ~8-12 minutes

**Estimated cost**: ~$7-13/month (excluding Bedrock usage)

**Key Components**:

```python
# ECR Repository
ecr_repository = ecr.Repository(
    repository_name="basic-agent",
    removal_policy=RemovalPolicy.DESTROY,
    empty_on_delete=True,
    image_scan_on_push=True
)

# AgentCore Runtime
agent_runtime = bedrockagentcore.CfnRuntime(
    agent_runtime_name="BasicAgent",
    agent_runtime_artifact={
        "container_configuration": {
            "container_uri": f"{ecr_repository.repository_uri}:latest"
        }
    },
    role_arn=agent_role.role_arn,
    network_configuration={
        "network_mode": "PUBLIC"  # or "PRIVATE"
    }
)
```

### 2. Multi-Agent Runtime

**What it deploys**:

- Two AgentCore Runtimes (Orchestrator + Specialist)
- Agent-to-agent communication capabilities
- IAM roles with agent-to-agent invocation permissions
- Separate ECR repositories for each agent
- CodeBuild projects for both agents

**Architecture**:

- **Agent 1 (Orchestrator)**: Main entry point, routes requests, delegates complex tasks
- **Agent 2 (Specialist)**: Expert agent for detailed analysis

**Use case**: Building sophisticated AI systems with specialized capabilities

**Deployment time**: ~15-20 minutes

**Estimated cost**: ~$13-25/month (excluding Bedrock usage)

**Key Pattern - Agent-to-Agent Communication**:

Agent 1 has a tool to invoke Agent 2:

```python
@tool
def call_specialist_agent(query: str) -> Dict[str, Any]:
    """
    Call the specialist agent (agent2) for detailed analysis.
    """
    agentcore_client = boto3.client('bedrock-agentcore')

    response = agentcore_client.invoke_agent_runtime(
        agentRuntimeArn=AGENT2_ARN,
        qualifier="DEFAULT",
        payload=json.dumps({"prompt": query})
    )

    return {"status": "success", "content": response}
```

Agent 1's IAM role needs permission:

```python
iam.PolicyStatement(
    sid="InvokeAgent2Runtime",
    effect=iam.Effect.ALLOW,
    actions=["bedrock-agentcore:InvokeAgentRuntime"],
    resources=[f"arn:aws:bedrock-agentcore:{region}:{account}:runtime/*"]
)
```

### 3. MCP Server on AgentCore Runtime

**What it deploys**:

- AgentCore Runtime hosting MCP (Model Context Protocol) server
- Amazon Cognito for JWT authentication
- Automated ARM64 Docker builds
- Sample MCP tools: `add_numbers`, `multiply_numbers`, `greet_user`

**Use case**: Exposing tools via MCP protocol with authentication

**Deployment time**: ~10-15 minutes

**Estimated cost**: ~$50-100/month

### 4. End-to-End Weather Agent

**What it deploys**:

- AgentCore Runtime with Strands agent
- Browser Tool for web scraping weather data
- Code Interpreter Tool for weather analysis
- Memory for storing user preferences
- S3 bucket for results storage

**Features**:

- Scrapes weather.gov
- Analyzes weather conditions
- Stores user preferences
- Generates activity recommendations

**Deployment time**: ~15-20 minutes

**Estimated cost**: ~$100-150/month

## Common CDK Deployment Pattern

### Prerequisites

```bash
# Install CDK
npm install -g aws-cdk

# Verify version (need 2.220.0+ for BedrockAgentCore)
cdk --version

# Install Python dependencies
pip install -r requirements.txt

# Bootstrap CDK (first time only)
cdk bootstrap
```

### Standard Deployment Steps

```bash
# 1. Navigate to example directory
cd agentcore-samples/04-infrastructure-as-code/cdk/basic-runtime/

# 2. Create virtual environment (optional but recommended)
python3 -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Synthesize CloudFormation template (optional - to preview)
cdk synth

# 5. Deploy
cdk deploy --require-approval never

# 6. Get outputs
aws cloudformation describe-stacks \
  --stack-name BasicAgentDemo \
  --query 'Stacks[0].Outputs'
```

### Cleanup

```bash
# Destroy all resources
cdk destroy

# Or using CloudFormation
aws cloudformation delete-stack --stack-name BasicAgentDemo
```

## Key CDK Constructs

### 1. ECR Repository

```python
from aws_cdk import aws_ecr as ecr, RemovalPolicy

ecr_repository = ecr.Repository(
    self, "ECRRepository",
    repository_name=f"{stack_name}-agent",
    image_tag_mutability=ecr.TagMutability.MUTABLE,
    removal_policy=RemovalPolicy.DESTROY,  # Delete on stack deletion
    empty_on_delete=True,  # Delete images on deletion
    image_scan_on_push=True  # Security scanning
)
```

### 2. CodeBuild Project for ARM64 Docker Builds

```python
from aws_cdk import aws_codebuild as codebuild

build_project = codebuild.Project(
    self, "AgentImageBuildProject",
    project_name=f"{stack_name}-agent-build",
    role=codebuild_role,
    environment=codebuild.BuildEnvironment(
        build_image=codebuild.LinuxArmBuildImage.AMAZON_LINUX_2_STANDARD_3_0,
        compute_type=codebuild.ComputeType.LARGE,
        privileged=True  # Required for Docker builds
    ),
    build_spec=codebuild.BuildSpec.from_object({
        "version": "0.2",
        "phases": {
            "pre_build": {
                "commands": [
                    "aws ecr get-login-password | docker login ..."
                ]
            },
            "build": {
                "commands": [
                    "docker build -t $IMAGE_REPO_NAME:$IMAGE_TAG .",
                    "docker tag ..."
                ]
            },
            "post_build": {
                "commands": [
                    "docker push ..."
                ]
            }
        }
    })
)
```

### 3. IAM Role for Agent Execution

```python
from aws_cdk import aws_iam as iam

agent_execution_role = iam.Role(
    self, "AgentExecutionRole",
    assumed_by=iam.ServicePrincipal("bedrock-agentcore.amazonaws.com"),
    managed_policies=[
        iam.ManagedPolicy.from_aws_managed_policy_name(
            "BedrockAgentCoreFullAccess"
        )
    ],
    inline_policies={
        "AgentPolicy": iam.PolicyDocument(
            statements=[
                # ECR access
                iam.PolicyStatement(
                    effect=iam.Effect.ALLOW,
                    actions=[
                        "ecr:BatchGetImage",
                        "ecr:GetDownloadUrlForLayer",
                        "ecr:BatchCheckLayerAvailability"
                    ],
                    resources=[ecr_repository.repository_arn]
                ),
                # CloudWatch Logs
                iam.PolicyStatement(
                    effect=iam.Effect.ALLOW,
                    actions=[
                        "logs:CreateLogGroup",
                        "logs:CreateLogStream",
                        "logs:PutLogEvents"
                    ],
                    resources=["*"]
                ),
                # Bedrock Model Invocation
                iam.PolicyStatement(
                    effect=iam.Effect.ALLOW,
                    actions=[
                        "bedrock:InvokeModel",
                        "bedrock:InvokeModelWithResponseStream"
                    ],
                    resources=["*"]
                )
            ]
        )
    }
)
```

### 4. AgentCore Runtime

```python
from aws_cdk import aws_bedrockagentcore as bedrockagentcore

agent_runtime = bedrockagentcore.CfnRuntime(
    self, "AgentRuntime",
    agent_runtime_name="MyAgent",
    agent_runtime_artifact=bedrockagentcore.CfnRuntime.AgentRuntimeArtifactProperty(
        container_configuration=bedrockagentcore.CfnRuntime.ContainerConfigurationProperty(
            container_uri=f"{ecr_repository.repository_uri}:latest"
        )
    ),
    network_configuration=bedrockagentcore.CfnRuntime.NetworkConfigurationProperty(
        network_mode="PUBLIC"  # or "PRIVATE"
    ),
    protocol_configuration="HTTP",  # or "MCP"
    role_arn=agent_execution_role.role_arn,
    description="My Agent Core Runtime",
    environment_variables={
        "AWS_DEFAULT_REGION": region,
        "CUSTOM_VAR": "value"
    }
)
```

### 5. Lambda Custom Resource for Build Trigger

```python
from aws_cdk import aws_lambda as lambda_, CustomResource, Duration

# Lambda function to trigger CodeBuild
build_trigger_function = lambda_.Function(
    self, "BuildTriggerFunction",
    runtime=lambda_.Runtime.PYTHON_3_9,
    handler="build_trigger_lambda.handler",
    timeout=Duration.minutes(15),
    code=lambda_.Code.from_asset("./infra_utils"),
    initial_policy=[
        iam.PolicyStatement(
            effect=iam.Effect.ALLOW,
            actions=["codebuild:StartBuild", "codebuild:BatchGetBuilds"],
            resources=[build_project.project_arn]
        )
    ]
)

# Custom Resource to trigger build during deployment
trigger_build = CustomResource(
    self, "TriggerImageBuild",
    service_token=build_trigger_function.function_arn,
    properties={
        "ProjectName": build_project.project_name,
        "WaitForCompletion": "true"
    }
)

# Ensure runtime waits for build to complete
agent_runtime.node.add_dependency(trigger_build)
```

## Agent Code Structure

### Basic Agent (Strands)

```python
from strands import Agent
from bedrock_agentcore.runtime import BedrockAgentCoreApp

app = BedrockAgentCoreApp()

@app.entrypoint
async def invoke(payload=None):
    """Main entrypoint for the agent"""
    query = payload.get("prompt", "Hello") if payload else "Hello"

    agent = Agent(
        system_prompt="You're a helpful assistant.",
        name="BasicAgent"
    )

    response = agent(query)

    return {
        "status": "success",
        "response": response.message['content'][0]['text']
    }

if __name__ == "__main__":
    app.run()
```

### Dockerfile for Agent

```dockerfile
FROM public.ecr.aws/docker/library/python:3.11-slim
WORKDIR /app

# Install dependencies
COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt
RUN pip install aws-opentelemetry-distro>=0.10.1

# Create non-root user (security best practice)
RUN useradd -m -u 1000 bedrock_agentcore
USER bedrock_agentcore

# Expose ports
EXPOSE 8080  # HTTP
EXPOSE 8000  # Health check

# Copy agent code
COPY . .

# Run with OpenTelemetry instrumentation
CMD ["opentelemetry-instrument", "python", "-m", "agent"]
```

### requirements.txt

```
strands-agents
boto3>=1.40.0
botocore>=1.40.0
bedrock-agentcore
```

## Testing Deployed Agents

### Using AWS CLI

```bash
# Get Runtime ARN from stack outputs
RUNTIME_ARN=$(aws cloudformation describe-stacks \
  --stack-name BasicAgentDemo \
  --query 'Stacks[0].Outputs[?OutputKey==`AgentRuntimeArn`].OutputValue' \
  --output text)

# Invoke the agent
aws bedrock-agentcore invoke-agent-runtime \
  --agent-runtime-arn $RUNTIME_ARN \
  --qualifier DEFAULT \
  --payload '{"prompt": "Hello, how are you?"}' \
  response.json

# View response
cat response.json
```

### Using AWS Console

1. Navigate to [Bedrock AgentCore Console](https://console.aws.amazon.com/bedrock-agentcore/)
2. Go to "Runtimes"
3. Find your runtime
4. Click "Test"
5. Enter payload and invoke

### Using Python (boto3)

```python
import boto3
import json

client = boto3.client('bedrock-agentcore', region_name='us-east-1')

response = client.invoke_agent_runtime(
    agentRuntimeArn='arn:aws:bedrock-agentcore:...',
    qualifier='DEFAULT',
    payload=json.dumps({"prompt": "Hello!"})
)

# Handle streaming response
if "text/event-stream" in response.get("contentType", ""):
    for line in response["response"].iter_lines():
        if line:
            print(line.decode("utf-8"))
```

## Cost Breakdown

### Basic Runtime (~$7-13/month)

- AgentCore Runtime: ~$5-10
- ECR Repository: ~$0.10
- CodeBuild: ~$1-2
- Lambda: ~$0.01
- CloudWatch Logs: ~$0.50
- Bedrock usage: Variable (pay per token)

### Multi-Agent Runtime (~$13-25/month)

- 2x AgentCore Runtimes: ~$10-20
- 2x ECR Repositories: ~$0.20
- CodeBuild: ~$2-4
- Lambda: ~$0.01
- CloudWatch Logs: ~$1.00
- Bedrock usage: Variable

### Cost Optimization Tips

1. **Delete when not in use**: `cdk destroy` removes all resources
2. **Monitor usage**: Set up CloudWatch billing alarms
3. **Choose efficient models**: Select appropriate Bedrock models
4. **Use spot instances**: For CodeBuild if applicable
5. **Optimize Docker images**: Smaller images = faster builds = lower costs

## Security Best Practices

### 1. Least Privilege IAM Roles

Only grant permissions that are actually needed:

```python
# Good: Specific resource ARNs
iam.PolicyStatement(
    actions=["ecr:BatchGetImage"],
    resources=[ecr_repository.repository_arn]
)

# Avoid: Wildcard resources when possible
iam.PolicyStatement(
    actions=["ecr:*"],
    resources=["*"]
)
```

### 2. Non-Root Container User

Always run containers as non-root:

```dockerfile
RUN useradd -m -u 1000 bedrock_agentcore
USER bedrock_agentcore
```

### 3. Image Scanning

Enable ECR image scanning:

```python
ecr.Repository(
    image_scan_on_push=True
)
```

### 4. Network Isolation

Use PRIVATE network mode when possible:

```python
network_configuration={
    "network_mode": "PRIVATE"
}
```

### 5. Secrets Management

Use AWS Secrets Manager or Parameter Store for sensitive data:

```python
from aws_cdk import aws_secretsmanager as secretsmanager

secret = secretsmanager.Secret(self, "ApiKey")

# Grant read access to agent role
secret.grant_read(agent_execution_role)

# Reference in environment variables
environment_variables={
    "API_KEY_SECRET_ARN": secret.secret_arn
}
```

## Troubleshooting

### CDK Bootstrap Required

```bash
cdk bootstrap aws://ACCOUNT-NUMBER/REGION
```

### Permission Issues

Ensure your IAM user/role has:

- CloudFormation permissions
- IAM role creation permissions
- ECR permissions
- Lambda permissions
- BedrockAgentCore permissions

### Build Failures

Check CodeBuild logs:

1. Go to CodeBuild console
2. Find build project
3. Check build history and logs

### Runtime Not Starting

1. Check CloudWatch logs for the runtime
2. Verify Docker image was built successfully
3. Ensure IAM permissions are correct
4. Check network configuration

### Agent Communication Issues (Multi-Agent)

1. Verify IAM permissions for `bedrock-agentcore:InvokeAgentRuntime`
2. Check that Agent 2 runtime is running
3. Verify Agent 2 ARN is correctly passed as environment variable
4. Check CloudWatch logs for both agents

## Advanced Patterns

### 1. CI/CD Integration

Integrate with GitHub Actions or CodePipeline:

```yaml
# .github/workflows/deploy.yml
name: Deploy Agent Core
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
      - uses: actions/setup-node@v2

      - name: Install CDK
        run: npm install -g aws-cdk

      - name: Install dependencies
        run: pip install -r requirements.txt

      - name: Deploy
        run: cdk deploy --require-approval never
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

### 2. Multi-Environment Deployment

Use CDK context for different environments:

```python
# app.py
import aws_cdk as cdk
from basic_runtime_stack import BasicRuntimeStack

app = cdk.App()

# Get environment from context
env_name = app.node.try_get_context("env") or "dev"

BasicRuntimeStack(
    app,
    f"BasicAgent-{env_name}",
    env=cdk.Environment(
        account=os.environ["CDK_DEFAULT_ACCOUNT"],
        region=os.environ["CDK_DEFAULT_REGION"]
    )
)

app.synth()
```

Deploy to different environments:

```bash
cdk deploy -c env=dev
cdk deploy -c env=staging
cdk deploy -c env=prod
```

### 3. Custom Docker Build Process

For more complex builds, use CodeBuild with custom buildspec:

```python
build_spec=codebuild.BuildSpec.from_object({
    "version": "0.2",
    "phases": {
        "install": {
            "runtime-versions": {
                "python": "3.11"
            }
        },
        "pre_build": {
            "commands": [
                "echo Installing dependencies...",
                "pip install -r requirements.txt",
                "python -m pytest tests/",  # Run tests
                "aws ecr get-login-password | docker login ..."
            ]
        },
        "build": {
            "commands": [
                "docker build --build-arg VERSION=$IMAGE_TAG -t $IMAGE_REPO_NAME:$IMAGE_TAG .",
                "docker tag ..."
            ]
        },
        "post_build": {
            "commands": [
                "docker push ...",
                "echo Build completed successfully"
            ]
        }
    }
})
```

## Summary

Infrastructure as Code for Agent Core provides:

✅ **Consistent deployments** across environments
✅ **Version control** for infrastructure
✅ **Automated provisioning** with minimal manual steps
✅ **Best practices** built-in (security, monitoring)
✅ **Reusable patterns** for common architectures
✅ **Easy cleanup** with single command

**Recommended Approach**:

- Use **CDK** for Python-based projects (cleaner, more flexible)
- Use **CloudFormation** for pure AWS deployments
- Use **Terraform** for multi-cloud scenarios

All examples include:

- Automated ARM64 Docker builds
- Proper IAM roles with least privilege
- CloudWatch logging and monitoring
- OpenTelemetry instrumentation
- Security best practices

## Related Documentation

- [Agent Core Deployment Workflow](.kiro/notes/agent-core-deployment-workflow.md)
- [Agent Core CloudWatch Observability](.kiro/notes/agent-core-cloudwatch-observability.md)
- [Agent Core Understanding](.kiro/notes/agent-core-understanding.md)
