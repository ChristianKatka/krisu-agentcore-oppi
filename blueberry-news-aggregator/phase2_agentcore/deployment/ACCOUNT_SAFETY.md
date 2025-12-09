# 🔒 AWS Account Safety Check

## Why This Matters

The account verification prevents you from accidentally deploying to the **wrong AWS account**. This is especially important if you:

- Have multiple AWS accounts
- Work with different AWS profiles
- Share your computer with others

## Setup (One-Time)

### Step 1: Get Your Account ID

```bash
cd phase2_agentcore/deployment
python get_account_id.py
```

You'll see:

```
============================================================
Your AWS Account Information
============================================================
Account ID: 123456789012
User/Role:  arn:aws:iam::123456789012:user/christian
============================================================
```

### Step 2: Update app.py

Open `app.py` and find this line:

```python
EXPECTED_ACCOUNT_ID = "YOUR_ACCOUNT_ID_HERE"
```

Replace with your actual account ID:

```python
EXPECTED_ACCOUNT_ID = "123456789012"  # Your account ID
```

### Step 3: Save the File

That's it! Now every deployment will verify the account.

## How It Works

When you run `cdk deploy`, the script will:

1. **Check current AWS account**

   ```
   🔍 Current AWS Account: 123456789012
   ```

2. **Compare with expected account**

   - ✅ **Match**: Deployment continues
   - ❌ **Mismatch**: Deployment stops with error

3. **Show verification**
   ```
   ✅ Account verified: 123456789012
   ```

## Example: Successful Verification

```bash
$ cdk deploy

🔍 Current AWS Account: 123456789012
✅ Account verified: 123456789012

Synthesizing...
Deploying Christian-Blueberry-News-Agent...
```

## Example: Account Mismatch (Prevented!)

```bash
$ cdk deploy

🔍 Current AWS Account: 999999999999
❌ ERROR: Account mismatch!
   Expected: 123456789012
   Current:  999999999999

You're about to deploy to the WRONG AWS account!
```

**Deployment stops! Your resources are safe!** 🛡️

## If You Haven't Set Account ID Yet

If you run `cdk deploy` without setting your account ID:

```
⚠️  WARNING: EXPECTED_ACCOUNT_ID not set in app.py
⚠️  Please set your AWS account ID for safety!
Continue anyway? (yes/no):
```

You can:

- Type `no` to cancel and set it up properly
- Type `yes` to continue (not recommended)

## Multiple AWS Accounts?

If you work with multiple AWS accounts, you can:

### Option 1: Use AWS Profiles

```bash
# Deploy to account 1
export AWS_PROFILE=account1
cdk deploy

# Deploy to account 2
export AWS_PROFILE=account2
cdk deploy
```

Update `EXPECTED_ACCOUNT_ID` based on which profile you're using.

### Option 2: Comment Out Check

If you need to deploy to different accounts frequently:

```python
# Temporarily disable check
# EXPECTED_ACCOUNT_ID = "123456789012"
EXPECTED_ACCOUNT_ID = "YOUR_ACCOUNT_ID_HERE"  # Will prompt
```

## Quick Commands

```bash
# Get your account ID
python get_account_id.py

# Check current AWS account
aws sts get-caller-identity

# Deploy (with verification)
cdk deploy

# Deploy to specific profile
AWS_PROFILE=myprofile cdk deploy
```

## Benefits

✅ **Prevents mistakes** - Can't deploy to wrong account
✅ **Peace of mind** - Know exactly where you're deploying
✅ **Easy to set up** - Just one line to change
✅ **Clear errors** - Shows exactly what's wrong
✅ **No extra cost** - Just a safety check

## Summary

1. Run `python get_account_id.py`
2. Copy your account ID
3. Update `EXPECTED_ACCOUNT_ID` in `app.py`
4. Deploy safely! 🛡️

**Your resources are now protected from accidental deployment to wrong accounts!**
