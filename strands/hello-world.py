import os
from strands import Agent

# Set AWS region
os.environ["AWS_DEFAULT_REGION"] = "us-east-1"

# Create an agent with default settings
agent = Agent()

# Ask the agent a question
agent("Tell me about agentic AI")
