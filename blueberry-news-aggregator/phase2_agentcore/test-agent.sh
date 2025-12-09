#!/bin/bash
# Test Christian Blueberry News Agent

echo "🫐 Testing Christian Blueberry News Agent"
echo "=========================================="
echo ""

# Your Runtime ARN
RUNTIME_ARN="arn:aws:bedrock-agentcore:us-east-1:802026442401:runtime/Christian_Blueberry_News_Agent-hwiDTBBBt7/runtime-endpoint/DEFAULT"

echo "Runtime ARN: $RUNTIME_ARN"
echo ""

# Check CloudWatch Logs to see if agent is running
echo "📊 Checking CloudWatch Logs..."
echo ""

aws logs tail /aws/bedrock-agentcore/Christian_Blueberry_News_Agent --since 5m

echo ""
echo "=========================================="
echo ""
echo "Note: AWS CLI doesn't support bedrock-agentcore yet."
echo "To test the agent, use one of these methods:"
echo ""
echo "1. AWS Console:"
echo "   https://console.aws.amazon.com/bedrock-agentcore/"
echo ""
echo "2. Python script:"
echo "   python test_deployed_agent.py"
echo ""
