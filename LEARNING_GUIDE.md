# AWS Agent Core Learning Guide

## Step-by-Step Tutorial

### 1. Understanding the Components

**Agent Core Runtime**

- Hosts and executes your agents
- Manages agent lifecycle
- Handles scaling and resource allocation
- Think of it as a serverless container for your AI agents

**Agent Core Gateway**

- Exposes your agent as REST API endpoints
- Example: `risun-reseptit.fi/get` → calls your agent's `get_recipe` function
- Handles request routing and response formatting
- Supports custom domains

**Agent Core Identity**

- Integrates with AWS Cognito
- Manages authentication (who are you?)
- Manages authorization (what can you do?)
- Supports user pools and groups

### 2. Development Workflow

```
1. Build agent locally with Strands
   ↓
2. Test with local_server.py
   ↓
3. Configure agent-core-config.yaml
   ↓
4. Deploy to AWS Agent Core
   ↓
5. Access via Gateway endpoints
```

### 3. Local Testing

```bash
# Install dependencies
pip install -r agent/requirements.txt
pip install flask

# Run local server
python agent/local_server.py

# Test in another terminal
curl -X POST http://localhost:8000/get-recipe \
  -H "Content-Type: application/json" \
  -d '{"cuisine": "finnish", "difficulty": "medium"}'
```

### 4. Deployment Steps

1. **Set up AWS credentials**

   ```bash
   aws configure
   ```

2. **Create S3 bucket for agent code**

   ```bash
   aws s3 mb s3://your-agent-bucket
   ```

3. **Create IAM role for Agent Core**

   - Needs permissions for Bedrock, Lambda, S3

4. **Deploy using the script**
   ```bash
   chmod +x infrastructure/deploy.sh
   ./infrastructure/deploy.sh
   ```

### 5. Key Concepts

**Strands Agents**

- Framework for building AI agents
- Provides decorators like `@tool` for defining agent capabilities
- Handles conversation state and context

**Agent Core Integration**

- Your Strands agent becomes a "skill" in Agent Core
- Each `@tool` function can be exposed as a Gateway endpoint
- Agent Core handles the infrastructure, you focus on logic

### 6. Next Steps

- [ ] Set up AWS account with Bedrock access
- [ ] Install Strands SDK
- [ ] Test agent locally
- [ ] Configure Cognito user pool
- [ ] Deploy to Agent Core
- [ ] Set up custom domain (optional)
- [ ] Add monitoring and logging

### 7. Common Patterns

**Pattern 1: Simple Query Agent**

```python
@tool
def query(self, question: str) -> str:
    # Process question and return answer
    return answer
```

**Pattern 2: Stateful Agent**

```python
def __init__(self):
    self.conversation_history = []

@tool
def chat(self, message: str) -> str:
    self.conversation_history.append(message)
    # Use history for context
```

**Pattern 3: External API Integration**

```python
@tool
def fetch_data(self, query: str) -> dict:
    response = requests.get(f"https://api.example.com/{query}")
    return response.json()
```

### 8. Resources

- AWS Bedrock Agent Core docs
- Strands documentation at strandsagents.com
- AWS Cognito setup guide
- API Gateway custom domain setup
