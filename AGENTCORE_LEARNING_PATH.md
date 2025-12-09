# Agent Core Learning Path: News Aggregator

## 🎯 Project Goal

Build a news aggregator agent that collects tech, AI, and world news and presents them to users.

**Progressive Complexity**:

1. ✅ Phase 1: Simple local agent (fetch & display news)
2. ✅ Phase 2: Deploy to Agent Core Runtime
3. 🔜 Phase 3: Add Cognito authentication
4. 🔜 Phase 4: Add short-term memory
5. 🔜 Phase 5: Add long-term memory

---

## Phase 1: Simple Local Agent (START HERE)

### Goal

Create a working Strands agent locally that fetches news from APIs and answers questions.

### What You'll Learn

- Basic Strands agent structure
- Using `@tool` decorator for custom functions
- Fetching data from public APIs
- Running agents locally

### Prerequisites

```bash
# Python 3.12 (you already have this)
python3.12 --version

# Virtual environment (you already have this)
source venv/bin/activate

# Install dependencies
pip install strands-agents requests boto3
```

### Step 1.1: Create Basic News Fetcher

Create `agents/news_fetcher_agent.py`:

```python
from strands import Agent, tool
import requests
from datetime import datetime

@tool
def fetch_hackernews() -> str:
    """Fetch top tech stories from HackerNews"""
    try:
        response = requests.get(
            "https://hacker-news.firebaseio.com/v0/topstories.json"
        )
        story_ids = response.json()[:5]  # Get top 5

        stories = []
        for story_id in story_ids:
            story_response = requests.get(
                f"https://hacker-news.firebaseio.com/v0/item/{story_id}.json"
            )
            story = story_response.json()
            stories.append(f"- {story.get('title', 'No title')}")

        return "Top HackerNews Stories:\n" + "\n".join(stories)
    except Exception as e:
        return f"Error fetching HackerNews: {str(e)}"

@tool
def fetch_devto_news() -> str:
    """Fetch latest articles from Dev.to"""
    try:
        response = requests.get(
            "https://dev.to/api/articles?per_page=5"
        )
        articles = response.json()

        stories = []
        for article in articles:
            title = article.get('title', 'No title')
            url = article.get('url', '')
            stories.append(f"- {title}")

        return "Latest Dev.to Articles:\n" + "\n".join(stories)
    except Exception as e:
        return f"Error fetching Dev.to: {str(e)}"

# Create the agent
agent = Agent(
    tools=[fetch_hackernews, fetch_devto_news],
    system_prompt="""You are a helpful news assistant.
    You can fetch the latest tech and AI news from HackerNews and Dev.to.
    When users ask for news, use the appropriate tools to fetch and present the information.""",
    name="NewsAgent"
)

if __name__ == "__main__":
    # Test the agent
    print("News Agent Ready!")
    print("\nFetching latest news...")

    response = agent("What are the latest tech news?")
    print("\n" + response.message['content'][0]['text'])
```

### Step 1.2: Test Locally

```bash
python agents/news_fetcher_agent.py
```

**Expected Output**: Agent fetches and displays news from both sources.

### Step 1.3: Make It Interactive

Create `agents/interactive_news_agent.py`:

```python
from strands import Agent, tool
import requests

@tool
def fetch_hackernews() -> str:
    """Fetch top tech stories from HackerNews"""
    try:
        response = requests.get(
            "https://hacker-news.firebaseio.com/v0/topstories.json"
        )
        story_ids = response.json()[:5]

        stories = []
        for story_id in story_ids:
            story_response = requests.get(
                f"https://hacker-news.firebaseio.com/v0/item/{story_id}.json"
            )
            story = story_response.json()
            stories.append(f"- {story.get('title', 'No title')}")

        return "Top HackerNews Stories:\n" + "\n".join(stories)
    except Exception as e:
        return f"Error: {str(e)}"

@tool
def fetch_devto_news() -> str:
    """Fetch latest articles from Dev.to"""
    try:
        response = requests.get("https://dev.to/api/articles?per_page=5")
        articles = response.json()

        stories = []
        for article in articles:
            stories.append(f"- {article.get('title', 'No title')}")

        return "Latest Dev.to Articles:\n" + "\n".join(stories)
    except Exception as e:
        return f"Error: {str(e)}"

# Create agent
agent = Agent(
    tools=[fetch_hackernews, fetch_devto_news],
    system_prompt="""You are a helpful news assistant.
    You can fetch tech and AI news from HackerNews and Dev.to.
    Be concise and friendly.""",
    name="NewsAgent"
)

# Interactive loop
if __name__ == "__main__":
    print("🗞️  News Agent Ready! (type 'quit' to exit)")
    print("Try: 'What are the latest tech news?'\n")

    while True:
        user_input = input("You: ")
        if user_input.lower() in ['quit', 'exit', 'q']:
            print("Goodbye!")
            break

        response = agent(user_input)
        print(f"\nAgent: {response.message['content'][0]['text']}\n")
```

**Test it**:

```bash
python agents/interactive_news_agent.py
```

---

## Phase 2: Deploy to Agent Core Runtime

### Goal

Deploy your agent to AWS Agent Core so it runs in the cloud.

### What You'll Learn

- Converting local agent to Agent Core format
- Using `BedrockAgentCoreApp` and `@app.entrypoint`
- Creating Dockerfile for containerization
- Deploying with CDK

### Step 2.1: Convert Agent to Agent Core Format

Create `agentcore-agents/news_agent.py`:

```python
from strands import Agent, tool
import requests
from bedrock_agentcore.runtime import BedrockAgentCoreApp

app = BedrockAgentCoreApp()

@tool
def fetch_hackernews() -> str:
    """Fetch top tech stories from HackerNews"""
    try:
        response = requests.get(
            "https://hacker-news.firebaseio.com/v0/topstories.json",
            timeout=5
        )
        story_ids = response.json()[:5]

        stories = []
        for story_id in story_ids:
            story_response = requests.get(
                f"https://hacker-news.firebaseio.com/v0/item/{story_id}.json",
                timeout=5
            )
            story = story_response.json()
            stories.append(f"- {story.get('title', 'No title')}")

        return "Top HackerNews Stories:\n" + "\n".join(stories)
    except Exception as e:
        return f"Error fetching HackerNews: {str(e)}"

@tool
def fetch_devto_news() -> str:
    """Fetch latest articles from Dev.to"""
    try:
        response = requests.get(
            "https://dev.to/api/articles?per_page=5",
            timeout=5
        )
        articles = response.json()

        stories = []
        for article in articles:
            stories.append(f"- {article.get('title', 'No title')}")

        return "Latest Dev.to Articles:\n" + "\n".join(stories)
    except Exception as e:
        return f"Error fetching Dev.to: {str(e)}"

def create_news_agent() -> Agent:
    """Create the news agent with tools"""
    return Agent(
        tools=[fetch_hackernews, fetch_devto_news],
        system_prompt="""You are a helpful news assistant.
        You can fetch the latest tech and AI news from HackerNews and Dev.to.
        When users ask for news, use the appropriate tools to fetch and present the information.
        Be concise and friendly.""",
        name="NewsAgent"
    )

@app.entrypoint
def invoke(payload=None):
    """
    Main entrypoint for Agent Core Runtime.
    This function is called when the agent is invoked.
    """
    try:
        # Get user query from payload
        query = payload.get("prompt", "What are the latest tech news?") if payload else "What are the latest tech news?"

        print(f"Received query: {query}")

        # Create and invoke agent
        agent = create_news_agent()
        response = agent(query)

        # Return response
        return {
            "status": "success",
            "response": response.message['content'][0]['text']
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            "status": "error",
            "error": str(e)
        }

if __name__ == "__main__":
    app.run()
```

### Step 2.2: Create requirements.txt

Create `agentcore-agents/requirements.txt`:

```
strands-agents
boto3>=1.40.0
botocore>=1.40.0
bedrock-agentcore
requests
```

### Step 2.3: Create Dockerfile

Create `agentcore-agents/Dockerfile`:

```dockerfile
FROM public.ecr.aws/docker/library/python:3.11-slim
WORKDIR /app

# Install dependencies
COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir aws-opentelemetry-distro>=0.10.1

# Create non-root user for security
RUN useradd -m -u 1000 bedrock_agentcore
USER bedrock_agentcore

# Expose ports
EXPOSE 8080
EXPOSE 8000

# Copy agent code
COPY news_agent.py .

# Run with OpenTelemetry instrumentation for observability
CMD ["opentelemetry-instrument", "python", "-m", "news_agent"]
```

### Step 2.4: Deploy Using CDK

Create `deployment/news_agent_stack.py`:

```python
from aws_cdk import (
    Stack,
    aws_ecr as ecr,
    aws_iam as iam,
    aws_bedrockagentcore as bedrockagentcore,
    CfnOutput,
    RemovalPolicy,
    DockerImage
)
from aws_cdk.aws_ecr_assets import DockerImageAsset, Platform
from constructs import Construct

class NewsAgentStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # Build and push Docker image to ECR
        docker_image = DockerImageAsset(
            self, "NewsAgentImage",
            directory="../agentcore-agents",
            platform=Platform.LINUX_ARM64  # Agent Core requires ARM64
        )

        # IAM Role for Agent Execution
        agent_role = iam.Role(
            self, "NewsAgentRole",
            assumed_by=iam.ServicePrincipal("bedrock-agentcore.amazonaws.com"),
            managed_policies=[
                iam.ManagedPolicy.from_aws_managed_policy_name(
                    "BedrockAgentCoreFullAccess"
                )
            ],
            inline_policies={
                "NewsAgentPolicy": iam.PolicyDocument(
                    statements=[
                        # Bedrock model access
                        iam.PolicyStatement(
                            effect=iam.Effect.ALLOW,
                            actions=[
                                "bedrock:InvokeModel",
                                "bedrock:InvokeModelWithResponseStream"
                            ],
                            resources=["*"]
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
                        )
                    ]
                )
            }
        )

        # Create Agent Core Runtime
        news_agent_runtime = bedrockagentcore.CfnRuntime(
            self, "NewsAgentRuntime",
            agent_runtime_name=f"{self.stack_name}_NewsAgent",
            agent_runtime_artifact=bedrockagentcore.CfnRuntime.AgentRuntimeArtifactProperty(
                container_configuration=bedrockagentcore.CfnRuntime.ContainerConfigurationProperty(
                    container_uri=docker_image.image_uri
                )
            ),
            network_configuration=bedrockagentcore.CfnRuntime.NetworkConfigurationProperty(
                network_mode="PUBLIC"
            ),
            protocol_configuration="HTTP",
            role_arn=agent_role.role_arn,
            description="News aggregator agent for tech, AI, and world news",
            environment_variables={
                "AWS_DEFAULT_REGION": self.region
            }
        )

        # Outputs
        CfnOutput(
            self, "AgentRuntimeId",
            description="News Agent Runtime ID",
            value=news_agent_runtime.attr_agent_runtime_id
        )

        CfnOutput(
            self, "AgentRuntimeArn",
            description="News Agent Runtime ARN",
            value=news_agent_runtime.attr_agent_runtime_arn
        )
```

Create `deployment/app.py`:

```python
#!/usr/bin/env python3
import aws_cdk as cdk
from news_agent_stack import NewsAgentStack

app = cdk.App()
NewsAgentStack(app, "NewsAgentDemo")

app.synth()
```

Create `deployment/requirements.txt`:

```
aws-cdk-lib>=2.220.0
constructs>=10.0.0
```

### Step 2.5: Deploy to AWS

```bash
cd deployment

# Install CDK dependencies
pip install -r requirements.txt

# Bootstrap CDK (first time only)
cdk bootstrap

# Deploy
cdk deploy
```

**Deployment takes ~10-15 minutes**. CDK will:

1. Build your Docker image (ARM64)
2. Push to ECR
3. Create IAM roles
4. Create Agent Core Runtime
5. Configure networking and logging

### Step 2.6: Test Your Deployed Agent

```bash
# Get Runtime ARN from outputs
RUNTIME_ARN=$(aws cloudformation describe-stacks \
  --stack-name NewsAgentDemo \
  --query 'Stacks[0].Outputs[?OutputKey==`AgentRuntimeArn`].OutputValue' \
  --output text)

# Invoke the agent
aws bedrock-agentcore invoke-agent-runtime \
  --agent-runtime-arn $RUNTIME_ARN \
  --qualifier DEFAULT \
  --payload '{"prompt": "What are the latest tech news?"}' \
  response.json

# View response
cat response.json
```

**🎉 Congratulations!** Your agent is now running in the cloud!

---

## Phase 3: Add Cognito Authentication (NEXT STEP)

### Goal

Add user authentication so each user has their own session.

### What You'll Add

- Amazon Cognito User Pool
- JWT token validation
- User-specific context

### Architecture

```
User → Cognito (Login) → Get JWT Token → Invoke Agent with Token → Agent validates token
```

### Step 3.1: Update CDK Stack with Cognito

Add to `deployment/news_agent_stack.py`:

```python
from aws_cdk import aws_cognito as cognito

# Create Cognito User Pool
user_pool = cognito.UserPool(
    self, "NewsAgentUserPool",
    user_pool_name=f"{self.stack_name}-users",
    self_sign_up_enabled=True,
    sign_in_aliases=cognito.SignInAliases(
        email=True,
        username=True
    ),
    auto_verify=cognito.AutoVerifiedAttrs(email=True),
    password_policy=cognito.PasswordPolicy(
        min_length=8,
        require_lowercase=True,
        require_uppercase=True,
        require_digits=True
    )
)

# Create App Client
app_client = user_pool.add_client(
    "NewsAgentAppClient",
    auth_flows=cognito.AuthFlow(
        user_password=True,
        user_srp=True
    ),
    generate_secret=False
)

# Output Cognito details
CfnOutput(
    self, "UserPoolId",
    value=user_pool.user_pool_id
)

CfnOutput(
    self, "AppClientId",
    value=app_client.user_pool_client_id
)
```

### Step 3.2: Update Agent to Use Cognito Identity

Update `agentcore-agents/news_agent.py`:

```python
import os
import boto3
from bedrock_agentcore.runtime import BedrockAgentCoreApp

app = BedrockAgentCoreApp()

def get_user_id_from_context():
    """Extract user ID from Agent Core context"""
    # Agent Core provides user identity in context
    # This is automatically populated when using Cognito
    return os.getenv("BEDROCK_AGENTCORE_USER_ID", "anonymous")

@app.entrypoint
def invoke(payload=None):
    """Main entrypoint with user context"""
    try:
        # Get user identity
        user_id = get_user_id_from_context()
        query = payload.get("prompt", "What are the latest tech news?") if payload else "What are the latest tech news?"

        print(f"User {user_id} asked: {query}")

        # Create and invoke agent
        agent = create_news_agent()
        response = agent(query)

        return {
            "status": "success",
            "user_id": user_id,
            "response": response.message['content'][0]['text']
        }

    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }
```

### Step 3.3: Test with Authentication

```bash
# Create a test user
aws cognito-idp sign-up \
  --client-id YOUR_APP_CLIENT_ID \
  --username testuser \
  --password TestPass123! \
  --user-attributes Name=email,Value=test@example.com

# Confirm user (for testing)
aws cognito-idp admin-confirm-sign-up \
  --user-pool-id YOUR_USER_POOL_ID \
  --username testuser

# Get JWT token
aws cognito-idp initiate-auth \
  --client-id YOUR_APP_CLIENT_ID \
  --auth-flow USER_PASSWORD_AUTH \
  --auth-parameters USERNAME=testuser,PASSWORD=TestPass123!

# Use token to invoke agent
aws bedrock-agentcore invoke-agent-runtime \
  --agent-runtime-arn $RUNTIME_ARN \
  --qualifier DEFAULT \
  --payload '{"prompt": "What are the latest tech news?"}' \
  --authentication-token "YOUR_JWT_TOKEN" \
  response.json
```

---

## Phase 4: Add Short-Term Memory

### Goal

Remember conversation context within a session (last 5-10 messages).

### What You'll Add

- Session management
- In-memory conversation history
- Context-aware responses

### Step 4.1: Update Agent with Memory

Update `agentcore-agents/news_agent.py`:

```python
from collections import defaultdict
from datetime import datetime, timedelta

# In-memory session storage (short-term)
# In production, use Redis or DynamoDB
session_memory = defaultdict(list)
SESSION_TIMEOUT = timedelta(minutes=30)

def add_to_memory(user_id: str, role: str, content: str):
    """Add message to short-term memory"""
    session_memory[user_id].append({
        "role": role,
        "content": content,
        "timestamp": datetime.now()
    })

    # Keep only last 10 messages
    if len(session_memory[user_id]) > 10:
        session_memory[user_id] = session_memory[user_id][-10:]

def get_conversation_history(user_id: str) -> str:
    """Get recent conversation history"""
    messages = session_memory.get(user_id, [])

    # Filter out old messages
    cutoff = datetime.now() - SESSION_TIMEOUT
    recent_messages = [
        msg for msg in messages
        if msg["timestamp"] > cutoff
    ]

    if not recent_messages:
        return ""

    history = "Recent conversation:\n"
    for msg in recent_messages[-5:]:  # Last 5 messages
        history += f"{msg['role']}: {msg['content']}\n"

    return history

@app.entrypoint
def invoke(payload=None):
    """Main entrypoint with short-term memory"""
    try:
        user_id = get_user_id_from_context()
        query = payload.get("prompt", "What are the latest tech news?") if payload else "What are the latest tech news?"

        # Get conversation history
        history = get_conversation_history(user_id)

        # Add history to system prompt if exists
        agent = create_news_agent()
        if history:
            enhanced_prompt = f"{history}\n\nCurrent question: {query}"
        else:
            enhanced_prompt = query

        # Invoke agent
        response = agent(enhanced_prompt)
        response_text = response.message['content'][0]['text']

        # Store in memory
        add_to_memory(user_id, "user", query)
        add_to_memory(user_id, "assistant", response_text)

        return {
            "status": "success",
            "user_id": user_id,
            "response": response_text
        }

    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }
```

**Note**: This in-memory approach works for single-container deployments. For production with multiple containers, use Redis or DynamoDB.

---

## Phase 5: Add Long-Term Memory (DynamoDB)

### Goal

Store user preferences and conversation history permanently.

### What You'll Add

- DynamoDB table for user data
- Preference storage (favorite topics, news sources)
- Historical conversation storage

### Step 5.1: Add DynamoDB to CDK Stack

Update `deployment/news_agent_stack.py`:

```python
from aws_cdk import aws_dynamodb as dynamodb

# Create DynamoDB table for user preferences
user_prefs_table = dynamodb.Table(
    self, "UserPreferencesTable",
    table_name=f"{self.stack_name}-user-preferences",
    partition_key=dynamodb.Attribute(
        name="user_id",
        type=dynamodb.AttributeType.STRING
    ),
    billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
    removal_policy=RemovalPolicy.DESTROY
)

# Create DynamoDB table for conversation history
conversation_table = dynamodb.Table(
    self, "ConversationHistoryTable",
    table_name=f"{self.stack_name}-conversations",
    partition_key=dynamodb.Attribute(
        name="user_id",
        type=dynamodb.AttributeType.STRING
    ),
    sort_key=dynamodb.Attribute(
        name="timestamp",
        type=dynamodb.AttributeType.STRING
    ),
    billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
    removal_policy=RemovalPolicy.DESTROY,
    time_to_live_attribute="ttl"  # Auto-delete old conversations
)

# Grant agent access to DynamoDB
user_prefs_table.grant_read_write_data(agent_role)
conversation_table.grant_read_write_data(agent_role)

# Pass table names to agent
news_agent_runtime = bedrockagentcore.CfnRuntime(
    # ... existing config ...
    environment_variables={
        "AWS_DEFAULT_REGION": self.region,
        "USER_PREFS_TABLE": user_prefs_table.table_name,
        "CONVERSATION_TABLE": conversation_table.table_name
    }
)

# Outputs
CfnOutput(
    self, "UserPrefsTableName",
    value=user_prefs_table.table_name
)

CfnOutput(
    self, "ConversationTableName",
    value=conversation_table.table_name
)
```

### Step 5.2: Update Agent with DynamoDB Memory

Update `agentcore-agents/news_agent.py`:

```python
import boto3
from datetime import datetime, timedelta
import json
import os

# DynamoDB clients
dynamodb = boto3.resource('dynamodb')
user_prefs_table_name = os.getenv('USER_PREFS_TABLE')
conversation_table_name = os.getenv('CONVERSATION_TABLE')

def get_user_preferences(user_id: str) -> dict:
    """Get user preferences from DynamoDB"""
    try:
        table = dynamodb.Table(user_prefs_table_name)
        response = table.get_item(Key={'user_id': user_id})
        return response.get('Item', {})
    except Exception as e:
        print(f"Error getting preferences: {e}")
        return {}

def save_user_preference(user_id: str, preference_key: str, preference_value: str):
    """Save user preference to DynamoDB"""
    try:
        table = dynamodb.Table(user_prefs_table_name)
        table.update_item(
            Key={'user_id': user_id},
            UpdateExpression=f'SET {preference_key} = :val',
            ExpressionAttributeValues={':val': preference_value}
        )
    except Exception as e:
        print(f"Error saving preference: {e}")

def save_conversation(user_id: str, role: str, content: str):
    """Save conversation to DynamoDB"""
    try:
        table = dynamodb.Table(conversation_table_name)
        timestamp = datetime.now().isoformat()
        ttl = int((datetime.now() + timedelta(days=30)).timestamp())  # Keep for 30 days

        table.put_item(
            Item={
                'user_id': user_id,
                'timestamp': timestamp,
                'role': role,
                'content': content,
                'ttl': ttl
            }
        )
    except Exception as e:
        print(f"Error saving conversation: {e}")

def get_recent_conversations(user_id: str, limit: int = 5) -> list:
    """Get recent conversations from DynamoDB"""
    try:
        table = dynamodb.Table(conversation_table_name)
        response = table.query(
            KeyConditionExpression='user_id = :uid',
            ExpressionAttributeValues={':uid': user_id},
            ScanIndexForward=False,  # Most recent first
            Limit=limit * 2  # Get more to account for user+assistant pairs
        )
        return response.get('Items', [])
    except Exception as e:
        print(f"Error getting conversations: {e}")
        return []

@tool
def save_news_preference(topic: str) -> str:
    """
    Save user's preferred news topic.
    Args:
        topic: The news topic to save (e.g., 'AI', 'tech', 'world')
    """
    user_id = get_user_id_from_context()
    save_user_preference(user_id, 'favorite_topic', topic)
    return f"Saved your preference for {topic} news!"

def create_news_agent_with_memory(user_id: str) -> Agent:
    """Create agent with user preferences"""
    # Get user preferences
    prefs = get_user_preferences(user_id)
    favorite_topic = prefs.get('favorite_topic', 'tech')

    # Get recent conversations
    recent_convos = get_recent_conversations(user_id)
    history = ""
    if recent_convos:
        history = "Recent conversation history:\n"
        for convo in reversed(recent_convos[-4:]):  # Last 2 exchanges
            history += f"{convo['role']}: {convo['content']}\n"

    # Enhanced system prompt with preferences
    system_prompt = f"""You are a helpful news assistant.
    You can fetch the latest tech and AI news from HackerNews and Dev.to.

    User preferences:
    - Favorite topic: {favorite_topic}

    {history}

    When users ask for news, prioritize their favorite topics.
    Be concise and friendly."""

    return Agent(
        tools=[fetch_hackernews, fetch_devto_news, save_news_preference],
        system_prompt=system_prompt,
        name="NewsAgent"
    )

@app.entrypoint
def invoke(payload=None):
    """Main entrypoint with long-term memory"""
    try:
        user_id = get_user_id_from_context()
        query = payload.get("prompt", "What are the latest tech news?") if payload else "What are the latest tech news?"

        print(f"User {user_id} asked: {query}")

        # Create agent with user's memory and preferences
        agent = create_news_agent_with_memory(user_id)
        response = agent(query)
        response_text = response.message['content'][0]['text']

        # Save conversation to DynamoDB
        save_conversation(user_id, "user", query)
        save_conversation(user_id, "assistant", response_text)

        return {
            "status": "success",
            "user_id": user_id,
            "response": response_text
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            "status": "error",
            "error": str(e)
        }
```

### Step 5.3: Test Memory Features

```bash
# First conversation
aws bedrock-agentcore invoke-agent-runtime \
  --agent-runtime-arn $RUNTIME_ARN \
  --qualifier DEFAULT \
  --payload '{"prompt": "Save AI as my favorite topic"}' \
  response.json

# Second conversation (agent remembers preference)
aws bedrock-agentcore invoke-agent-runtime \
  --agent-runtime-arn $RUNTIME_ARN \
  --qualifier DEFAULT \
  --payload '{"prompt": "Show me the latest news"}' \
  response.json

# Agent will prioritize AI news based on saved preference!
```

---

## 📚 Complete Architecture (Final State)

```
┌─────────────────────────────────────────────────────────────┐
│                         User                                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   Amazon Cognito                             │
│              (Authentication & JWT)                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Agent Core Runtime                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           News Agent (Strands)                       │   │
│  │  - fetch_hackernews()                                │   │
│  │  - fetch_devto_news()                                │   │
│  │  - save_news_preference()                            │   │
│  └──────────────────────────────────────────────────────┘   │
└────────┬──────────────────┬──────────────────┬──────────────┘
         │                  │                  │
         ▼                  ▼                  ▼
┌────────────────┐  ┌──────────────┐  ┌──────────────────┐
│  Amazon        │  │  DynamoDB    │  │  DynamoDB        │
│  Bedrock       │  │  User Prefs  │  │  Conversations   │
│  (Nova Pro)    │  │              │  │  (30 day TTL)    │
└────────────────┘  └──────────────┘  └──────────────────┘
```

---

## 🎯 Learning Checklist

### Phase 1: Local Development ✅

- [ ] Create basic Strands agent
- [ ] Add custom tools with `@tool` decorator
- [ ] Fetch data from public APIs
- [ ] Test agent locally
- [ ] Make agent interactive

### Phase 2: Deploy to Agent Core ✅

- [ ] Convert to `BedrockAgentCoreApp` format
- [ ] Create Dockerfile
- [ ] Write CDK stack
- [ ] Deploy to AWS
- [ ] Test deployed agent

### Phase 3: Add Authentication 🔜

- [ ] Add Cognito User Pool
- [ ] Create app client
- [ ] Update agent to use user context
- [ ] Test with JWT tokens

### Phase 4: Short-Term Memory 🔜

- [ ] Implement in-memory session storage
- [ ] Add conversation history
- [ ] Test context-aware responses

### Phase 5: Long-Term Memory 🔜

- [ ] Create DynamoDB tables
- [ ] Store user preferences
- [ ] Store conversation history
- [ ] Test personalized responses

---

## 🚀 Quick Start Commands

```bash
# Phase 1: Local testing
python agents/interactive_news_agent.py

# Phase 2: Deploy to AWS
cd deployment
cdk deploy

# Phase 3-5: Redeploy with new features
cdk deploy

# Cleanup
cdk destroy
```

---

## 📖 Key Concepts You'll Master

1. **Strands Agents**: Building conversational AI with tools
2. **Agent Core Runtime**: Deploying agents to AWS
3. **Containerization**: Docker for agent deployment
4. **Infrastructure as Code**: CDK for AWS resources
5. **Authentication**: Cognito for user management
6. **Memory Management**: Short-term (in-memory) and long-term (DynamoDB)
7. **Observability**: CloudWatch logs and traces

---

## 🔗 Related Documentation

- [Agent Core Understanding](.kiro/notes/agent-core-understanding.md)
- [Agent Core Deployment](.kiro/notes/agent-core-deployment-workflow.md)
- [Agent Core Memory](.kiro/notes/agent-core-memory.md)
- [Agent Core Security](.kiro/notes/agent-core-cognito-identity-security.md)
- [Infrastructure as Code](.kiro/notes/agent-core-infrastructure-as-code.md)

---

**Ready to start?** Begin with Phase 1 and build your first local news agent! 🎉
