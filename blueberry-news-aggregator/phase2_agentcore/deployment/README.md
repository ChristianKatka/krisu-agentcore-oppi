# 🚀 Deployment Directory

This directory contains the AWS CDK infrastructure code for deploying the Christian Blueberry News Aggregator to AWS Agent Core.

## Quick Start

```bash
# Set your region (REQUIRED!)
export AWS_REGION=us-east-1

# For AWS SSO users
export AWS_PROFILE=YOUR_PROFILE

# Run the helper script
./deploy.sh
```

## Files

| File                 | Purpose                                                   |
| -------------------- | --------------------------------------------------------- |
| `app.py`             | CDK app entry point - handles region/account verification |
| `blueberry_stack.py` | CDK stack definition - defines all AWS resources          |
| `cdk.json`           | CDK configuration                                         |
| `requirements.txt`   | CDK Python dependencies                                   |
| `deploy.sh`          | Interactive deployment helper script                      |
| `get_account_id.py`  | Helper to get your AWS account ID                         |
| `TROUBLESHOOTING.md` | Common issues and solutions                               |
| `ACCOUNT_SAFETY.md`  | Account verification documentation                        |

## What Gets Deployed

When you run `cdk deploy`, it creates:

1. **ECR Repository** - Stores your Docker image
2. **Docker Image** - Built from `../Dockerfile` and pushed to ECR
3. **IAM Role** - `Christian-Blueberry-News-Agent-ExecutionRole`
   - Bedrock model access
   - CloudWatch Logs access
4. **Agent Core Runtime** - `Christian_Blueberry_News_Agent`
   - Runs your containerized agent
   - Public HTTP endpoint
5. **CloudWatch Logs** - `/aws/bedrock-agentcore/Christian_Blueberry_News_Agent`

## Environment Variables

| Variable      | Required    | Purpose           | Example          |
| ------------- | ----------- | ----------------- | ---------------- |
| `AWS_REGION`  | ✅ Yes      | Deployment region | `us-east-1`      |
| `AWS_PROFILE` | ⚠️ SSO only | AWS profile name  | `my-sso-profile` |

## Commands

```bash
# Deploy
cdk deploy

# Preview changes
cdk synth

# Bootstrap (first time per account/region)
cdk bootstrap

# Delete everything
cdk destroy

# List stacks
cdk list

# Show differences
cdk diff
```

## First Time Setup

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Set region
export AWS_REGION=us-east-1

# 3. Bootstrap CDK
cdk bootstrap

# 4. Deploy
cdk deploy
```

## Updating the Agent

Made changes to `../news_agent.py`? Just redeploy:

```bash
cdk deploy
```

CDK will:

1. Rebuild the Docker image
2. Push new version to ECR
3. Update the Agent Core Runtime

## Monitoring

### View Logs

```bash
aws logs tail /aws/bedrock-agentcore/Christian_Blueberry_News_Agent --follow
```

### View in Console

1. Go to [CloudWatch Console](https://console.aws.amazon.com/cloudwatch/)
2. Logs → Log groups
3. Find `/aws/bedrock-agentcore/Christian_Blueberry_News_Agent`

## Troubleshooting

See `TROUBLESHOOTING.md` for common issues.

Quick fixes:

```bash
# Clean CDK output
rm -rf cdk.out

# Reinstall dependencies
pip install -r requirements.txt

# Verify credentials
aws sts get-caller-identity

# Check Docker
docker ps
```

## Cost

~$10-20/month with minimal usage:

- Agent Core Runtime: ~$5-10/month
- ECR Storage: ~$0.10/month
- CloudWatch Logs: ~$0.50/month
- Bedrock (Nova Pro): Pay per token

## Documentation

- **../DEPLOY.md** - Complete deployment guide
- **../QUICK_DEPLOY.md** - Quick reference
- **../SSO_DEPLOYMENT.md** - AWS SSO guide
- **TROUBLESHOOTING.md** - Common issues
- **ACCOUNT_SAFETY.md** - Account verification

## Stack Outputs

After deployment, you'll get:

- `ChristianBlueberryAgentRuntimeArn` - Use this to invoke your agent
- `ChristianBlueberryAgentRuntimeId` - Runtime ID
- `ChristianBlueberryAgentRoleArn` - IAM role ARN
- `ChristianBlueberryDockerImageUri` - ECR image URI

Save the Runtime ARN - you'll need it to test your agent!

## Need Help?

1. Check `TROUBLESHOOTING.md`
2. Run `./deploy.sh` for guided deployment
3. Check CloudWatch Logs for runtime errors
4. Verify AWS credentials: `aws sts get-caller-identity`
5. Verify Docker: `docker ps`

## Ready to Deploy?

```bash
export AWS_REGION=us-east-1
./deploy.sh
```

Good luck! 🫐
