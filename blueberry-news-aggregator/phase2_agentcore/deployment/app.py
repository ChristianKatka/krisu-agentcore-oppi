#!/usr/bin/env python3
"""
Christian Blueberry News Aggregator - CDK App
Entry point for AWS CDK deployment

IMPORTANT: This script requires explicit region configuration.
Set AWS_REGION environment variable before deployment:
  export AWS_REGION=us-east-1
  cdk deploy
"""

import aws_cdk as cdk
import boto3
import sys
import os
from blueberry_stack import BlueberryNewsStack

# ============================================
# CONFIGURATION
# ============================================
# Set your AWS account ID here to prevent accidental deployment to wrong account
EXPECTED_ACCOUNT_ID = "802026442401"  # Replace with your actual account ID

# Region MUST be explicitly set via environment variable
# This ensures you always know which region you're deploying to
REQUIRED_REGION_ENV_VAR = "AWS_REGION"

def get_deployment_config():
    """
    Get deployment configuration (account, region, profile)
    Works with AWS SSO and standard credentials
    """
    print("=" * 60)
    print("🚀 Christian Blueberry News Aggregator - Deployment Config")
    print("=" * 60)
    
    # 1. Get AWS Region (MUST be explicitly set)
    region = os.environ.get(REQUIRED_REGION_ENV_VAR)
    if not region:
        print(f"❌ ERROR: {REQUIRED_REGION_ENV_VAR} environment variable not set!")
        print()
        print("You MUST explicitly specify the deployment region:")
        print(f"  export {REQUIRED_REGION_ENV_VAR}=us-east-1")
        print(f"  cdk deploy")
        print()
        print("This ensures you always know which region you're deploying to.")
        sys.exit(1)
    
    print(f"📍 Region: {region}")
    
    # 2. Get AWS Profile (if using SSO or named profiles)
    profile = os.environ.get('AWS_PROFILE')
    if profile:
        print(f"👤 Profile: {profile}")
    else:
        print(f"👤 Profile: (default)")
    
    # 3. Get current AWS account ID
    try:
        # Create session with explicit region
        session = boto3.Session(region_name=region)
        sts = session.client('sts')
        current_account = sts.get_caller_identity()['Account']
        
        print(f"🔑 Account: {current_account}")
        
        # 4. Verify account matches expected
        if EXPECTED_ACCOUNT_ID and EXPECTED_ACCOUNT_ID != "YOUR_ACCOUNT_ID_HERE":
            if current_account != EXPECTED_ACCOUNT_ID:
                print()
                print(f"❌ ERROR: Account mismatch!")
                print(f"   Expected: {EXPECTED_ACCOUNT_ID}")
                print(f"   Current:  {current_account}")
                print()
                print("You're about to deploy to the WRONG AWS account!")
                sys.exit(1)
            print(f"✅ Account verified")
        else:
            print(f"⚠️  WARNING: EXPECTED_ACCOUNT_ID not set in app.py")
            print(f"⚠️  Consider setting it for safety!")
        
        print("=" * 60)
        print()
        
        return {
            'account': current_account,
            'region': region,
            'profile': profile
        }
        
    except Exception as e:
        print()
        print(f"❌ Error getting AWS credentials: {e}")
        print()
        print("Make sure you're authenticated:")
        print("  - For SSO: aws sso login --profile YOUR_PROFILE")
        print("  - For standard: aws configure")
        print()
        print("Then set your profile:")
        print("  export AWS_PROFILE=YOUR_PROFILE")
        sys.exit(1)

# Get deployment configuration
config = get_deployment_config()

# Create CDK app
app = cdk.App()

BlueberryNewsStack(
    app, 
    "Christian-Blueberry-News-Agent",
    description="Christian Blueberry News Aggregator - Fetches tech, AI, and world news from HackerNews and Dev.to",
    env=cdk.Environment(
        account=config['account'],
        region=config['region']
    )
)

app.synth()
