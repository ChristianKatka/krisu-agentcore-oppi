# 🫐 Phase 2: Agent Core Deployment

## 📁 Structure

```
phase2_agentcore/
├── news_agent.py              ← Agent code (Agent Core format)
├── requirements.txt           ← Runtime dependencies
├── Dockerfile                 ← Container definition
├── test_deployed_agent.py     ← Test script
├── DEPLOY.md                  ← Detailed deployment guide
│
└── deployment/                ← CDK deployment
    ├── app.py                 ← CDK app entry point
    ├── blueberry_stack.py     ← CDK stack definition
    ├── cdk.json               ← CDK configuration
    └── requirements.txt       ← CDK dependencies
```

## 🚀 Quick Deploy

### Option 1: Using Helper Script (Recommended)

```bash
cd deployment

# Set your region
export AWS_REGION=us-east-1

# For AWS SSO users
export AWS_PROFILE=YOUR_PROFILE

# Run the helper script
./deploy.sh
```

The script will:

- ✅ Check AWS credentials
- ✅ Verify Docker is running
- ✅ Install dependencies if needed
- ✅ Guide you through deployment

### Option 2: Manual Deployment

```bash
cd deployment

# Set your region (REQUIRED!)
export AWS_REGION=us-east-1

# For AWS SSO users
export AWS_PROFILE=YOUR_PROFILE

# Install dependencies
pip install -r requirements.txt

# Bootstrap (first time only)
cdk bootstrap

# Deploy
cdk deploy
```

## 🧪 Quick Test

```bash
# After deployment, test your agent
python test_deployed_agent.py

# Or with specific Runtime ARN
python test_deployed_agent.py arn:aws:bedrock-agentcore:us-east-1:123:runtime/abc
```

## 📖 Key Differences from Phase 1

### Phase 1 (Local)

```python
agent = Agent(tools=[...])
response = agent("query")
print(response)
```

### Phase 2 (Agent Core)

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
    app.run()  # Starts HTTP server on port 8080
```

## 🐳 Docker Container

The Dockerfile creates an ARM64 container with:

- Python 3.11
- All dependencies from requirements.txt
- OpenTelemetry for CloudWatch observability
- Non-root user for security
- Exposes ports 8080 (HTTP) and 8000 (health)

## ☁️ What Gets Deployed

1. **ECR Repository** - Stores your Docker image
2. **Docker Image** - Built and pushed automatically by CDK
3. **IAM Role** - Permissions for agent execution
4. **Agent Core Runtime** - Runs your containerized agent
5. **CloudWatch Logs** - Automatic logging and monitoring

## 💰 Cost

~$10-20/month with minimal usage:

- Agent Core Runtime: ~$5-10
- ECR Storage: ~$0.10
- CloudWatch: ~$0.50
- Bedrock usage: Pay per token

## 📊 Monitoring

### View Logs

```bash
aws logs tail /aws/bedrock-agentcore/ChristianBlueberryNewsAgent_NewsAgent --follow
```

### View in Console

1. Go to CloudWatch Console
2. Logs → Log groups
3. Find `/aws/bedrock-agentcore/ChristianBlueberryNewsAgent_NewsAgent`

## 🔄 Update Agent

Made changes? Redeploy:

```bash
cd deployment
cdk deploy
```

CDK will rebuild and update automatically.

## 🧹 Cleanup

Delete everything:

```bash
cd deployment
cdk destroy
```

## 📚 Documentation

- **DEPLOY.md** - Complete deployment guide
- **QUICK_DEPLOY.md** - Quick reference for deployment
- **SSO_DEPLOYMENT.md** - AWS SSO and multi-account deployment
- **deployment/TROUBLESHOOTING.md** - Common issues and fixes
- **test_deployed_agent.py** - Test your deployed agent
- **../AGENTCORE_LEARNING_PATH.md** - Full learning path

## 🎯 Next Steps

Once Phase 2 works:

- **Phase 3**: Add Cognito authentication
- **Phase 4**: Add short-term memory
- **Phase 5**: Add long-term memory (DynamoDB)

## ✅ Success Checklist

- [ ] CDK installed (2.220.0+)
- [ ] Docker running
- [ ] AWS credentials configured
- [ ] Bedrock model access enabled
- [ ] CDK bootstrapped
- [ ] Deployed successfully
- [ ] Agent tested and working

**Ready? See DEPLOY.md for step-by-step instructions!**
