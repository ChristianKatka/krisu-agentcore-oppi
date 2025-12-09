# ✅ Deployment Checklist

## Before You Deploy

### 1. AWS Setup

- [ ] AWS SSO configured
- [ ] Can run: `aws sso login --profile YOUR_PROFILE`
- [ ] Can run: `aws sts get-caller-identity`
- [ ] Have access to target AWS account (802026442401)

### 2. Bedrock Access

- [ ] Go to [Bedrock Console](https://console.aws.amazon.com/bedrock/)
- [ ] Click "Model access"
- [ ] Enable "Amazon Nova Pro"
- [ ] Wait for "Access granted" status

### 3. Local Tools

- [ ] Docker Desktop installed and running
- [ ] Can run: `docker ps`
- [ ] CDK installed: `npm install -g aws-cdk`
- [ ] CDK version 2.220.0+: `cdk --version`
- [ ] Python 3.10+ installed: `python --version`

### 4. Environment Variables

- [ ] Set: `export AWS_REGION=us-east-1`
- [ ] Set: `export AWS_PROFILE=YOUR_PROFILE`
- [ ] Verify: `echo $AWS_REGION` shows your region
- [ ] Verify: `echo $AWS_PROFILE` shows your profile

## Deployment Steps

### First Time Deployment

```bash
# 1. Navigate to deployment directory
cd blueberry-news-aggregator/phase2_agentcore/deployment

# 2. Set environment variables
export AWS_REGION=us-east-1
export AWS_PROFILE=YOUR_PROFILE

# 3. Verify credentials
aws sts get-caller-identity

# 4. Install dependencies
pip install -r requirements.txt

# 5. Bootstrap CDK (creates S3 buckets, IAM roles)
cdk bootstrap

# 6. Deploy!
cdk deploy
# OR use helper script:
./deploy.sh
```

### Subsequent Deployments

```bash
# 1. Navigate to deployment directory
cd blueberry-news-aggregator/phase2_agentcore/deployment

# 2. Set environment variables
export AWS_REGION=us-east-1
export AWS_PROFILE=YOUR_PROFILE

# 3. Deploy
cdk deploy
```

## During Deployment

Watch for these stages:

- [ ] ✅ Account verification passed
- [ ] ✅ Docker image building (5-10 min)
- [ ] ✅ Image pushed to ECR
- [ ] ✅ CloudFormation stack creating (5-10 min)
- [ ] ✅ IAM roles created
- [ ] ✅ Agent Core Runtime created
- [ ] ✅ Deployment complete

**Total time: ~10-15 minutes**

## After Deployment

### 1. Save Runtime ARN

```bash
# Get Runtime ARN from stack outputs
aws cloudformation describe-stacks \
  --stack-name Christian-Blueberry-News-Agent \
  --query 'Stacks[0].Outputs[?OutputKey==`ChristianBlueberryAgentRuntimeArn`].OutputValue' \
  --output text

# Save this ARN - you'll need it!
```

### 2. Test Your Agent

```bash
cd ..
python test_deployed_agent.py
```

Expected output:

```
🧪 Testing Christian Blueberry News Agent
==========================================
✅ Found Runtime ARN: arn:aws:bedrock-agentcore:...
📤 Sending request: "What are the latest tech news?"
📥 Response: [news articles]
✅ Test successful!
```

### 3. View Logs

```bash
aws logs tail /aws/bedrock-agentcore/Christian_Blueberry_News_Agent --follow
```

### 4. Check AWS Console

- [ ] Go to [Bedrock AgentCore Console](https://console.aws.amazon.com/bedrock-agentcore/)
- [ ] Find "Christian_Blueberry_News_Agent" runtime
- [ ] Status should be "Active"
- [ ] Try test invocation in console

## Verification Checklist

- [ ] Stack deployed successfully
- [ ] Runtime ARN saved
- [ ] Test script works
- [ ] CloudWatch logs visible
- [ ] Agent responds to queries
- [ ] No errors in logs

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

### "ENAMETOOLONG error"

```bash
rm -rf cdk.out
cdk deploy
```

### "Account mismatch"

Update `EXPECTED_ACCOUNT_ID` in `deployment/app.py`

### "CDK bootstrap required"

```bash
cdk bootstrap
```

## Resources Created

After deployment, these resources exist in your AWS account:

- [ ] CloudFormation Stack: `Christian-Blueberry-News-Agent`
- [ ] Agent Runtime: `Christian_Blueberry_News_Agent`
- [ ] IAM Role: `Christian-Blueberry-News-Agent-ExecutionRole`
- [ ] ECR Repository: (auto-created by CDK)
- [ ] CloudWatch Log Group: `/aws/bedrock-agentcore/Christian_Blueberry_News_Agent`

## Cost Tracking

Monitor costs in [AWS Cost Explorer](https://console.aws.amazon.com/cost-management/):

Expected monthly costs with minimal usage:

- Agent Core Runtime: ~$5-10
- ECR Storage: ~$0.10
- CloudWatch Logs: ~$0.50
- Bedrock API calls: Pay per token

**Total: ~$10-20/month**

## Cleanup (When Done Testing)

```bash
cd phase2_agentcore/deployment
cdk destroy
```

This deletes:

- [ ] Agent Core Runtime
- [ ] IAM roles
- [ ] CloudWatch logs
- [ ] ECR repository and images

## Documentation Reference

- **DEPLOY_NOW.md** - Ultra-quick start
- **phase2_agentcore/QUICK_DEPLOY.md** - Quick reference
- **phase2_agentcore/SSO_DEPLOYMENT.md** - Complete SSO guide
- **phase2_agentcore/DEPLOY.md** - Full deployment guide
- **phase2_agentcore/deployment/TROUBLESHOOTING.md** - Common issues
- **REGION_FIX_SUMMARY.md** - Region configuration details

## Success! 🎉

Once everything is checked off, you have:

✅ Successfully deployed your first AWS Agent Core agent
✅ Agent running in the cloud
✅ Can invoke via API
✅ CloudWatch monitoring enabled
✅ Ready for Phase 3 (Cognito authentication)

## Next Steps

- **Phase 3**: Add Cognito authentication
- **Phase 4**: Add short-term memory
- **Phase 5**: Add long-term memory (DynamoDB)

See `AGENTCORE_LEARNING_PATH.md` for the full roadmap.

---

**Ready to deploy?**

```bash
cd phase2_agentcore/deployment
export AWS_REGION=us-east-1
export AWS_PROFILE=YOUR_PROFILE
./deploy.sh
```

Good luck! 🫐🚀
