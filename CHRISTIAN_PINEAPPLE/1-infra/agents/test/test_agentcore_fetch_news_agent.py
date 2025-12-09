import json
import requests
from urllib.parse import quote
import uuid

RUNTIME_ARN = "arn:aws:bedrock-agentcore:us-east-1:802026442401:runtime/ChristianPineapple_fetch_news_agent_runtime-pIPluqC4e3"
QUERY = "What are the latest tech news?"

print(f"Testing agent...")
print(f"Query: {QUERY}")
print()

# Build the URL with encoded ARN
escaped_arn = quote(RUNTIME_ARN, safe='')
url = f"https://bedrock-agentcore.us-east-1.amazonaws.com/runtimes/{escaped_arn}/invocations"

# Generate session ID
session_id = str(uuid.uuid4())

# Prepare headers (no auth)
headers = {
    'Content-Type': 'application/json',
    'X-Amzn-Bedrock-AgentCore-Runtime-Session-Id': session_id,
}

# Prepare payload
payload = json.dumps({"prompt": QUERY})

# Make the request
response = requests.post(url, headers=headers, data=payload)

print(f"Status: {response.status_code}")
print("Response:")
print(response.text)
