#!/usr/bin/env python3

import aws_cdk as cdk
import boto3
import sys
import os
from stacks.fetch_news_agent_stack.fetch_news_agent_stack import FetchNewsAgentStack


EXPECTED_ACCOUNT_ID = "802026442401" 
REGION = "us-east-1"


def verify_correct_aws_account():
    """Check if deploying to correct AWS account"""
    sts = boto3.client('sts')
    current_account = sts.get_caller_identity()['Account']
    
    if current_account != EXPECTED_ACCOUNT_ID:
        print(f"❌ Wrong account! Expected {EXPECTED_ACCOUNT_ID}, got {current_account}")
        sys.exit(1)
    
    print(f"✅ Deploying to account {current_account}")
    return current_account

# Verify account before deploying
account = verify_correct_aws_account()

# Create CDK app
app = cdk.App()

envConfig = cdk.Environment(
        account=account,
        region=REGION
    )

FetchNewsAgentStack(
    app, 
    "Christian-Blueberry-Fetch-News-Agent",
    description="Christian Blueberry Fetch News Aggregator - Fetches news from HackerNews and Dev.to",
    env=envConfig
)

app.synth()
