"""
Test script for deployed Blueberry News Agent
Run this after deploying to AWS Agent Core
"""

import boto3
import json
import sys

def test_agent(runtime_arn: str, query: str = "What are the latest tech news?"):
    """
    Test the deployed agent
    
    Args:
        runtime_arn: The Agent Runtime ARN from CDK outputs
        query: The question to ask the agent
    """
    print("🫐 Testing Blueberry News Agent")
    print("=" * 60)
    print(f"Runtime ARN: {runtime_arn}")
    print(f"Query: {query}")
    print("=" * 60)
    print()
    
    try:
        # Create Bedrock AgentCore client
        client = boto3.client('bedrock-agentcore', region_name='us-east-1')
        
        print("📤 Sending request...")
        
        # Invoke the agent
        response = client.invoke_agent_runtime(
            agentRuntimeArn=runtime_arn,
            qualifier='DEFAULT',
            payload=json.dumps({"prompt": query})
        )
        
        print("📥 Received response!")
        print()
        
        # Handle different response types
        content_type = response.get("contentType", "")
        
        if "text/event-stream" in content_type:
            # Streaming response
            print("📰 Agent Response (streaming):")
            print("-" * 60)
            for line in response["response"].iter_lines():
                if line:
                    decoded = line.decode("utf-8")
                    if decoded.startswith("data: "):
                        decoded = decoded[6:]
                    print(decoded)
            print("-" * 60)
        
        elif content_type == "application/json":
            # JSON response
            content = []
            for chunk in response.get("response", []):
                content.append(chunk.decode('utf-8'))
            
            response_data = json.loads(''.join(content))
            print("📰 Agent Response (JSON):")
            print("-" * 60)
            print(json.dumps(response_data, indent=2))
            print("-" * 60)
        
        else:
            # Other response types
            response_body = response['response'].read()
            print("📰 Agent Response:")
            print("-" * 60)
            print(response_body.decode('utf-8'))
            print("-" * 60)
        
        print()
        print("✅ Test successful!")
        return True
    
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def get_runtime_arn_from_stack(stack_name: str = "Christian-Blueberry-News-Agent"):
    """Get Runtime ARN from CloudFormation stack outputs"""
    try:
        cf_client = boto3.client('cloudformation', region_name='us-east-1')
        
        response = cf_client.describe_stacks(StackName=stack_name)
        outputs = response['Stacks'][0]['Outputs']
        
        for output in outputs:
            if output['OutputKey'] == 'AgentRuntimeArn':
                return output['OutputValue']
        
        return None
    except Exception as e:
        print(f"Error getting Runtime ARN: {e}")
        return None

if __name__ == "__main__":
    print()
    
    # Check if Runtime ARN provided as argument
    if len(sys.argv) > 1:
        runtime_arn = sys.argv[1]
        query = sys.argv[2] if len(sys.argv) > 2 else "What are the latest tech news?"
    else:
        # Try to get from CloudFormation stack
        print("🔍 Looking for Runtime ARN in CloudFormation stack...")
        runtime_arn = get_runtime_arn_from_stack()
        
        if not runtime_arn:
            print()
            print("❌ Runtime ARN not found!")
            print()
            print("Usage:")
            print("  python test_deployed_agent.py <RUNTIME_ARN> [query]")
            print()
            print("Example:")
            print("  python test_deployed_agent.py arn:aws:bedrock-agentcore:us-east-1:123456789:runtime/abc123")
            print()
            print("Or get it from CloudFormation:")
            print("  aws cloudformation describe-stacks --stack-name Christian-Blueberry-News-Agent \\")
            print("    --query 'Stacks[0].Outputs[?OutputKey==`ChristianBlueberryAgentRuntimeArn`].OutputValue' \\")
            print("    --output text")
            print()
            sys.exit(1)
        
        query = "What are the latest tech news?"
        print(f"✅ Found Runtime ARN: {runtime_arn}")
        print()
    
    # Test the agent
    success = test_agent(runtime_arn, query)
    
    print()
    if success:
        print("🎉 Your Blueberry agent is working in the cloud!")
    else:
        print("😞 Test failed. Check the error above.")
    print()
