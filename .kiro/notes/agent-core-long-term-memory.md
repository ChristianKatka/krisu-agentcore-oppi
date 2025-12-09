# Agent Core Long-Term Memory - Complete Guide

## Overview

Long-term memory uses **extraction strategies** to automatically identify and store important information from conversations. Unlike short-term memory (raw turns), long-term memory extracts structured data that persists beyond conversation expiry.

## Key Differences: Short-Term vs Long-Term

| Feature    | Short-Term Memory         | Long-Term Memory                 |
| ---------- | ------------------------- | -------------------------------- |
| Storage    | Raw conversation turns    | Extracted structured data        |
| Strategies | None (`strategies=[]`)    | User preferences, facts, etc.    |
| Retrieval  | `get_last_k_turns()`      | `retrieve_memories()` with query |
| Expiry     | Event expiry (7-365 days) | Persists after events expire     |
| Use case   | Recent context            | Persistent knowledge             |

## Long-Term Memory Strategies

### User Preference Strategy

Automatically extracts user preferences from conversations:

```python
from bedrock_agentcore.memory import MemoryClient
from bedrock_agentcore.memory.constants import StrategyType

client = MemoryClient(region_name='us-east-1')

memory = client.create_memory_and_wait(
    name="CulinaryAssistant",
    description="Culinary Assistant with long-term memory",
    strategies=[{
        StrategyType.USER_PREFERENCE.value: {
            "name": "UserPreferences",
            "description": "Captures user preferences",
            "namespaces": ["user/{actorId}/preferences"]
        }
    }],
    event_expiry_days=7,  # Short-term events expire after 7 days
    max_wait=300,
    poll_interval=10
)

memory_id = memory['id']
```

### Understanding Namespaces

Namespaces organize extracted memories:

```python
"namespaces": ["user/{actorId}/preferences"]
```

- `{actorId}` is replaced with actual user ID
- Example: `user/user_123/preferences`
- Allows querying specific user's preferences
- Can have multiple namespaces per strategy

## How Long-Term Memory Works

### 1. Hydrate Short-Term Memory

Save conversations to trigger extraction:

```python
actor_id = "user_123"
session_id = "session_001"

previous_messages = [
    ("Hi, I'm John", "USER"),
    ("Hi John, how can I help you?", "ASSISTANT"),
    ("I'm looking for vegetarian dishes", "USER"),
    ("Great! Do you have preferences?", "ASSISTANT"),
    ("I really like tofu and Italian cuisine", "USER"),
    ("Perfect! I can suggest pasta primavera...", "ASSISTANT")
]

# Save to short-term memory
client.create_event(
    memory_id=memory_id,
    actor_id=actor_id,
    session_id=session_id,
    messages=previous_messages
)
```

### 2. Automatic Extraction (Behind the Scenes)

After `create_event()`, the system automatically:

1. **Stores** conversation in short-term memory
2. **Detects** UserPreference strategy is configured
3. **Analyzes** conversation for preference indicators
4. **Extracts** preferences like:
   - "I'm vegetarian"
   - "I really like tofu"
   - "I enjoy Italian cuisine"
5. **Consolidates** into structured data
6. **Saves** to namespace: `user/{actorId}/preferences`

**No additional code needed!** Extraction happens automatically.

### 3. Retrieve Long-Term Memories

Query extracted preferences:

```python
import time

# Wait for extraction to complete (usually 10-30 seconds)
time.sleep(30)

namespace = f"user/{actor_id}/preferences"

# Query with semantic search
food_preferences = client.retrieve_memories(
    memory_id=memory_id,
    namespace=namespace,
    query="food preferences",
    top_k=3  # Return top 3 most relevant results
)

for i, record in enumerate(food_preferences):
    print(f"Memory {i+1}: {record.get('content')}")
```

**Output example:**

```
Memory 1: User prefers vegetarian dishes
Memory 2: User likes tofu and fresh vegetables
Memory 3: User enjoys Italian cuisine, especially pasta
```

## Using Memory Tool with Strands Agent

Strands provides `AgentCoreMemoryToolProvider` for easy integration:

```python
from strands import Agent
from strands_tools.agent_core_memory import AgentCoreMemoryToolProvider

# Create memory tool provider
provider = AgentCoreMemoryToolProvider(
    memory_id=memory_id,
    actor_id=actor_id,
    session_id=session_id,
    namespace=namespace
)

# Create agent with memory tools
agent = Agent(
    tools=provider.tools,  # Adds retrieve_memory_records and store_memory_records
    model="global.anthropic.claude-haiku-4-5-20251001-v1:0",
    system_prompt="""You are a Culinary Assistant.

    You have access to a Memory tool that enables you to:
    - Store user preferences (dietary restrictions, cuisines, etc.)
    - Retrieve previously stored information

    Use the memory tool to personalize recommendations."""
)

# Agent automatically uses memory tools
response = agent("Give me restaurant recommendations based on my food preferences")
```

### What AgentCoreMemoryToolProvider Provides

The provider adds two tools to your agent:

1. **retrieve_memory_records**: Query long-term memory
2. **store_memory_records**: Manually store information

The agent decides when to use these tools based on the conversation.

## Complete Example: Culinary Assistant

```python
from bedrock_agentcore.memory import MemoryClient
from bedrock_agentcore.memory.constants import StrategyType
from strands import Agent
from strands_tools.agent_core_memory import AgentCoreMemoryToolProvider
import time

# 1. Create memory with user preference strategy
client = MemoryClient(region_name='us-east-1')

memory = client.create_memory_and_wait(
    name="CulinaryAssistant",
    strategies=[{
        StrategyType.USER_PREFERENCE.value: {
            "name": "UserPreferences",
            "description": "Captures user preferences",
            "namespaces": ["user/{actorId}/preferences"]
        }
    }],
    event_expiry_days=7
)

memory_id = memory['id']

# 2. Hydrate with previous conversation
actor_id = "user_123"
session_id = "session_001"

previous_messages = [
    ("I'm vegetarian and love Italian food", "USER"),
    ("Great! I'll remember that.", "ASSISTANT")
]

client.create_event(
    memory_id=memory_id,
    actor_id=actor_id,
    session_id=session_id,
    messages=previous_messages
)

# 3. Wait for extraction
time.sleep(30)

# 4. Create agent with memory tools
namespace = f"user/{actor_id}/preferences"

provider = AgentCoreMemoryToolProvider(
    memory_id=memory_id,
    actor_id=actor_id,
    session_id=session_id,
    namespace=namespace
)

agent = Agent(
    tools=provider.tools,
    model="global.anthropic.claude-haiku-4-5-20251001-v1:0",
    system_prompt="You are a Culinary Assistant with memory capabilities."
)

# 5. Agent uses memory automatically
response = agent("Recommend restaurants in Seattle based on my preferences")
# Agent will retrieve "vegetarian" and "Italian food" preferences automatically
```

## Memory Operations

### Create Memory with Strategy

```python
memory = client.create_memory_and_wait(
    name="MyMemory",
    strategies=[{
        StrategyType.USER_PREFERENCE.value: {
            "name": "Preferences",
            "namespaces": ["user/{actorId}/prefs"]
        }
    }],
    event_expiry_days=7
)
```

### Hydrate Short-Term (Triggers Extraction)

```python
client.create_event(
    memory_id=memory_id,
    actor_id="user_123",
    session_id="session_001",
    messages=[("I like pizza", "USER")]
)
```

### Retrieve Long-Term Memories

```python
memories = client.retrieve_memories(
    memory_id=memory_id,
    namespace="user/user_123/prefs",
    query="food preferences",
    top_k=5
)
```

### List Events (Short-Term)

```python
events = client.list_events(
    memory_id=memory_id,
    actor_id="user_123",
    session_id="session_001",
    max_results=10
)
```

### Delete Memory

```python
client.delete_memory_and_wait(memory_id=memory_id)
```

## Integration with Agent Core Runtime

Long-term memory works with deployed agents:

```python
from bedrock_agentcore.runtime import BedrockAgentCoreApp
from bedrock_agentcore.memory import MemoryClient
from strands import Agent
from strands_tools.agent_core_memory import AgentCoreMemoryToolProvider

app = BedrockAgentCoreApp()
client = MemoryClient(region_name='us-east-1')

# Memory ID from previous creation
MEMORY_ID = "your-memory-id"

@app.entrypoint
def agent_invocation(payload, context):
    actor_id = payload.get("actor_id", "default_user")
    session_id = payload.get("session_id", "default_session")
    namespace = f"user/{actor_id}/preferences"

    # Create memory tool provider
    provider = AgentCoreMemoryToolProvider(
        memory_id=MEMORY_ID,
        actor_id=actor_id,
        session_id=session_id,
        namespace=namespace
    )

    # Create agent with memory
    agent = Agent(
        tools=provider.tools,
        model="global.anthropic.claude-haiku-4-5-20251001-v1:0",
        system_prompt="You are an assistant with long-term memory."
    )

    # Invoke agent
    response = agent(payload.get("prompt"))
    return {"response": response.message['content'][0]['text']}

if __name__ == "__main__":
    app.run()
```

## Best Practices

1. **Wait for extraction** - Allow 10-30 seconds after `create_event()` before querying
2. **Use meaningful namespaces** - Organize by user/type: `user/{actorId}/preferences`
3. **Query with context** - Use descriptive queries: "food preferences" not just "preferences"
4. **Set appropriate expiry** - Short-term events can expire, long-term persists
5. **Test extraction** - Verify preferences are extracted correctly
6. **Use memory tools** - Let agent decide when to retrieve/store
7. **Handle empty results** - Not all conversations have extractable preferences

## Common Use Cases

### Personal Assistant

- Extract user preferences (work hours, communication style)
- Remember important dates and tasks
- Personalize responses based on history

### Customer Support

- Extract customer issues and resolutions
- Remember product preferences
- Track support history across sessions

### E-commerce

- Extract product preferences
- Remember shopping habits
- Personalize recommendations

### Healthcare

- Extract symptoms and conditions (with proper security)
- Remember treatment preferences
- Track health history

## Limitations

- Extraction takes 10-30 seconds (not instant)
- Requires well-formed conversations for extraction
- Limited to configured strategies (UserPreference, etc.)
- Namespace structure must be defined upfront
- Query quality affects retrieval relevance

## Error Handling

```python
from botocore.exceptions import ClientError

try:
    memory = client.create_memory_and_wait(
        name="MyMemory",
        strategies=[{StrategyType.USER_PREFERENCE.value: {...}}]
    )
except ClientError as e:
    if "already exists" in str(e):
        # Get existing memory
        memories = client.list_memories()
        memory_id = next((m['id'] for m in memories if m['id'].startswith("MyMemory")), None)
    else:
        raise
```

## Dependencies

```
strands-agents
strands-tools  # For AgentCoreMemoryToolProvider
bedrock-agentcore
boto3
```

## Key Takeaways

- **Automatic extraction** - No manual processing needed
- **Semantic search** - Query with natural language
- **Persistent** - Survives event expiry
- **Tool integration** - Easy Strands agent integration
- **Namespace organization** - Structured memory storage
- **Strategy-based** - Different strategies for different needs

## Next Steps

- Explore other strategy types (if available)
- Combine short-term and long-term memory
- Build multi-agent systems with shared memory
- Implement custom extraction logic
- Add memory to deployed Agent Core runtimes
