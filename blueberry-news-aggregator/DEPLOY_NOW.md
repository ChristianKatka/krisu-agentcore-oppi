# 🚀 Deploy Christian Blueberry News Aggregator NOW

## For AWS SSO Users (You!)

```bash
# 1. Login to AWS SSO
aws sso login --profile YOUR_PROFILE

# 2. Set environment variables
export AWS_PROFILE=YOUR_PROFILE
export AWS_REGION=us-east-1

# 3. Verify you're in the right account
aws sts get-caller-identity

# 4. Go to deployment directory
cd phase2_agentcore/deployment

# 5. Run the helper script
./deploy.sh
```

The script will guide you through:

- Installing dependencies (if needed)
- Bootstrapping CDK (first time only)
- Deploying to AWS

## What Happens During Deployment

1. **Verification** (30 seconds)

   - Checks AWS credentials
   - Verifies Docker is running
   - Shows account, region, profile

2. **Docker Build** (5-10 minutes)

   - Builds ARM64 container
   - Installs Python dependencies
   - Pushes to ECR

3. **CloudFormation** (5-10 minutes)
   - Creates IAM roles
   - Creates Agent Core Runtime
   - Sets up CloudWatch Logs

**Total time: ~10-15 minutes**

## After Deployment

### Get Your Runtime ARN

```bash
aws cloudformation describe-stacks \
  --stack-name Christian-Blueberry-News-Agent \
  --query 'Stacks[0].Outputs[?OutputKey==`ChristianBlueberryAgentRuntimeArn`].OutputValue' \
  --output text
```

### Test Your Agent

```bash
cd ..
python test_deployed_agent.py
```

### View Logs

```bash
aws logs tail /aws/bedrock-agentcore/Christian_Blueberry_News_Agent --follow
```

## Troubleshooting

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

### "Account mismatch"

Update `EXPECTED_ACCOUNT_ID` in `deployment/app.py`

## Need More Help?

- **Quick Reference**: `phase2_agentcore/QUICK_DEPLOY.md`
- **SSO Guide**: `phase2_agentcore/SSO_DEPLOYMENT.md`
- **Full Guide**: `phase2_agentcore/DEPLOY.md`
- **Troubleshooting**: `phase2_agentcore/deployment/TROUBLESHOOTING.md`

## Ready to Deploy?

```bash
cd phase2_agentcore/deployment
export AWS_REGION=us-east-1
export AWS_PROFILE=YOUR_PROFILE
./deploy.sh
```

Good luck! 🫐
