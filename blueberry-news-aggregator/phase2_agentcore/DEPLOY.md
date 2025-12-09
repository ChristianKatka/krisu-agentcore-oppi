# 🚀 Phase 2: Deploy to AWS Agent Core

## 🎯 What You'll Deploy

Your Blueberry agent will run on AWS Agent Core with:

- ✅ Docker container (ARM64)
- ✅ ECR repository for images
- ✅ IAM roles with proper permissions
- ✅ CloudWatch logging and observability
- ✅ Public HTTP endpoint

## 📋 Prerequisites

### 1. AWS Account Setup

**For AWS SSO Users:**

```bash
# Login to AWS SSO
aws sso login --profile YOUR_PROFILE

# Set your profile
export AWS_PROFILE=YOUR_PROFILE

# Verify credentials
aws sts get-caller-identity

# Should show your account ID and user
```

**For Standard AWS Credentials:**

```bash
# Configure credentials
aws configure

# Verify credentials
aws sts get-caller-identity
```

### 2. Bedrock Model Access

Make sure you have access to Amazon Bedrock models:

1. Go to [Amazon Bedrock Console](https://console.aws.amazon.com/bedrock/)
2. Click "Model access" in left menu
3. Click "Manage model access"
4. Enable: **Amazon Nova Pro** (or any model you want to use)
5. Click "Save changes"

### 3. Install CDK

```bash
# Install AWS CDK globally
npm install -g aws-cdk

# Verify installation (need 2.220.0+)
cdk --version
```

### 4. Docker Running

```bash
# Check Docker is running
docker --version
docker ps

# If not running, start Docker Desktop
```

## 🛠️ Deployment Steps

### Step 1: Install CDK Dependencies

```bash
cd phase2_agentcore/deployment

# Install Python CDK dependencies
pip install -r requirements.txt
```

### Step 2: Set Your Deployment Region

**IMPORTANT:** You must explicitly specify the region for deployment:

```bash
# Set the region you want to deploy to
export AWS_REGION=us-east-1

# Or use your preferred region:
# export AWS_REGION=eu-west-1
# export AWS_REGION=us-west-2
```

This ensures you always know which region you're deploying to, especially when working with multiple accounts and regions.

### Step 3: Bootstrap CDK (First Time Only)

```bash
# Bootstrap CDK in your AWS account/region
cdk bootstrap

# This creates necessary S3 buckets and roles
# Only needed once per account/region combination
```

### Step 4: Review What Will Be Created

```bash
# Synthesize CloudFormation template (optional)
cdk synth

# This shows you what will be created
```

### Step 5: Deploy!

```bash
# Deploy to AWS
cdk deploy

# The script will show you:
# - Account ID
# - Region
# - Profile (if using SSO)
#
# Then it will:
# - Build Docker image (ARM64)
# - Push image to ECR
# - Create IAM roles
# - Create Agent Core Runtime
```

**⏱️ Deployment takes ~10-15 minutes**

You'll see output like:

```
✨  Synthesis time: 5.2s

ChristianBlueberryNewsAgent: building assets...

[0%] start: Building Docker image
[50%] success: Built Docker image
[75%] start: Publishing to ECR
[100%] success: Published to ECR

ChristianBlueberryNewsAgent: deploying...
ChristianBlueberryNewsAgent: creating CloudFormation changeset...

✅  ChristianBlueberryNewsAgent

Outputs:
ChristianBlueberryNewsAgent.AgentRuntimeArn = arn:aws:bedrock-agentcore:us-east-1:...
ChristianBlueberryNewsAgent.AgentRuntimeId = abc123...
```

### Step 6: Save Your Runtime ARN

```bash
# Get the Runtime ARN from outputs
RUNTIME_ARN=$(aws cloudformation describe-stacks \
  --stack-name ChristianBlueberryNewsAgent \
  --query 'Stacks[0].Outputs[?OutputKey==`AgentRuntimeArn`].OutputValue' \
  --output text)

echo $RUNTIME_ARN

# Save this! You'll need it to invoke your agent
```

## 🧪 Testing Your Deployed Agent

### Method 1: AWS CLI

```bash
# Set your Runtime ARN
RUNTIME_ARN="arn:aws:bedrock-agentcore:us-east-1:YOUR_ACCOUNT:runtime/YOUR_RUNTIME_ID"

# Invoke the agent
aws bedrock-agentcore invoke-agent-runtime \
  --agent-runtime-arn $RUNTIME_ARN \
  --qualifier DEFAULT \
  --payload '{"prompt": "What are the latest tech news?"}' \
  response.json

# View response
cat response.json
```

### Method 2: AWS Console

1. Go to [Bedrock AgentCore Console](https://console.aws.amazon.com/bedrock-agentcore/)
2. Click "Runtimes" in left menu
3. Find "ChristianBlueberryNewsAgent_NewsAgent"
4. Click on it
5. Click "Test" button
6. Enter payload:
   ```json
   {
     "prompt": "What are the latest tech news?"
   }
   ```
7. Click "Invoke"

### Method 3: Python Script

Create `test_agent.py`:

```python
import boto3
import json

client = boto3.client('bedrock-agentcore', region_name='us-east-1')

RUNTIME_ARN = "YOUR_RUNTIME_ARN_HERE"

response = client.invoke_agent_runtime(
    agentRuntimeArn=RUNTIME_ARN,
    qualifier='DEFAULT',
    payload=json.dumps({"prompt": "What are the latest tech news?"})
)

# Handle streaming response
if "text/event-stream" in response.get("contentType", ""):
    for line in response["response"].iter_lines():
        if line:
            print(line.decode("utf-8"))
else:
    print(response["response"].read().decode("utf-8"))
```

Run it:

```bash
python test_agent.py
```

## 📊 Monitoring Your Agent

### CloudWatch Logs

```bash
# View logs
aws logs tail /aws/bedrock-agentcore/ChristianBlueberryNewsAgent_NewsAgent --follow
```

Or in AWS Console:

1. Go to [CloudWatch Console](https://console.aws.amazon.com/cloudwatch/)
2. Click "Logs" → "Log groups"
3. Find `/aws/bedrock-agentcore/ChristianBlueberryNewsAgent_NewsAgent`
4. Click to view logs

You'll see in the logs:

- Agent invocations
- Tool executions (HackerNews, Dev.to fetches)
- Errors and exceptions
- Response generation

## 🔄 Updating Your Agent

Made changes to the code? Redeploy:

```bash
cd phase2_agentcore/deployment

# Deploy updates
cdk deploy

# CDK will:
# - Rebuild Docker image
# - Push new version to ECR
# - Update Agent Core Runtime
```

## 🧹 Cleanup (Delete Everything)

When you're done testing:

```bash
cd phase2_agentcore/deployment

# Destroy all resources
cdk destroy

# Confirm with 'y'
```

This will delete:

- Agent Core Runtime
- ECR repository and images
- IAM roles
- CloudWatch logs

## 💰 Cost Estimate

**Phase 2 costs ~$10-20/month** with minimal usage:

| Service            | Cost            |
| ------------------ | --------------- |
| Agent Core Runtime | ~$5-10/month    |
| ECR Storage        | ~$0.10/month    |
| CloudWatch Logs    | ~$0.50/month    |
| Bedrock (Nova Pro) | Pay per token\* |

\*Bedrock costs depend on usage. Each invocation costs a few cents.

## 🐛 Troubleshooting

### "CDK bootstrap required"

```bash
cdk bootstrap
```

### "Docker not running"

Start Docker Desktop, then try again.

### "No model access"

Go to Bedrock Console → Model access → Enable models

### "Permission denied"

Make sure your AWS credentials have permissions for:

- CloudFormation
- ECR
- IAM
- Lambda
- BedrockAgentCore

### Build fails

Check Docker is running:

```bash
docker ps
```

### Can't find runtime in console

Wait a few minutes after deployment. Runtime takes time to provision.

### Invocation fails

Check CloudWatch logs:

```bash
aws logs tail /aws/bedrock-agentcore/ChristianBlueberryNewsAgent_NewsAgent --follow
```

## 📚 What's Next?

Once Phase 2 works:

- **Phase 3**: Add Cognito authentication
- **Phase 4**: Add short-term memory
- **Phase 5**: Add long-term memory (DynamoDB)

## 🎉 Success Checklist

- [ ] AWS credentials configured
- [ ] Bedrock model access enabled
- [ ] CDK installed (2.220.0+)
- [ ] Docker running
- [ ] CDK bootstrapped
- [ ] Deployment successful
- [ ] Runtime ARN saved
- [ ] Agent tested and working
- [ ] CloudWatch logs visible

**Ready to deploy? Run:**

```bash
cd phase2_agentcore/deployment

# Install dependencies
pip install -r requirements.txt

# Set your region (REQUIRED!)
export AWS_REGION=us-east-1

# If using AWS SSO, set your profile
export AWS_PROFILE=YOUR_PROFILE

# Bootstrap (first time only per account/region)
cdk bootstrap

# Deploy!
cdk deploy
```

Good luck! 🫐
