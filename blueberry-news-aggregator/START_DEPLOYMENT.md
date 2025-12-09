# 🚀 START HERE - Deploy to AWS

## You're Ready to Deploy Phase 2!

All the region configuration issues have been fixed. The code now requires explicit region configuration and works perfectly with AWS SSO.

## Quick Deploy (3 Commands)

```bash
# 1. Set your region and profile
export AWS_REGION=us-east-1
export AWS_PROFILE=YOUR_PROFILE

# 2. Go to deployment directory
cd phase2_agentcore/deployment

# 3. Run the helper script
./deploy.sh
```

That's it! The script will guide you through the rest.

## What Was Fixed

✅ **Region Configuration** - Now requires explicit `AWS_REGION` environment variable
✅ **AWS SSO Support** - Works seamlessly with SSO authentication
✅ **Account Verification** - Shows account, region, profile before deploying
✅ **Helper Script** - Interactive deployment with checks and guidance
✅ **Documentation** - Complete guides for every scenario

## Documentation Guide

### Quick Start

- **DEPLOY_NOW.md** - Ultra-quick 3-step guide
- **DEPLOYMENT_CHECKLIST.md** - Complete checklist

### Detailed Guides

- **phase2_agentcore/QUICK_DEPLOY.md** - Quick reference
- **phase2_agentcore/SSO_DEPLOYMENT.md** - AWS SSO complete guide
- **phase2_agentcore/DEPLOY.md** - Full deployment guide

### Troubleshooting

- **phase2_agentcore/deployment/TROUBLESHOOTING.md** - Common issues
- **REGION_FIX_SUMMARY.md** - What was fixed and why

### Reference

- **phase2_agentcore/README.md** - Phase 2 overview
- **phase2_agentcore/deployment/README.md** - Deployment directory guide
- **omat-muistiinpanot.md** - Your personal notes (updated)

## First Time Deployment

```bash
# 1. Login to AWS SSO
aws sso login --profile YOUR_PROFILE

# 2. Set environment variables
export AWS_PROFILE=YOUR_PROFILE
export AWS_REGION=us-east-1

# 3. Verify credentials
aws sts get-caller-identity

# 4. Go to deployment directory
cd phase2_agentcore/deployment

# 5. Install dependencies
pip install -r requirements.txt

# 6. Bootstrap CDK (first time only)
cdk bootstrap

# 7. Deploy!
cdk deploy
```

## What You'll See

```
============================================================
🚀 Christian Blueberry News Aggregator - Deployment Config
============================================================
📍 Region: us-east-1
👤 Profile: your-profile
🔑 Account: 802026442401
✅ Account verified
============================================================

Building Docker image...
Pushing to ECR...
Creating CloudFormation stack...
✅ Deployment complete!

Outputs:
ChristianBlueberryAgentRuntimeArn = arn:aws:bedrock-agentcore:...
```

## After Deployment

### Test Your Agent

```bash
cd ..
python test_deployed_agent.py
```

### View Logs

```bash
aws logs tail /aws/bedrock-agentcore/Christian_Blueberry_News_Agent --follow
```

### Check AWS Console

Go to [Bedrock AgentCore Console](https://console.aws.amazon.com/bedrock-agentcore/) and find "Christian_Blueberry_News_Agent"

## Need Help?

1. **Quick issues?** → `phase2_agentcore/deployment/TROUBLESHOOTING.md`
2. **SSO questions?** → `phase2_agentcore/SSO_DEPLOYMENT.md`
3. **Full guide?** → `phase2_agentcore/DEPLOY.md`
4. **Checklist?** → `DEPLOYMENT_CHECKLIST.md`

## Common Issues

### "AWS_REGION not set"

```bash
export AWS_REGION=us-east-1
```

### "SSO session expired"

```bash
aws sso login --profile YOUR_PROFILE
```

### "Docker not running"

Start Docker Desktop

## Ready?

```bash
cd phase2_agentcore/deployment
export AWS_REGION=us-east-1
export AWS_PROFILE=YOUR_PROFILE
./deploy.sh
```

**Deployment takes ~10-15 minutes**

Good luck! 🫐🚀

---

## What Gets Deployed

- ✅ Docker container (ARM64) in ECR
- ✅ IAM execution role with Bedrock permissions
- ✅ Agent Core Runtime (public HTTP)
- ✅ CloudWatch Logs for monitoring

**Cost: ~$10-20/month with minimal usage**

## Next Steps After Phase 2

- **Phase 3**: Add Cognito authentication
- **Phase 4**: Add short-term memory
- **Phase 5**: Add long-term memory (DynamoDB)

See `AGENTCORE_LEARNING_PATH.md` for the full roadmap.
