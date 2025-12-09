# ⚡ Quick Deploy Guide

## For AWS SSO Users (Multi-Account/Multi-Region)

```bash
# 1. Login to AWS SSO
aws sso login --profile YOUR_PROFILE

# 2. Set your profile and region
export AWS_PROFILE=YOUR_PROFILE
export AWS_REGION=us-east-1  # Change to your target region

# 3. Verify you're in the right account
aws sts get-caller-identity

# 4. Go to deployment directory
cd phase2_agentcore/deployment

# 5. Install dependencies (first time only)
pip install -r requirements.txt

# 6. Bootstrap CDK (first time per account/region)
cdk bootstrap

# 7. Deploy!
cdk deploy
```

## For Standard AWS Credentials

```bash
# 1. Set your region
export AWS_REGION=us-east-1  # Change to your target region

# 2. Verify credentials
aws sts get-caller-identity

# 3. Go to deployment directory
cd phase2_agentcore/deployment

# 4. Install dependencies (first time only)
pip install -r requirements.txt

# 5. Bootstrap CDK (first time per account/region)
cdk bootstrap

# 6. Deploy!
cdk deploy
```

## Important Notes

- **AWS_REGION is REQUIRED** - The code will not read from your AWS config files
- **Account verification** - The script checks you're deploying to account `802026442401`
- **Change account ID** - Edit `EXPECTED_ACCOUNT_ID` in `app.py` if deploying to different account
- **Deployment time** - Takes ~10-15 minutes
- **Costs** - ~$10-20/month with minimal usage

## Deploying to Different Regions

```bash
# Deploy to us-east-1
export AWS_REGION=us-east-1
cdk deploy

# Deploy to eu-west-1
export AWS_REGION=eu-west-1
cdk bootstrap  # If first time in this region
cdk deploy

# Deploy to us-west-2
export AWS_REGION=us-west-2
cdk bootstrap  # If first time in this region
cdk deploy
```

## Cleanup

```bash
# Delete all resources
cdk destroy
```

## Troubleshooting

**"AWS_REGION environment variable not set"**

```bash
export AWS_REGION=us-east-1
```

**"Account mismatch"**

- Check you're logged into the correct AWS account
- Or update `EXPECTED_ACCOUNT_ID` in `app.py`

**"CDK bootstrap required"**

```bash
cdk bootstrap
```

**"Docker not running"**

- Start Docker Desktop

## What Gets Deployed

- ✅ Docker container (ARM64) pushed to ECR
- ✅ IAM execution role with Bedrock permissions
- ✅ Agent Core Runtime (public HTTP)
- ✅ CloudWatch Logs for monitoring

## After Deployment

Save your Runtime ARN from the outputs:

```bash
RUNTIME_ARN=$(aws cloudformation describe-stacks \
  --stack-name Christian-Blueberry-News-Agent \
  --query 'Stacks[0].Outputs[?OutputKey==`ChristianBlueberryAgentRuntimeArn`].OutputValue' \
  --output text)

echo $RUNTIME_ARN
```

Use it to test your agent:

```bash
aws bedrock-agentcore invoke-agent-runtime \
  --agent-runtime-arn $RUNTIME_ARN \
  --qualifier DEFAULT \
  --payload '{"prompt": "What are the latest tech news?"}' \
  response.json
```
