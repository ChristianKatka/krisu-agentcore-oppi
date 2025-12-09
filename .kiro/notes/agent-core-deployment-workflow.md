# Agent Core Deployment Workflow - Complete Guide

## Key Learning from Official Tutorial

This is based on the official AWS tutorial: "Hosting Strands Agents with Amazon Bedrock models in Amazon Bedrock AgentCore Runtime"

## The Complete Deployment Process

### Phase 1: Local Development & Testing

**Architecture:**

```
Your Code → Strands Agent → Bedrock Model → Response
```

**Code Structure (Local):**

```python
from strands import Agent, tool
from strands.models import BedrockModel

@tool
def weather():
    """Get weather"""
    return "sunny"

model = BedrockModel(model_id="global.anthropic.claude-haiku-4-5-20251001-v1:0")
agent = Agent(
    model=model,
    tools=[weather],
    system_prompt="You're a helpful assistant."
)

def strands_agent_bedrock(payload):
    user_input = payload.get("prompt")
    response = agent(user_input)
    return response.message['content'][0]['text']

if __name__ == "__main__":
    # Test locally
    response = strands_agent_bedrock({"prompt": "What is the weather?"})
```

**Test locally:**

```bash
python strands_claude.py '{"prompt": "What is the weather now?"}'
```

### Phase 2: Prepare for Agent Core Deployment

**Add 4 Required Changes:**

1. Import Agent Core App
2. Initialize the App
3. Decorate entrypoint function
4. Let Agent Core control execution

**Code Structure (Agent Core Ready):**

```python
from strands import Agent, tool
from strands.models import BedrockModel
from bedrock_agentcore.runtime import BedrockAgentCoreApp  # 1. Import

app = BedrockAgentCoreApp()  # 2. Initialize

@tool
def weather():
    """Get weather"""
    return "sunny"

model = BedrockModel(model_id="global.anthropic.claude-haiku-4-5-20251001-v1:0")
agent = Agent(
    model=model,
    tools=[weather],
    system_prompt="You're a helpful assistant."
)

@app.entrypoint  # 3. Decorate
def strands_agent_bedrock(payload):
    user_input = payload.get("prompt")
    response = agent(user_input)
    return response.message['content'][0]['text']

if __name__ == "__main__":
    app.run()  # 4. Let Agent Core control
```

### Phase 3: What Agent Core Does Behind the Scenes

When you use `BedrockAgentCoreApp`, it automatically:

- Creates an HTTP server on port 8080
- Implements `/invocations` endpoint (for agent processing)
- Implements `/ping` endpoint (for health checks)
- Handles content types and response formats
- Manages error handling per AWS standards

### Phase 4: Deploy Using Starter Toolkit

**Option 1: Using Python SDK (Recommended for learning)**

```python
from bedrock_agentcore_starter_toolkit import Runtime
from boto3.session import Session

boto_session = Session()
region = boto_session.region_name

agentcore_runtime = Runtime()
agent_name = "my_agent"

# Step 1: Configure
response = agentcore_runtime.configure(
    entrypoint="strands_claude.py",
    auto_create_execution_role=True,
    auto_create_ecr=True,
    requirements_file="requirements.txt",
    region=region,
    agent_name=agent_name
)

# Step 2: Launch (creates ECR repo + Agent Core Runtime)
launch_result = agentcore_runtime.launch()

# Step 3: Check status
import time
status_response = agentcore_runtime.status()
status = status_response.endpoint['status']
while status not in ['READY', 'CREATE_FAILED']:
    time.sleep(10)
    status_response = agentcore_runtime.status()
    status = status_response.endpoint['status']
    print(status)

# Step 4: Invoke
invoke_response = agentcore_runtime.invoke({"prompt": "How is the weather?"})
print(invoke_response)
```

**What happens during configure:**

- Generates Dockerfile based on your code
- Prepares deployment configuration

**What happens during launch:**

- Builds Docker container
- Pushes to Amazon ECR
- Creates Agent Core Runtime
- Deploys container to runtime

### Phase 5: Invoke Your Deployed Agent

**Method 1: Using Starter Toolkit**

```python
invoke_response = agentcore_runtime.invoke({"prompt": "What is 2+2?"})
response_text = invoke_response['response'][0]
print(response_text)
```

**Method 2: Using boto3 (Production)**

```python
import boto3
import json

agentcore_client = boto3.client('bedrock-agentcore', region_name='us-east-1')

response = agentcore_client.invoke_agent_runtime(
    agentRuntimeArn=agent_arn,
    qualifier="DEFAULT",
    payload=json.dumps({"prompt": "What is 2+2?"})
)

# Handle streaming response
if "text/event-stream" in response.get("contentType", ""):
    for line in response["response"].iter_lines():
        if line:
            print(line.decode("utf-8"))
```

## Deployment Architecture

```
Local Development:
┌─────────────────┐
│  Your Python    │
│  strands_agent  │
│  (local test)   │
└─────────────────┘

Agent Core Deployment:
┌──────────────────────────────────────────┐
│  Configure                               │
│  ├─ Generate Dockerfile                  │
│  ├─ Create execution role                │
│  └─ Prepare ECR repository               │
└──────────────────────────────────────────┘
                  ↓
┌──────────────────────────────────────────┐
│  Launch                                  │
│  ├─ Build Docker container               │
│  ├─ Push to ECR                          │
│  ├─ Create Agent Core Runtime            │
│  └─ Deploy container                     │
└──────────────────────────────────────────┘
                  ↓
┌──────────────────────────────────────────┐
│  Agent Core Runtime (AWS Managed)        │
│  ├─ HTTP Server (port 8080)              │
│  ├─ /invocations endpoint                │
│  ├─ /ping health check                   │
│  └─ Your agent code running              │
└──────────────────────────────────────────┘
                  ↓
┌──────────────────────────────────────────┐
│  Invoke                                  │
│  ├─ Via starter toolkit                  │
│  ├─ Via boto3                            │
│  └─ Via AWS SDK (any language)           │
└──────────────────────────────────────────┘
```

## Required Files

```
your-project/
├── strands_claude.py          # Your agent code
├── requirements.txt           # Dependencies
│   ├── strands-agents
│   ├── strands-tools
│   ├── bedrock-agentcore
│   └── boto3
└── bedrock_agentcore.yaml     # Generated by configure
```

## Key Differences: Local vs Agent Core

| Aspect      | Local Development           | Agent Core Deployment   |
| ----------- | --------------------------- | ----------------------- |
| Execution   | `python agent.py`           | AWS managed runtime     |
| Entry point | `if __name__ == "__main__"` | `@app.entrypoint`       |
| Server      | None                        | HTTP server (port 8080) |
| Scaling     | Manual                      | AWS auto-scaling        |
| Invocation  | Direct function call        | HTTP API / boto3        |
| Deployment  | N/A                         | Docker container in ECR |

## Cleanup

```python
import boto3

agentcore_control_client = boto3.client('bedrock-agentcore-control', region_name='us-east-1')
ecr_client = boto3.client('ecr', region_name='us-east-1')

# Delete runtime
agentcore_control_client.delete_agent_runtime(
    agentRuntimeId=launch_result.agent_id
)

# Delete ECR repository
ecr_client.delete_repository(
    repositoryName=launch_result.ecr_uri.split('/')[1],
    force=True
)
```

## Important Notes

- **Strands IS supported** in Agent Core (this tutorial proves it!)
- You CAN use Strands agents with Bedrock models
- The `bedrock-agentcore-starter-toolkit` simplifies deployment
- Agent Core handles containerization automatically
- You can use boto3 for production invocations
- The runtime creates HTTP endpoints automatically
- Health checks are built-in via `/ping`

## Our Project Next Steps

1. ✅ We have Strands agents working locally
2. ⏳ Add `@app.entrypoint` decorator to our agents
3. ⏳ Use starter toolkit to configure
4. ⏳ Launch to Agent Core Runtime
5. ⏳ Test invocations
6. ⏳ Add Gateway for API access
7. ⏳ Add Cognito for authentication
