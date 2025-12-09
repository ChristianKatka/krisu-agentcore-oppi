import boto3
import json

RUNTIME_ARN = "arn:aws:bedrock-agentcore:us-east-1:802026442401:runtime/Christian_Blueberry_Agentcore_Runtime-2aqfbG44kQ"
QUERY = "What are the latest tech news?"

print(f"Testing agent...")
print(f"Query: {QUERY}")
print()

client = boto3.client('bedrock-agentcore', region_name='us-east-1')

response = client.invoke_agent_runtime(
    agentRuntimeArn=RUNTIME_ARN,
    qualifier='DEFAULT',
    payload=json.dumps({"prompt": QUERY})
)

response_text = response['response'].read().decode('utf-8')
print("Response:")
print(response_text)
