# Agent Core Memory + Cognito Identity - Security & Isolation

## CRITICAL CONCEPT: Memory Isolation with Federated Identity

This is THE most important security pattern for multi-user Agent Core applications. It ensures each user's conversation history is completely isolated using AWS IAM and Cognito federated identities.

## The Problem

Without proper isolation:

- User A could access User B's conversation history
- Privacy violations and data leakage
- Compliance issues (GDPR, HIPAA, etc.)

## The Solution: Cognito Federated Identity

Use Cognito Identity Pools to generate temporary AWS credentials that are scoped to individual users. These credentials enforce IAM-level access control on memory operations.

## Architecture

```
User Login (Cognito User Pool)
    ↓
Get ID Token
    ↓
Exchange for Federated Credentials (Cognito Identity Pool)
    ↓
Temporary AWS Credentials (scoped to user's identity_id)
    ↓
Agent uses these credentials for Memory operations
    ↓
IAM enforces: User can only access their own memory
```

## Complete Implementation

### 1. Create Cognito User Pool

```python
import boto3

cognito_client = boto3.client('cognito-idp', region_name='us-east-1')

# Create User Pool
user_pool = cognito_client.create_user_pool(
    PoolName='AgentCoreUserPool',
    Policies={
        'PasswordPolicy': {
            'MinimumLength': 8,
            'RequireUppercase': False,
            'RequireLowercase': False,
            'RequireNumbers': False,
            'RequireSymbols': False
        }
    }
)

user_pool_id = user_pool['UserPool']['Id']

# Create App Client
app_client = cognito_client.create_user_pool_client(
    UserPoolId=user_pool_id,
    ClientName='AgentCoreAppClient',
    ExplicitAuthFlows=['ADMIN_NO_SRP_AUTH']
)

client_id = app_client['UserPoolClient']['ClientId']
```

### 2. Create Cognito Identity Pool

```python
identity_client = boto3.client('cognito-identity', region_name='us-east-1')

# Create Identity Pool
identity_pool = identity_client.create_identity_pool(
    IdentityPoolName='AgentCoreIdentityPool',
    AllowUnauthenticatedIdentities=False,
    CognitoIdentityProviders=[{
        'ProviderName': f'cognito-idp.us-east-1.amazonaws.com/{user_pool_id}',
        'ClientId': client_id
    }]
)

identity_pool_id = identity_pool['IdentityPoolId']
```

### 3. Create IAM Role for Authenticated Users

This role allows users to access ONLY their own memory:

```python
import json

iam_client = boto3.client('iam')

# Trust policy for Cognito Identity Pool
trust_policy = {
    "Version": "2012-10-17",
    "Statement": [{
        "Effect": "Allow",
        "Principal": {
            "Federated": "cognito-identity.amazonaws.com"
        },
        "Action": "sts:AssumeRoleWithWebIdentity",
        "Condition": {
            "StringEquals": {
                "cognito-identity.amazonaws.com:aud": identity_pool_id
            },
            "ForAnyValue:StringLike": {
                "cognito-identity.amazonaws.com:amr": "authenticated"
            }
        }
    }]
}

# Memory access policy - CRITICAL: Uses ${cognito-identity.amazonaws.com:sub}
memory_policy = {
    "Version": "2012-10-17",
    "Statement": [{
        "Effect": "Allow",
        "Action": [
            "bedrock-agentcore:CreateEvent",
            "bedrock-agentcore:ListEvents",
            "bedrock-agentcore:GetLastKTurns",
            "bedrock-agentcore:RetrieveMemories"
        ],
        "Resource": f"arn:aws:bedrock-agentcore:us-east-1:ACCOUNT_ID:memory/{MEMORY_ID}",
        "Condition": {
            "StringEquals": {
                "bedrock-agentcore:actorId": "${cognito-identity.amazonaws.com:sub}"
            }
        }
    }]
}

# Create role
role = iam_client.create_role(
    RoleName='AgentCoreAuthenticatedRole',
    AssumeRolePolicyDocument=json.dumps(trust_policy)
)

# Attach policy
iam_client.put_role_policy(
    RoleName='AgentCoreAuthenticatedRole',
    PolicyName='MemoryAccessPolicy',
    PolicyDocument=json.dumps(memory_policy)
)

# Attach role to Identity Pool
identity_client.set_identity_pool_roles(
    IdentityPoolId=identity_pool_id,
    Roles={
        'authenticated': role['Role']['Arn']
    }
)
```

### 4. Create Test Users

```python
# Create users
for username in ['testuser1', 'testuser2']:
    cognito_client.admin_create_user(
        UserPoolId=user_pool_id,
        Username=username,
        TemporaryPassword='TempPass123!',
        MessageAction='SUPPRESS'
    )

    # Set permanent password
    cognito_client.admin_set_user_password(
        UserPoolId=user_pool_id,
        Username=username,
        Password='Password123!',
        Permanent=True
    )
```

### 5. Get Federated Credentials (In Agent Code)

```python
def get_aws_credentials_for_identity(identity_pool_id, id_token, region, user_pool_id):
    """
    Exchange Cognito ID token for temporary AWS credentials
    """
    identity_client = boto3.client('cognito-identity', region_name=region)

    # Get identity ID
    get_id_response = identity_client.get_id(
        IdentityPoolId=identity_pool_id,
        Logins={
            f'cognito-idp.{region}.amazonaws.com/{user_pool_id}': id_token
        }
    )
    identity_id = get_id_response['IdentityId']

    # Get temporary credentials
    get_credentials_response = identity_client.get_credentials_for_identity(
        IdentityId=identity_id,
        Logins={
            f'cognito-idp.{region}.amazonaws.com/{user_pool_id}': id_token
        }
    )

    credentials = get_credentials_response['Credentials']
    return {
        'access_key_id': credentials['AccessKeyId'],
        'secret_key': credentials['SecretKey'],
        'session_token': credentials['SessionToken'],
        'expiration': credentials['Expiration'],
        'identity_id': identity_id  # This becomes actor_id
    }
```

### 6. Agent Code with Federated Identity

```python
from bedrock_agentcore.runtime import BedrockAgentCoreApp
from bedrock_agentcore.memory.session import MemorySessionManager
from strands import Agent
import boto3
import os

app = BedrockAgentCoreApp()

MEMORY_ID = os.getenv('MEMORY_ID')
IDENTITY_POOL_ID = os.getenv('IDENTITY_POOL_ID')
COGNITO_USER_POOL = os.getenv('COGNITO_USER_POOL')
REGION = os.getenv('AWS_REGION')

@app.entrypoint
def runtime_memory_agent(payload, context):
    """
    Agent with federated identity-based memory isolation
    """
    user_input = payload.get("prompt")
    id_token = payload.get("id_token")  # From client
    session_id = context.session_id

    # Get federated credentials
    user_credentials = get_aws_credentials_for_identity(
        identity_pool_id=IDENTITY_POOL_ID,
        id_token=id_token,
        region=REGION,
        user_pool_id=COGNITO_USER_POOL
    )

    # CRITICAL: Use identity_id as actor_id
    actor_id = user_credentials['identity_id']

    # Create boto3 session with federated credentials
    session = boto3.Session(
        aws_access_key_id=user_credentials['access_key_id'],
        aws_secret_access_key=user_credentials['secret_key'],
        aws_session_token=user_credentials['session_token'],
        region_name=REGION
    )

    # Create memory client with federated credentials
    memory_session_manager = MemorySessionManager(
        memory_id=MEMORY_ID,
        region_name=REGION,
        boto3_session=session  # Uses user's credentials!
    )

    # Create agent with memory hooks
    agent = Agent(
        model="us.anthropic.claude-haiku-4-5-20251001-v1:0",
        hooks=[MemoryHookProvider(memory_session_manager)],
        state={
            "actor_id": actor_id,
            "session_id": session_id
        }
    )

    # Invoke agent
    response = agent(user_input)
    return response.message['content'][0]['text']

if __name__ == "__main__":
    app.run()
```

### 7. Deploy with Cognito Authorization

```python
from bedrock_agentcore_starter_toolkit import Runtime

agentcore_runtime = Runtime()

# Configure with JWT authorizer
response = agentcore_runtime.configure(
    entrypoint="runtime_identity_memory_agent.py",
    execution_role="AgentCoreExecutionRole",
    auto_create_ecr=True,
    requirements_file="requirements.txt",
    region="us-east-1",
    agent_name="secure-memory-agent",
    memory_mode="NO_MEMORY",  # We handle memory manually
    idle_timeout=60,
    request_header_configuration={
        "requestHeaderAllowlist": ["Authorization"]  # Pass JWT token
    },
    authorizer_configuration={
        "customJWTAuthorizer": {
            "discoveryUrl": f"https://cognito-idp.us-east-1.amazonaws.com/{user_pool_id}/.well-known/jwks.json",
            "allowedClients": [client_id]
        }
    }
)

# Launch with environment variables
launch_result = agentcore_runtime.launch(
    env_vars={
        "MEMORY_ID": memory_id,
        "MODEL_ID": "us.anthropic.claude-haiku-4-5-20251001-v1:0",
        "AWS_REGION": "us-east-1",
        "COGNITO_USER_POOL": user_pool_id,
        "IDENTITY_POOL_ID": identity_pool_id
    }
)
```

### 8. Client-Side: Get Tokens and Invoke

```python
import boto3

cognito_client = boto3.client('cognito-idp', region_name='us-east-1')

# User login
auth_response = cognito_client.admin_initiate_auth(
    UserPoolId=user_pool_id,
    ClientId=client_id,
    AuthFlow='ADMIN_NO_SRP_AUTH',
    AuthParameters={
        'USERNAME': 'testuser1',
        'PASSWORD': 'Password123!'
    }
)

# Extract tokens
id_token = auth_response['AuthenticationResult']['IdToken']
access_token = auth_response['AuthenticationResult']['AccessToken']

# Invoke agent
response = agentcore_runtime.invoke(
    {
        "prompt": "My name is Alice and I like pizza",
        "id_token": id_token  # Pass ID token in payload
    },
    session_id="session-123",
    bearer_token=access_token  # Pass access token in Authorization header
)

print(response['response'])
```

## Testing Memory Isolation

```python
import time

def test_memory_isolation():
    """
    Verify users can only access their own memories
    """
    # User 1 shares info
    user1_response = agentcore_runtime.invoke(
        {
            "prompt": "My name is Alice and my favorite color is blue",
            "id_token": user1_id_token
        },
        session_id="user1-session",
        bearer_token=user1_access_token
    )

    # Wait for session to expire
    time.sleep(75)

    # User 1 recalls (should work)
    user1_recall = agentcore_runtime.invoke(
        {
            "prompt": "What is my name and favorite color?",
            "id_token": user1_id_token
        },
        session_id="user1-session",
        bearer_token=user1_access_token
    )
    print(f"User 1 recall: {user1_recall['response']}")
    # Expected: "Your name is Alice and your favorite color is blue"

    # User 2 shares different info
    user2_response = agentcore_runtime.invoke(
        {
            "prompt": "My name is Bob and my favorite color is red",
            "id_token": user2_id_token
        },
        session_id="user2-session",
        bearer_token=user2_access_token
    )

    time.sleep(75)

    # User 2 recalls (should only see their own info)
    user2_recall = agentcore_runtime.invoke(
        {
            "prompt": "What is my name and favorite color?",
            "id_token": user2_id_token
        },
        session_id="user2-session",
        bearer_token=user2_access_token
    )
    print(f"User 2 recall: {user2_recall['response']}")
    # Expected: "Your name is Bob and your favorite color is red"
    # NOT Alice's info!
```

## Key Security Concepts

### 1. Identity ID as Actor ID

```python
actor_id = user_credentials['identity_id']
```

The Cognito Identity ID becomes the `actor_id` in memory operations. This is the key to isolation.

### 2. IAM Condition on Actor ID

```json
{
  "Condition": {
    "StringEquals": {
      "bedrock-agentcore:actorId": "${cognito-identity.amazonaws.com:sub}"
    }
  }
}
```

This IAM condition ensures users can ONLY access memory where `actor_id` matches their identity ID.

### 3. Federated Credentials in Memory Client

```python
session = boto3.Session(
    aws_access_key_id=user_credentials['access_key_id'],
    aws_secret_access_key=user_credentials['secret_key'],
    aws_session_token=user_credentials['session_token']
)

memory_session_manager = MemorySessionManager(
    memory_id=MEMORY_ID,
    boto3_session=session  # User's scoped credentials
)
```

The memory client uses the user's temporary credentials, not the agent's execution role.

### 4. JWT Authorization at Gateway

```python
authorizer_configuration={
    "customJWTAuthorizer": {
        "discoveryUrl": "https://cognito-idp.../jwks.json",
        "allowedClients": [client_id]
    }
}
```

Agent Core Gateway validates JWT tokens before allowing requests.

## Session Management

### Session Expiry

- Agent Core Runtime sessions expire after idle timeout (configurable)
- Memory persists beyond session expiry
- New session with same user can retrieve history

### Session ID Strategy

```python
# Option 1: Client-managed (recommended)
session_id = f"user-{user_id}-{timestamp}"

# Option 2: Auto-generated by Agent Core
# Don't pass session_id, Agent Core creates one
```

## Best Practices

1. **Always use federated credentials** for memory operations in multi-user apps
2. **Set actor_id to identity_id** for proper isolation
3. **Test isolation** between users thoroughly
4. **Use JWT authorization** at the gateway level
5. **Handle token expiry** gracefully (refresh tokens)
6. **Log identity_id** for debugging and auditing
7. **Set appropriate idle_timeout** based on use case
8. **Pass Authorization header** for gateway auth
9. **Pass id_token in payload** for federated credentials
10. **Validate tokens** before processing

## Common Pitfalls

❌ **Using agent's execution role for memory** - No isolation!
✅ **Use federated credentials per user**

❌ **Using username as actor_id** - Can be spoofed!
✅ **Use identity_id from Cognito**

❌ **Forgetting IAM condition** - Users can access all memory!
✅ **Add StringEquals condition on actor_id**

❌ **Not testing isolation** - Security bugs in production!
✅ **Test with multiple users**

## Dependencies

```
strands-agents
bedrock-agentcore
bedrock-agentcore-starter-toolkit
boto3
PyJWT  # For token validation
```

## Environment Variables

```bash
MEMORY_ID=your-memory-id
MODEL_ID=us.anthropic.claude-haiku-4-5-20251001-v1:0
AWS_REGION=us-east-1
COGNITO_USER_POOL=us-east-1_XXXXXX
IDENTITY_POOL_ID=us-east-1:xxxx-xxxx-xxxx
```

## Complete Flow Diagram

```
1. User logs in to Cognito User Pool
   ↓
2. Client receives ID token + Access token
   ↓
3. Client calls Agent Core Gateway
   - Authorization header: Bearer {access_token}
   - Payload: {prompt, id_token}
   ↓
4. Gateway validates JWT (access_token)
   ↓
5. Agent receives payload with id_token
   ↓
6. Agent exchanges id_token for federated credentials
   ↓
7. Agent creates memory client with federated credentials
   ↓
8. Memory operations use user's identity_id as actor_id
   ↓
9. IAM enforces: actor_id must match identity_id
   ↓
10. User can only access their own memory
```

## This is Production-Ready Security

This pattern is how you build secure, multi-tenant Agent Core applications. It's not optional for production - it's required for:

- GDPR compliance
- HIPAA compliance
- SOC 2 compliance
- Any multi-user application

Without this, you have a massive security vulnerability.
