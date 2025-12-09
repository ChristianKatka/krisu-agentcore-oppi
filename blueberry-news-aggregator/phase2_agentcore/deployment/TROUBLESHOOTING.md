# 🔧 Troubleshooting CDK Deployment

## Error: "ENAMETOOLONG: name too long"

### Problem

```
Error: ENAMETOOLONG: name too long, copyfile
```

This happens when CDK tries to copy the `cdk.out` directory recursively into itself during Docker build.

### Solution

**Step 1: Clean up cdk.out**

```bash
rm -rf cdk.out
```

**Step 2: Verify .dockerignore exists**

Make sure `blueberry-news-aggregator/.dockerignore` exists and contains:

```
phase2_agentcore/deployment/cdk.out/
**/cdk.out/
```

**Step 3: Try deployment again**

```bash
cdk deploy
```

### Why This Happens

The Docker build context was set to the project root (`../..`), which includes the `deployment/cdk.out` directory. Without `.dockerignore`, CDK copies `cdk.out` into the Docker build, which then gets copied into `cdk.out` again, creating an infinite loop of nested directories.

### Prevention

The `.dockerignore` file now prevents this by excluding:

- `cdk.out/` directories
- Python cache files
- Virtual environments
- Unnecessary files

---

## Error: "CDK bootstrap required"

### Problem

```
Error: This stack uses assets, so the toolkit stack must be deployed
```

### Solution

```bash
cdk bootstrap
```

Only needed once per account/region.

---

## Error: "Docker not running"

### Problem

```
Error: Cannot connect to the Docker daemon
```

### Solution

1. Start Docker Desktop
2. Wait for it to fully start
3. Verify: `docker ps`
4. Try again: `cdk deploy`

---

## Error: "No model access"

### Problem

Agent can't invoke Bedrock models.

### Solution

1. Go to [Bedrock Console](https://console.aws.amazon.com/bedrock/)
2. Click "Model access"
3. Click "Manage model access"
4. Enable "Amazon Nova Pro"
5. Save changes
6. Wait a few minutes
7. Try invoking agent again

---

## Error: "AWS_REGION environment variable not set"

### Problem

```
❌ ERROR: AWS_REGION environment variable not set!
```

### Solution

You MUST explicitly set the deployment region:

```bash
export AWS_REGION=us-east-1
cdk deploy
```

Or use your preferred region:

```bash
export AWS_REGION=eu-west-1
export AWS_REGION=us-west-2
```

### Why This Is Required

The code requires explicit region configuration to ensure you always know which region you're deploying to. This is especially important when:

- Using AWS SSO with multiple accounts
- Deploying to different regions
- Working with multiple AWS profiles

The code will NOT read from your AWS config files to prevent accidental deployments to the wrong region.

---

## Error: "Deploying to wrong region"

### Problem

CDK is deploying to a different region than expected (e.g., eu-west-1 instead of us-east-1).

### Solution

**Always set AWS_REGION explicitly:**

```bash
export AWS_REGION=us-east-1
cdk deploy
```

**For AWS SSO users:**

```bash
# Login to SSO
aws sso login --profile YOUR_PROFILE

# Set profile AND region
export AWS_PROFILE=YOUR_PROFILE
export AWS_REGION=us-east-1

# Verify
aws sts get-caller-identity

# Deploy
cdk deploy
```

---

## Error: "Account mismatch"

### Problem

```
❌ ERROR: Account mismatch!
   Expected: 123456789012
   Current:  999999999999
```

### Solution

**Option 1: Update expected account**

```python
# In app.py
EXPECTED_ACCOUNT_ID = "999999999999"  # Update to current account
```

**Option 2: Switch AWS profile**

```bash
export AWS_PROFILE=correct-profile
export AWS_REGION=us-east-1  # Don't forget region!
cdk deploy
```

**Option 3: Check credentials**

```bash
aws sts get-caller-identity
```

---

## Error: "Permission denied"

### Problem

```
Error: User is not authorized to perform: bedrock-agentcore:CreateRuntime
```

### Solution

Your AWS user/role needs these permissions:

- `bedrock-agentcore:*`
- `ecr:*`
- `iam:CreateRole`
- `iam:AttachRolePolicy`
- `cloudformation:*`

Contact your AWS administrator to grant these permissions.

---

## Deployment Hangs

### Problem

Deployment seems stuck at "Building Docker image..."

### Solution

**Check Docker**:

```bash
docker ps
docker images
```

**Check Docker logs**:

```bash
docker logs $(docker ps -q | head -1)
```

**Restart Docker**:

1. Quit Docker Desktop
2. Start Docker Desktop
3. Try again

---

## Clean Start

If everything is broken, start fresh:

```bash
# 1. Clean CDK output
rm -rf cdk.out

# 2. Clean Python cache
find . -type d -name __pycache__ -exec rm -r {} +
find . -type f -name "*.pyc" -delete

# 3. Reinstall dependencies
pip install -r requirements.txt

# 4. Bootstrap CDK (if needed)
cdk bootstrap

# 5. Try deployment
cdk deploy
```

---

## Still Having Issues?

### Check CDK Version

```bash
cdk --version
```

Need 2.220.0 or later. Update:

```bash
npm install -g aws-cdk@latest
```

### Check Python Version

```bash
python --version
```

Need Python 3.10+.

### Check AWS Credentials

```bash
aws sts get-caller-identity
```

Should show your account ID and user.

### Check Docker

```bash
docker --version
docker ps
```

Docker should be running.

---

## Quick Fixes

```bash
# Clean everything
rm -rf cdk.out
find . -name __pycache__ -exec rm -r {} +

# Verify setup
cdk --version          # Should be 2.220.0+
python --version       # Should be 3.10+
docker ps              # Should work
aws sts get-caller-identity  # Should show your account

# Deploy
cdk deploy
```

---

## Get Help

If you're still stuck:

1. Check the error message carefully
2. Look for the specific error in this guide
3. Try the "Clean Start" steps above
4. Check AWS CloudFormation console for stack events
5. Check CloudWatch logs for runtime errors

**Most common fix**: Delete `cdk.out` and try again! 🔧
