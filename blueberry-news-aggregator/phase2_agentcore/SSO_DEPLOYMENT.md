# 🔐 AWS SSO Deployment Guide

## Overview

This guide is for deploying the Christian Blueberry News Aggregator when using AWS SSO (Single Sign-On) with multiple accounts and regions.

## Key Changes Made

### 1. Explicit Region Configuration

The deployment code now **requires** you to explicitly set the region via environment variable:

```bash
export AWS_REGION=us-east-1
```

**Why?** This ensures you always know which region you're deploying to, preventing accidental deployments to the wrong region when switching between accounts and profiles.

### 2. AWS SSO Support

The code now properly works with AWS SSO authentication:

```bash
# Login to SSO
aws sso login --profile YOUR_PROFILE

# Set your profile
export AWS_PROFILE=YOUR_PROFILE

# Set your region
export AWS_REGION=us-east-1

# Deploy
cdk deploy
```

### 3. Deployment Info Display

Before deployment, the script shows:

```
============================================================
🚀 Christian Blueberry News Aggregator - Deployment Config
============================================================
📍 Region: us-east-1
👤 Profile: my-sso-profile
🔑 Account: 802026442401
✅ Account verified
============================================================
```

This gives you a clear view of where you're deploying.

## Complete Deployment Workflow

### First Time Setup (Per Account/Region)

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

# 5. Install Python dependencies
pip install -r requirements.txt

# 6. Bootstrap CDK (creates S3 buckets, IAM roles)
cdk bootstrap

# 7. Deploy!
cdk deploy
```

### Subsequent Deployments

```bash
# 1. Login to SSO (if session expired)
aws sso login --profile YOUR_PROFILE

# 2. Set environment variables
export AWS_PROFILE=YOUR_PROFILE
export AWS_REGION=us-east-1

# 3. Deploy
cd phase2_agentcore/deployment
cdk deploy
```

## Deploying to Multiple Accounts

### Account A (Development)

```bash
# Login to dev account
aws sso login --profile dev-profile

# Set variables
export AWS_PROFILE=dev-profile
export AWS_REGION=us-east-1

# Update expected account in app.py
# EXPECTED_ACCOUNT_ID = "111111111111"

# Deploy
cdk deploy
```

### Account B (Production)

```bash
# Login to prod account
aws sso login --profile prod-profile

# Set variables
export AWS_PROFILE=prod-profile
export AWS_REGION=us-east-1

# Update expected account in app.py
# EXPECTED_ACCOUNT_ID = "222222222222"

# Deploy
cdk deploy
```

## Deploying to Multiple Regions

### Same Account, Different Regions

```bash
# Deploy to us-east-1
export AWS_REGION=us-east-1
cdk bootstrap  # First time only
cdk deploy

# Deploy to eu-west-1
export AWS_REGION=eu-west-1
cdk bootstrap  # First time only
cdk deploy

# Deploy to us-west-2
export AWS_REGION=us-west-2
cdk bootstrap  # First time only
cdk deploy
```

Each region gets its own:

- ECR repository
- Agent Core Runtime
- IAM roles
- CloudWatch Logs

## Account Safety Check

The code includes a safety check to prevent deploying to the wrong account:

```python
# In app.py
EXPECTED_ACCOUNT_ID = "802026442401"
```

**To use with multiple accounts:**

1. **Option A**: Update `EXPECTED_ACCOUNT_ID` before each deployment
2. **Option B**: Set it to `None` to disable the check (not recommended)
3. **Option C**: Use different branches/directories for different accounts

## Environment Variables Reference

| Variable              | Required    | Purpose           | Example          |
| --------------------- | ----------- | ----------------- | ---------------- |
| `AWS_REGION`          | ✅ Yes      | Deployment region | `us-east-1`      |
| `AWS_PROFILE`         | ⚠️ SSO only | AWS profile name  | `my-sso-profile` |
| `EXPECTED_ACCOUNT_ID` | ❌ No       | In code, not env  | `802026442401`   |

## Troubleshooting

### "AWS_REGION environment variable not set"

```bash
export AWS_REGION=us-east-1
```

### "Account mismatch"

Update `EXPECTED_ACCOUNT_ID` in `app.py` or switch to the correct profile:

```bash
aws sso login --profile correct-profile
export AWS_PROFILE=correct-profile
```

### "SSO session expired"

```bash
aws sso login --profile YOUR_PROFILE
```

### "Deploying to wrong region"

Always set `AWS_REGION` explicitly:

```bash
export AWS_REGION=us-east-1
```

The code will NOT read from your AWS config files.

### "CDK bootstrap required"

Bootstrap is needed once per account/region combination:

```bash
export AWS_REGION=us-east-1
cdk bootstrap
```

## Quick Reference

```bash
# Complete deployment command
aws sso login --profile YOUR_PROFILE && \
export AWS_PROFILE=YOUR_PROFILE && \
export AWS_REGION=us-east-1 && \
cd phase2_agentcore/deployment && \
cdk deploy
```

## What Gets Deployed

Each deployment creates:

- **Stack Name**: `Christian-Blueberry-News-Agent`
- **Runtime Name**: `Christian_Blueberry_News_Agent`
- **IAM Role**: `Christian-Blueberry-News-Agent-ExecutionRole`
- **ECR Repository**: Auto-created by CDK
- **CloudWatch Logs**: `/aws/bedrock-agentcore/Christian_Blueberry_News_Agent`

All resources include "Christian Blueberry" in their names for easy identification in the AWS Console.

## Cleanup

To delete all resources:

```bash
# Set the same profile and region used for deployment
export AWS_PROFILE=YOUR_PROFILE
export AWS_REGION=us-east-1

# Destroy
cd phase2_agentcore/deployment
cdk destroy
```

## Best Practices

1. **Always set AWS_REGION explicitly** - Don't rely on config files
2. **Verify account before deployment** - Check `aws sts get-caller-identity`
3. **Use descriptive profile names** - e.g., `dev-account`, `prod-account`
4. **Bootstrap per account/region** - Run `cdk bootstrap` once per combination
5. **Keep SSO sessions fresh** - Login before each deployment session
6. **Document your accounts** - Keep a list of account IDs and their purposes

## Files Modified

- `app.py` - Added explicit region requirement and SSO support
- `DEPLOY.md` - Updated with SSO instructions
- `TROUBLESHOOTING.md` - Added region and SSO troubleshooting
- `QUICK_DEPLOY.md` - Quick reference for SSO deployment

## Summary

The deployment now:

- ✅ Requires explicit region configuration
- ✅ Works with AWS SSO
- ✅ Shows clear deployment info (account, region, profile)
- ✅ Prevents accidental wrong-region deployments
- ✅ Supports multiple accounts and regions
- ✅ Includes account safety checks

Happy deploying! 🚀
