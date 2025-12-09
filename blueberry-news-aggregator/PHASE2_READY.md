# 🎉 Phase 2 Ready to Deploy!

## ✅ What We Created

Your Phase 2 deployment is ready! Here's what we built:

### 📦 Agent Core Files

```
phase2_agentcore/
├── news_agent.py              ← Agent with BedrockAgentCoreApp
├── requirements.txt           ← Runtime dependencies
├── Dockerfile                 ← ARM64 container
├── test_deployed_agent.py     ← Test script
├── DEPLOY.md                  ← Step-by-step guide
├── README.md                  ← Phase 2 overview
│
└── deployment/                ← CDK infrastructure
    ├── app.py                 ← CDK entry point
    ├── blueberry_stack.py     ← Stack definition
    ├── cdk.json               ← CDK config
    └── requirements.txt       ← CDK dependencies
```

### 🔑 Key Changes from Phase 1

#### Phase 1 (Local)

```python
agent = Agent(tools=[...])
response = agent("What's the news?")
```

#### Phase 2 (Agent Core)

```python
from bedrock_agentcore.runtime import BedrockAgentCoreApp

app = BedrockAgentCoreApp()

@app.entrypoint
def invoke(payload=None):
    query = payload.get("prompt")
    agent = Agent(tools=[...])
    response = agent(query)
    return {"status": "success", "response": response}

if __name__ == "__main__":
    app.run()  # HTTP server on port 8080
```

## 🚀 Deploy in 4 Steps

### Step 1: Check Prerequisites

```bash
# AWS credentials
aws sts get-caller-identity

# CDK installed (need 2.220.0+)
cdk --version

# Docker running
docker ps
```

### Step 2: Install CDK Dependencies

```bash
cd blueberry-news-aggregator/phase2_agentcore/deployment
pip install -r requirements.txt
```

### Step 3: Bootstrap CDK (First Time Only)

```bash
cdk bootstrap
```

This creates necessary AWS resources. Only needed once per account/region.

### Step 4: Deploy!

```bash
cdk deploy
```

**Takes ~10-15 minutes**. You'll see:

- Docker image building (ARM64)
- Image pushed to ECR
- IAM roles created
- Agent Core Runtime created

## 🧪 Test Your Deployed Agent

### Option 1: Automatic Test Script

```bash
cd blueberry-news-aggregator/phase2_agentcore
python test_deployed_agent.py
```

The script automatically finds your Runtime ARN and tests it!

### Option 2: Manual AWS CLI

```bash
# Get Runtime ARN
RUNTIME_ARN=$(aws cloudformation describe-stacks \
  --stack-name BlueberryNewsAgent \
  --query 'Stacks[0].Outputs[?OutputKey==`AgentRuntimeArn`].OutputValue' \
  --output text)

# Invoke agent
aws bedrock-agentcore invoke-agent-runtime \
  --agent-runtime-arn $RUNTIME_ARN \
  --qualifier DEFAULT \
  --payload '{"prompt": "What are the latest tech news?"}' \
  response.json

# View response
cat response.json
```

### Option 3: AWS Console

1. Go to [Bedrock AgentCore Console](https://console.aws.amazon.com/bedrock-agentcore/)
2. Click "Runtimes"
3. Find "BlueberryNewsAgent_NewsAgent"
4. Click "Test"
5. Enter: `{"prompt": "What are the latest tech news?"}`
6. Click "Invoke"

## 📊 What Gets Deployed

| Resource               | Purpose                      |
| ---------------------- | ---------------------------- |
| **ECR Repository**     | Stores Docker images         |
| **Docker Image**       | Your agent container (ARM64) |
| **IAM Role**           | Execution permissions        |
| **Agent Core Runtime** | Runs your agent              |
| **CloudWatch Logs**    | Automatic logging            |
| **X-Ray Traces**       | Observability                |

## 💰 Cost Estimate

**~$10-20/month** with minimal usage:

- Agent Core Runtime: ~$5-10
- ECR Storage: ~$0.10
- CloudWatch: ~$0.50
- Bedrock (Nova Pro): Pay per token

## 📈 Monitoring

### View Logs in Terminal

```bash
aws logs tail /aws/bedrock-agentcore/BlueberryNewsAgent_NewsAgent --follow
```

### View in AWS Console

1. Go to [CloudWatch Console](https://console.aws.amazon.com/cloudwatch/)
2. Logs → Log groups
3. Find `/aws/bedrock-agentcore/BlueberryNewsAgent_NewsAgent`

## 🔄 Update Your Agent

Made changes to `news_agent.py`? Redeploy:

```bash
cd phase2_agentcore/deployment
cdk deploy
```

CDK automatically:

- Rebuilds Docker image
- Pushes to ECR
- Updates Agent Core Runtime

## 🧹 Cleanup (When Done)

Delete all resources:

```bash
cd phase2_agentcore/deployment
cdk destroy
```

Confirm with `y`. This removes:

- Agent Core Runtime
- ECR repository
- IAM roles
- CloudWatch logs

## 🐛 Common Issues

### "CDK bootstrap required"

```bash
cdk bootstrap
```

### "Docker not running"

Start Docker Desktop, then retry.

### "No model access"

1. Go to Bedrock Console
2. Model access → Manage
3. Enable Amazon Nova Pro
4. Save changes

### Build fails

```bash
# Check Docker
docker ps

# Check CDK version
cdk --version  # Need 2.220.0+
```

## 📚 Documentation

- **phase2_agentcore/DEPLOY.md** - Detailed deployment guide
- **phase2_agentcore/README.md** - Phase 2 overview
- **AGENTCORE_LEARNING_PATH.md** - Full learning path

## 🎯 What's Next?

After Phase 2 works:

### Phase 3: Cognito Authentication

- Add user authentication
- JWT tokens
- User-specific sessions

### Phase 4: Short-Term Memory

- Remember conversation context
- Session management
- Last 10 messages

### Phase 5: Long-Term Memory

- DynamoDB storage
- User preferences
- Conversation history

## ✅ Pre-Deployment Checklist

Before running `cdk deploy`:

- [ ] AWS credentials configured (`aws sts get-caller-identity`)
- [ ] CDK installed 2.220.0+ (`cdk --version`)
- [ ] Docker running (`docker ps`)
- [ ] Bedrock model access enabled
- [ ] In correct directory (`phase2_agentcore/deployment`)
- [ ] CDK dependencies installed (`pip install -r requirements.txt`)
- [ ] CDK bootstrapped (`cdk bootstrap`)

## 🚀 Ready to Deploy?

```bash
cd blueberry-news-aggregator/phase2_agentcore/deployment
pip install -r requirements.txt
cdk bootstrap  # First time only
cdk deploy
```

Then test:

```bash
cd ..
python test_deployed_agent.py
```

**Good luck! Your agent is about to go live in the cloud! 🫐☁️**

---

**Need help?** Check `phase2_agentcore/DEPLOY.md` for detailed instructions.
