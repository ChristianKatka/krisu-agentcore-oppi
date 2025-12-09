# Agent Core CloudWatch Observability

## Overview

AWS Agent Core provides built-in observability through Amazon CloudWatch using OpenTelemetry instrumentation. This allows you to monitor, trace, and debug your deployed agents in production.

## Key Concepts

### What Gets Monitored

When you deploy an Agent Core agent with observability enabled:

- **Traces**: Complete execution paths through your agent
- **Logs**: Application logs and system events
- **Metrics**: Performance data and resource usage
- **Transaction Search**: Query and filter traces by attributes

### OpenTelemetry Integration

Agent Core automatically instruments your code with OpenTelemetry when deployed using the `bedrock-agentcore-starter-toolkit`. This means:

- No manual instrumentation code needed
- Automatic trace collection
- Automatic log aggregation
- Automatic metric collection

## Deployment with Observability

### Prerequisites

1. **Python 3.10+**
2. **AWS credentials** with CloudWatch access
3. **Docker running** (for containerization)
4. **Amazon CloudWatch Access**
5. **Enable Transaction Search** in CloudWatch (IMPORTANT!)
   - See: https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Enable-TransactionSearch.html

### Automatic Instrumentation

When you use `bedrock_agentcore_starter_toolkit` to configure your agent, it automatically adds OpenTelemetry instrumentation to your Dockerfile:

```dockerfile
CMD ["opentelemetry-instrument", "python", "your_agent.py"]
```

This command wraps your Python application with OpenTelemetry, capturing:

- HTTP requests/responses
- Function calls
- Database queries (if applicable)
- External API calls
- Errors and exceptions

### Deployment Steps

```python
from bedrock_agentcore_starter_toolkit import Runtime
from boto3.session import Session

boto_session = Session()
region = boto_session.region_name

# Initialize runtime
agentcore_runtime = Runtime()
agent_name = "my_agent_with_observability"

# Configure with automatic observability
response = agentcore_runtime.configure(
    entrypoint="my_agent.py",
    auto_create_execution_role=True,
    auto_create_ecr=True,
    requirements_file="requirements.txt",
    region=region,
    agent_name=agent_name,
    memory_mode='NO_MEMORY'  # or 'SHORT_TERM' or 'LONG_TERM'
)

# Launch to Agent Core Runtime
launch_result = agentcore_runtime.launch()

# Check status
status_response = agentcore_runtime.status()
```

## Viewing Observability Data in CloudWatch

### 1. Transaction Search

Transaction Search allows you to query traces by various attributes:

**Access**: CloudWatch Console → Transaction Search

**Query Examples**:

- Find all traces for a specific agent
- Filter by execution time
- Search for errors
- Find traces with specific attributes

**Attributes You Can Search**:

- Agent ARN
- Execution time
- Status (success/failure)
- Custom attributes you add
- Request/response data

### 2. Traces

Traces show the complete execution path of a request through your agent:

**What You See**:

- Timeline of operations
- Duration of each step
- Parent-child relationships
- Tool calls
- LLM invocations
- External API calls

**Access**: CloudWatch Console → X-Ray → Traces

**Benefits**:

- Identify bottlenecks
- Debug slow requests
- Understand execution flow
- Find error sources

### 3. Logs

All application logs are automatically sent to CloudWatch Logs:

**Access**: CloudWatch Console → Logs → Log Groups

**Log Group Name**: `/aws/bedrock-agentcore/<agent-name>`

**What Gets Logged**:

- Application print statements
- System events
- Error messages
- Debug information
- Custom log entries

### 4. Metrics

CloudWatch automatically collects metrics:

**Common Metrics**:

- Invocation count
- Error rate
- Duration (p50, p90, p99)
- Memory usage
- CPU usage

**Access**: CloudWatch Console → Metrics

## Example: Strands Agent with Bedrock Model

Here's a complete example showing how observability works:

```python
from strands import Agent, tool
from strands_tools import calculator
from bedrock_agentcore.runtime import BedrockAgentCoreApp
from strands.models import BedrockModel

# Initialize Agent Core App
app = BedrockAgentCoreApp()

# Create custom tool
@tool
def weather():
    \"\"\" Get weather \"\"\"
    return "sunny"

# Configure model
model_id = "us.amazon.nova-pro-v1:0"  # or any Bedrock model
model = BedrockModel(model_id=model_id)

# Create agent
agent = Agent(
    model=model,
    tools=[calculator, weather],
    system_prompt="You're a helpful assistant."
)

# Entrypoint with observability
@app.entrypoint
def my_agent(payload):
    \"\"\"
    This function is automatically instrumented with OpenTelemetry
    All operations inside will be traced
    \"\"\"
    user_input = payload.get("prompt")
    print("User input:", user_input)  # This goes to CloudWatch Logs

    # This LLM call is traced
    response = agent(user_input)

    return response.message['content'][0]['text']

if __name__ == "__main__":
    app.run()
```

## What Happens Behind the Scenes

When you deploy this agent:

1. **Dockerfile Generation**: Toolkit creates Dockerfile with OpenTelemetry
2. **Container Build**: Docker image built with instrumentation
3. **ECR Push**: Image pushed to Amazon ECR
4. **Runtime Creation**: Agent Core Runtime created
5. **Automatic Instrumentation**: OpenTelemetry wraps your code
6. **Data Collection**: Traces, logs, metrics sent to CloudWatch

## Viewing Your Agent's Traces

### Step 1: Invoke Your Agent

```python
invoke_response = agentcore_runtime.invoke({
    "prompt": "What is the weather now?"
})
```

### Step 2: Go to CloudWatch Console

1. Open AWS Console
2. Navigate to CloudWatch
3. Choose **Transaction Search** or **X-Ray Traces**

### Step 3: Find Your Trace

**In Transaction Search**:

- Filter by agent ARN
- Filter by time range
- Search for specific attributes

**In X-Ray**:

- View trace timeline
- See all operations
- Drill into specific spans
- View errors and exceptions

### Step 4: Analyze

**Look For**:

- Total execution time
- Time spent in LLM calls
- Time spent in tool execution
- Any errors or exceptions
- Request/response payloads

## Best Practices

### 1. Add Custom Attributes

You can add custom attributes to traces for better filtering:

```python
from opentelemetry import trace

@app.entrypoint
def my_agent(payload):
    tracer = trace.get_tracer(__name__)

    with tracer.start_as_current_span("custom_operation") as span:
        span.set_attribute("user_id", payload.get("user_id"))
        span.set_attribute("request_type", "query")

        # Your agent logic here
        response = agent(payload.get("prompt"))

        span.set_attribute("response_length", len(response))

    return response
```

### 2. Use Structured Logging

Instead of plain print statements:

```python
import logging

logger = logging.getLogger(__name__)

@app.entrypoint
def my_agent(payload):
    logger.info("Processing request", extra={
        "user_id": payload.get("user_id"),
        "prompt_length": len(payload.get("prompt", ""))
    })

    response = agent(payload.get("prompt"))

    logger.info("Request completed", extra={
        "response_length": len(response)
    })

    return response
```

### 3. Monitor Key Metrics

Set up CloudWatch Alarms for:

- High error rates
- Slow response times
- Memory/CPU usage spikes
- Invocation count anomalies

### 4. Enable Transaction Search

**CRITICAL**: You MUST enable Transaction Search in CloudWatch to query traces effectively.

Without it, you can only view individual traces, not search/filter them.

## Troubleshooting

### Traces Not Appearing

**Check**:

1. Is Transaction Search enabled?
2. Is your agent actually being invoked?
3. Are CloudWatch permissions correct?
4. Is OpenTelemetry instrumentation in Dockerfile?

### Logs Not Showing

**Check**:

1. Are you using print() or logging?
2. Is the log group created?
3. Do you have CloudWatch Logs permissions?
4. Check log group name: `/aws/bedrock-agentcore/<agent-name>`

### High Latency

**Use Traces To**:

1. Identify slow operations
2. Check LLM response times
3. Look for network delays
4. Find inefficient tool calls

## Cost Considerations

CloudWatch observability has costs:

- **Logs**: Per GB ingested and stored
- **Traces**: Per trace recorded
- **Metrics**: Per metric and API call

**Optimize**:

- Use log sampling in production
- Set appropriate log retention
- Filter unnecessary traces
- Use metric filters

## Summary

Agent Core's built-in observability through CloudWatch provides:

✅ **Automatic instrumentation** - No code changes needed
✅ **Complete traces** - See every operation
✅ **Centralized logs** - All logs in one place
✅ **Performance metrics** - Monitor health
✅ **Transaction search** - Query and filter traces
✅ **Production debugging** - Find issues quickly

The `bedrock-agentcore-starter-toolkit` handles all the setup automatically when you deploy your agent.

## Related Documentation

- [Enable Transaction Search](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Enable-TransactionSearch.html)
- [CloudWatch X-Ray](https://docs.aws.amazon.com/xray/)
- [OpenTelemetry Python](https://opentelemetry.io/docs/instrumentation/python/)
- [Agent Core Deployment Workflow](.kiro/notes/agent-core-deployment-workflow.md)
