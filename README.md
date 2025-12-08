# AWS Agent Core + Strands Agents Project

This project demonstrates how to build and deploy a Strands Agent to AWS Agent Core.

## What is AWS Agent Core?

- **Agent Core Runtime**: Hosts and runs your agents
- **Agent Core Gateway**: Exposes API endpoints (e.g., risun-reseptit.fi/get)
- **Agent Core Identity**: Handles authentication via AWS Cognito

## Prerequisites

- AWS Account with Agent Core access
- Node.js 18+ or Python 3.9+
- AWS CLI configured
- Strands SDK

## Project Structure

```
├── agent/              # Your Strands agent code
├── infrastructure/     # AWS CDK/CloudFormation for deployment
├── config/            # Configuration files
└── tests/             # Agent tests
```

## Quick Start

1. Install dependencies
2. Configure AWS credentials
3. Build your agent
4. Deploy to Agent Core

## Resources

- [Strands Agents Documentation](https://strandsagents.com)
- [AWS Agent Core Documentation](https://docs.aws.amazon.com/bedrock/)
