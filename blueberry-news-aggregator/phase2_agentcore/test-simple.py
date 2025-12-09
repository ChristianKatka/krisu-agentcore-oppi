#!/usr/bin/env python3
"""
Simple test for Christian Blueberry News Agent
Just 10 lines of actual code!
"""

import boto3
import json

# Your agent's ARN (without /runtime-endpoint/DEFAULT)
RUNTIME_ARN = "arn:aws:bedrock-agentcore:us-east-1:802026442401:runtime/Christian_Blueberry_News_Agent-hwiDTBBBt7"

# What to ask
QUERY = "What are the latest tech news?"

print("🫐 Testing Christian Blueberry News Agent")
print("=" * 60)
print(f"Query: {QUERY}")
print("=" * 60)
print()

# Create client and invoke
client = boto3.client('bedrock-agentcore', region_name='us-east-1')

response = client.invoke_agent_runtime(
    agentRuntimeArn=RUNTIME_ARN,
    qualifier='DEFAULT',
    payload=json.dumps({"prompt": QUERY})
)

# Print response
print("📰 Response:")
print("-" * 60)
response_body = response['response'].read().decode('utf-8')
print(response_body)
print("-" * 60)
print()
print("✅ Done!")
