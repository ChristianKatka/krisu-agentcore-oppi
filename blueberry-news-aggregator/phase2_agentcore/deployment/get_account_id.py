#!/usr/bin/env python3
"""
Helper script to get your AWS account ID
Run this to find your account ID, then update app.py
"""

import boto3

try:
    sts = boto3.client('sts')
    identity = sts.get_caller_identity()
    
    account_id = identity['Account']
    user_arn = identity['Arn']
    
    print("=" * 60)
    print("Your AWS Account Information")
    print("=" * 60)
    print(f"Account ID: {account_id}")
    print(f"User/Role:  {user_arn}")
    print("=" * 60)
    print()
    print("📝 Next Steps:")
    print("1. Copy your Account ID above")
    print("2. Open: phase2_agentcore/deployment/app.py")
    print("3. Replace this line:")
    print('   EXPECTED_ACCOUNT_ID = "YOUR_ACCOUNT_ID_HERE"')
    print("4. With:")
    print(f'   EXPECTED_ACCOUNT_ID = "{account_id}"')
    print()
    print("This will prevent accidental deployment to wrong account!")
    print("=" * 60)
    
except Exception as e:
    print(f"❌ Error: {e}")
    print()
    print("Make sure AWS credentials are configured:")
    print("  aws configure")
