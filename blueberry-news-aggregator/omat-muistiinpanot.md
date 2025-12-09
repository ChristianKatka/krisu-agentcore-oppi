```bash

voi deploy joko cdk avulla tai cli paketin avulla:
pip install bedrock-agentcore-cli
reenaan eka cdk:n avulla

iha ekana python virtual environment pystyyn projekti kohtasesti.
python3.12 -m venv venv // tarvii vaa kerra
source venv/bin/activate
source ../venv/bin/activate

# Install all dependencies (like npm install)

pip install -r requirements.txt

# Run simple agent
python3.12 phase1_local/simple_agent.py


# Run interactive chat agent
python3.12 phase1_local/interactive_agent.py

Test It Out
Try asking:

- "What are the latest tech news?"
- "Show me HackerNews stories"
- "What's trending on Dev.to?"
```

---

## Phase 2: AWS Deployment (CDK)

### Region Configuration Fix (SSO Support)

**Problem**: CDK was trying to deploy to wrong region (eu-west-1 instead of us-east-1)

**Solution**: Code now requires explicit region configuration

```bash
# ALWAYS set region explicitly
export AWS_REGION=us-east-1

# For AWS SSO users
aws sso login --profile YOUR_PROFILE
export AWS_PROFILE=YOUR_PROFILE
export AWS_REGION=us-east-1

# Deploy
cd phase2_agentcore/deployment
./deploy.sh  # Helper script (recommended)
# OR
cdk deploy   # Manual
```

### Quick Deployment Commands

```bash
# Complete deployment workflow
cd phase2_agentcore/deployment

# Set region (REQUIRED!)
export AWS_REGION=us-east-1

# For SSO
export AWS_PROFILE=YOUR_PROFILE

# First time only
pip install -r requirements.txt
cdk bootstrap

# Deploy
cdk deploy

# Test
cd ..
python test_deployed_agent.py

# Cleanup
cd deployment
cdk destroy
```

### Files Created/Updated

- `app.py` - Added explicit region requirement and SSO support
- `deploy.sh` - Helper script for easier deployment
- `QUICK_DEPLOY.md` - Quick reference guide
- `SSO_DEPLOYMENT.md` - Complete SSO and multi-account guide
- `DEPLOY.md` - Updated with region requirements
- `TROUBLESHOOTING.md` - Added region troubleshooting

### Key Points

- ✅ Region MUST be set via `AWS_REGION` environment variable
- ✅ Code does NOT read from AWS config files
- ✅ Works with AWS SSO and multiple accounts
- ✅ Shows deployment info (account, region, profile) before deploying
- ✅ Account safety check prevents wrong account deployment
- ✅ Helper script (`deploy.sh`) makes deployment easier

### What Gets Deployed

- Stack: `Christian-Blueberry-News-Agent`
- Runtime: `Christian_Blueberry_News_Agent`
- IAM Role: `Christian-Blueberry-News-Agent-ExecutionRole`
- CloudWatch Logs: `/aws/bedrock-agentcore/Christian_Blueberry_News_Agent`
- ECR: Auto-created by CDK

All resources include "Christian Blueberry" for easy identification in AWS Console.

### Deployment Issue #1: ECR Permissions

**Error**:

```
Access denied while validating ECR URI
The execution role requires permissions for ecr:GetAuthorizationToken,
ecr:BatchGetImage, and ecr:GetDownloadUrlForLayer operations.
```

**Fix**: Added ECR permissions to IAM role in `blueberry_stack.py`:

```python
iam.PolicyStatement(
    sid="ECRImagePull",
    effect=iam.Effect.ALLOW,
    actions=[
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage"
    ],
    resources=["*"]
)
```

**Solution**: Redeploy with updated IAM permissions

```bash
cd phase2_agentcore/deployment
cdk deploy
```
