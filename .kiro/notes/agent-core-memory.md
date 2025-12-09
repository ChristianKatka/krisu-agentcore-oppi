# Agent Core Memory - Complete Guide

## Overview

Agent Core Memory provides conversation persistence for agents. This tutorial shows **short-term memory** (raw conversation turns) with Strands agents.

## Memory Types

### Short-Term Memory

- Stores raw conversation turns
- Retrieved with `get_last_k_turns()`
- No strategies needed
- Retention: up to 365 days
- Use case: Recent conversation context

### Long-Term Memory (not covered here)

- Uses strategies for summarization/extraction
- Persistent knowledge across sessions
- Use case: User preferences, facts

## Architecture

```
User Input
    ↓
Agent (with hooks)
    ↓
Memory Hook (on_agent_initialized)
    ├─ Load last K turns from Memory
    └─ Add to agent context
    ↓
Agent processes with context
    ↓
Agent responds
    ↓
Memory Hook (on_message_added)
    └─ Store new message in Memory
```

## Step-by-Step Implementation

### 1. Create Memory Resource

```python
from bedrock_agentcore.memory import MemoryClient

client = MemoryClient(region_name='us-east-1')

# Create memory without strategies (short-term only)
memory = client.create_memory_and_wait(
    name="PersonalAgentMemory",
    strategies=[],  # Empty = short-term memory only
    description="Short-term memory for personal agent",
    event_expiry_days=7  # Retention period (max 365 days)
)

memory_id = memory['id']
```

### 2. Define Memory Hooks

Hooks run at specific points in agent lifecycle:

```python
from strands.hooks import (
    AgentInitializedEvent,
    HookProvider,
    HookRegistry,
    MessageAddedEvent
)

class MemoryHookProvider(HookProvider):
    def __init__(self, memory_client: MemoryClient, memory_id: str):
        self.memory_client = memory_client
        self.memory_id = memory_id

    def on_agent_initialized(self, event: AgentInitializedEvent):
        """Load recent conversation when agent starts"""
        actor_id = event.agent.state.get("actor_id")
        session_id = event.agent.state.get("session_id")

        # Get last 5 conversation turns
        recent_turns = self.memory_client.get_last_k_turns(
            memory_id=self.memory_id,
            actor_id=actor_id,
            session_id=session_id,
            k=5
        )

        if recent_turns:
            # Format and add to system prompt
            context_messages = []
            for turn in recent_turns:
                for message in turn:
                    role = message['role']
                    content = message['content']['text']
                    context_messages.append(f"{role}: {content}")

            context = "\\n".join(context_messages)
            event.agent.system_prompt += f"\\n\\nRecent conversation:\\n{context}"

    def on_message_added(self, event: MessageAddedEvent):
        """Store new messages in memory"""
        messages = event.agent.messages
        actor_id = event.agent.state.get("actor_id")
        session_id = event.agent.state.get("session_id")

        if messages[-1]["content"][0].get("text"):
            self.memory_client.create_event(
                memory_id=self.memory_id,
                actor_id=actor_id,
                session_id=session_id,
                messages=[(messages[-1]["content"][0]["text"], messages[-1]["role"])]
            )

    def register_hooks(self, registry: HookRegistry):
        registry.add_callback(MessageAddedEvent, self.on_message_added)
        registry.add_callback(AgentInitializedEvent, self.on_agent_initialized)
```

### 3. Create Agent with Memory

```python
from strands import Agent, tool

ACTOR_ID = "user_123"  # Unique user identifier
SESSION_ID = "session_001"  # Unique session identifier

agent = Agent(
    name="PersonalAssistant",
    model="global.anthropic.claude-haiku-4-5-20251001-v1:0",
    system_prompt="You are a helpful personal assistant.",
    hooks=[MemoryHookProvider(client, memory_id)],  # Add memory hooks
    tools=[websearch],  # Optional tools
    state={"actor_id": ACTOR_ID, "session_id": SESSION_ID}  # Required for memory
)
```

### 4. Use the Agent

```python
# First conversation
agent("My name is Alex and I'm interested in AI.")
agent("Can you search for AI trends?")

# Create new agent instance (simulates user returning)
new_agent = Agent(
    name="PersonalAssistant",
    model="global.anthropic.claude-haiku-4-5-20251001-v1:0",
    system_prompt="You are a helpful personal assistant.",
    hooks=[MemoryHookProvider(client, memory_id)],
    state={"actor_id": ACTOR_ID, "session_id": SESSION_ID}
)

# Agent remembers previous conversation!
new_agent("What was my name again?")  # Will remember "Alex"
```

### 5. Retrieve Memory Manually

```python
# Get last K conversation turns
recent_turns = client.get_last_k_turns(
    memory_id=memory_id,
    actor_id=ACTOR_ID,
    session_id=SESSION_ID,
    k=3  # Number of turns to retrieve
)

for i, turn in enumerate(recent_turns, 1):
    print(f"Turn {i}:")
    for message in turn:
        role = message['role']
        content = message['content']['text']
        print(f"  {role}: {content}")
```

## Key Concepts

### Actor ID

- Unique identifier for the user/entity
- Can be user ID, agent ID, etc.
- Used to separate memories by user

### Session ID

- Unique identifier for conversation session
- Allows multiple concurrent conversations per actor
- Used to organize conversation threads

### Conversation Turn

- One user message + one agent response
- Stored as a unit in memory
- Retrieved together with `get_last_k_turns()`

### Hooks

- **AgentInitializedEvent**: Runs when agent is created
  - Use to load conversation history
  - Modify system prompt with context
- **MessageAddedEvent**: Runs when message is added
  - Use to store messages in memory
  - Happens for both user and agent messages

## Memory Operations

### Create Memory

```python
memory = client.create_memory_and_wait(
    name="MyMemory",
    strategies=[],  # Empty for short-term
    event_expiry_days=7
)
```

### Store Event

```python
client.create_event(
    memory_id=memory_id,
    actor_id="user_123",
    session_id="session_001",
    messages=[("Hello!", "user"), ("Hi there!", "assistant")]
)
```

### Retrieve Last K Turns

```python
turns = client.get_last_k_turns(
    memory_id=memory_id,
    actor_id="user_123",
    session_id="session_001",
    k=5  # Last 5 turns
)
```

### Delete Memory

```python
client.delete_memory_and_wait(memory_id)
```

## Integration with Agent Core Runtime

Memory works seamlessly with Agent Core Runtime deployment:

```python
from bedrock_agentcore.runtime import BedrockAgentCoreApp
from bedrock_agentcore.memory import MemoryClient

app = BedrockAgentCoreApp()
client = MemoryClient(region_name='us-east-1')

# Create memory hooks
memory_hooks = MemoryHookProvider(client, memory_id)

# Create agent with memory
agent = Agent(
    model="global.anthropic.claude-haiku-4-5-20251001-v1:0",
    hooks=[memory_hooks],
    state={"actor_id": "user_123", "session_id": "session_001"}
)

@app.entrypoint
def agent_invocation(payload, context):
    # Extract actor/session from payload
    actor_id = payload.get("actor_id", "default_user")
    session_id = payload.get("session_id", "default_session")

    # Update agent state
    agent.state["actor_id"] = actor_id
    agent.state["session_id"] = session_id

    # Invoke agent (memory hooks run automatically)
    response = agent(payload.get("prompt"))
    return {"response": response.message['content'][0]['text']}

if __name__ == "__main__":
    app.run()
```

## Error Handling

```python
from botocore.exceptions import ClientError

try:
    memory = client.create_memory_and_wait(name="MyMemory", strategies=[])
except ClientError as e:
    if "already exists" in str(e):
        # Memory exists, get its ID
        memories = client.list_memories()
        memory_id = next((m['id'] for m in memories if m['id'].startswith("MyMemory")), None)
    else:
        raise
```

## Best Practices

1. **Always set actor_id and session_id** in agent state
2. **Use meaningful IDs** (user IDs, session tokens)
3. **Set appropriate expiry** (7-365 days based on use case)
4. **Handle errors gracefully** (memory service might be unavailable)
5. **Test memory continuity** (create new agent instance to verify)
6. **Limit K value** (don't load too much history, 3-10 turns typical)

## Use Cases

### Personal Assistant

- Remember user preferences
- Continue conversations across sessions
- Track tasks and reminders

### Customer Support

- Load previous support tickets
- Remember customer issues
- Provide context-aware responses

### Multi-Turn Workflows

- Complex task completion
- Step-by-step guidance
- Progress tracking

## Limitations

- Short-term memory only stores raw turns (no summarization)
- Max retention: 365 days
- No semantic search (use long-term memory strategies for that)
- Requires actor_id and session_id in agent state

## Next Steps

- Explore long-term memory with strategies
- Add multiple memory resources per agent
- Implement memory cleanup policies
- Build multi-agent systems with shared memory

## Dependencies

```
strands-agents
bedrock-agentcore
boto3
```

## Important Notes

- Memory is a managed AWS service (no infrastructure to manage)
- Hooks run automatically (no manual memory management needed)
- Works with any Strands agent
- Compatible with Agent Core Runtime deployment
- Supports multiple concurrent sessions per user
