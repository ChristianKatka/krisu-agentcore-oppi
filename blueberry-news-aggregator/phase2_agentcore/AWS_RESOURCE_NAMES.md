# 🏷️ AWS Resource Names - Easy to Find!

All AWS resources are named with **"Christian Blueberry"** so you can easily find them in the AWS Console.

## 📋 Resource Names

### CloudFormation Stack

**Name**: `Christian-Blueberry-News-Agent`

**Where to find**:

- [CloudFormation Console](https://console.aws.amazon.com/cloudformation/)
- Search for: "Christian Blueberry"

---

### Agent Core Runtime

**Name**: `Christian_Blueberry_News_Agent`

**Description**: "Christian Blueberry News Aggregator - Fetches tech, AI, and world news from HackerNews and Dev.to"

**Where to find**:

- [Bedrock AgentCore Console](https://console.aws.amazon.com/bedrock-agentcore/)
- Click "Runtimes"
- Search for: "Christian Blueberry"

---

### IAM Role

**Name**: `Christian-Blueberry-News-Agent-ExecutionRole`

**Description**: "Execution role for Christian Blueberry News Aggregator Agent"

**Where to find**:

- [IAM Console](https://console.aws.amazon.com/iam/)
- Click "Roles"
- Search for: "Christian-Blueberry"

**Permissions**:

- Bedrock model invocation (Nova Pro)
- CloudWatch Logs

---

### IAM Policy

**Name**: `ChristianBlueberryNewsAgentPolicy`

**Attached to**: Christian-Blueberry-News-Agent-ExecutionRole

---

### ECR Repository

**Name**: `cdk-<hash>-container-assets-<account>-<region>`

**Contains**: Docker image with tag matching your deployment

**Where to find**:

- [ECR Console](https://console.aws.amazon.com/ecr/)
- Look for CDK-managed repository
- Image will have description: "Christian Blueberry News Agent"

---

### CloudWatch Log Group

**Name**: `/aws/bedrock-agentcore/Christian_Blueberry_News_Agent`

**Where to find**:

- [CloudWatch Console](https://console.aws.amazon.com/cloudwatch/)
- Click "Logs" → "Log groups"
- Search for: "Christian_Blueberry"

**What you'll see**:

- Agent invocations
- Tool executions (HackerNews, Dev.to)
- Errors and responses

---

## 🔍 Quick Search Tips

### In AWS Console Search Bar

Type any of these to find your resources:

- `Christian Blueberry`
- `Christian-Blueberry`
- `Christian_Blueberry`

### In CloudFormation

1. Go to [CloudFormation Console](https://console.aws.amazon.com/cloudformation/)
2. Find stack: `Christian-Blueberry-News-Agent`
3. Click "Resources" tab to see all created resources

### In Bedrock AgentCore

1. Go to [Bedrock AgentCore Console](https://console.aws.amazon.com/bedrock-agentcore/)
2. Click "Runtimes"
3. Find: `Christian_Blueberry_News_Agent`

### In CloudWatch Logs

1. Go to [CloudWatch Console](https://console.aws.amazon.com/cloudwatch/)
2. Logs → Log groups
3. Find: `/aws/bedrock-agentcore/Christian_Blueberry_News_Agent`

---

## 📊 Stack Outputs

After deployment, you'll see these outputs:

| Output Name                         | Description                 |
| ----------------------------------- | --------------------------- |
| `ChristianBlueberryAgentRuntimeId`  | Runtime ID                  |
| `ChristianBlueberryAgentRuntimeArn` | Runtime ARN (use to invoke) |
| `ChristianBlueberryAgentRoleArn`    | Execution Role ARN          |
| `ChristianBlueberryDockerImageUri`  | Docker Image URI            |

**Get outputs**:

```bash
aws cloudformation describe-stacks \
  --stack-name Christian-Blueberry-News-Agent \
  --query 'Stacks[0].Outputs'
```

---

## 🎯 Environment Variables

Your agent has these environment variables:

| Variable             | Value                          |
| -------------------- | ------------------------------ |
| `AWS_DEFAULT_REGION` | Your AWS region                |
| `AGENT_NAME`         | Christian-Blueberry-News-Agent |
| `OWNER`              | Christian                      |
| `PHASE`              | 2                              |

---

## 🧹 Cleanup

To delete all resources:

```bash
cd phase2_agentcore/deployment
cdk destroy
```

This will delete:

- ✅ CloudFormation stack: `Christian-Blueberry-News-Agent`
- ✅ Agent Runtime: `Christian_Blueberry_News_Agent`
- ✅ IAM Role: `Christian-Blueberry-News-Agent-ExecutionRole`
- ✅ ECR images
- ✅ CloudWatch logs

---

## 📝 Summary

**Everything is named with "Christian Blueberry"!**

Just search for "Christian Blueberry" in any AWS console and you'll find all your resources. Easy! 🫐
