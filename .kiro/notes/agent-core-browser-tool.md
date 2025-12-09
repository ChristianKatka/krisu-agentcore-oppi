# Agent Core Browser Tool - Web Automation with Strands

## Overview

Agent Core provides a **built-in browser tool** that enables agents to browse websites, extract data, and interact with web pages. This is a managed service - no need to run Selenium or Puppeteer yourself!

## Key Concept

The browser tool is accessed through `strands_tools.browser.AgentCoreBrowser` - it's a first-class integration with Strands agents.

## Simple Implementation

### 1. Install Dependencies

```bash
pip install strands-agents strands-agents-tools bedrock-agentcore
```

### 2. Create Agent with Browser Tool

```python
from strands import Agent
from strands_tools.browser import AgentCoreBrowser

# Initialize browser tool
agent_core_browser = AgentCoreBrowser(region="us-east-1")

# Create agent with browser capability
agent = Agent(
    tools=[agent_core_browser.browser],  # Add browser tool
    model="global.anthropic.claude-haiku-4-5-20251001-v1:0",
    system_prompt="""You are a web analyst. Use the browser tool to:
    - Visit websites
    - Extract information
    - Navigate pages
    - Analyze content

    Be efficient - complete tasks in 2-3 browser interactions."""
)
```

### 3. Use the Agent

```python
# Agent automatically uses browser when needed
response = agent("Visit https://example.com and tell me the main headline")

print(response.message['content'][0]['text'])
```

## Complete Example: Financial Analysis

```python
from strands import Agent
from strands_tools.browser import AgentCoreBrowser
import time

# Initialize browser tool
agent_core_browser = AgentCoreBrowser(region="us-east-1")

# Create financial analyst agent
agent = Agent(
    tools=[agent_core_browser.browser],
    model="global.anthropic.claude-haiku-4-5-20251001-v1:0",
    system_prompt="""You are a financial analyst. When analyzing stock websites:

1. Use the browser tool to visit the website
2. Extract key financial data:
   - Current stock price
   - Price changes (daily, weekly, monthly)
   - Market cap, P/E ratio
   - Trading volume
   - Recent news
   - Analyst recommendations

3. Provide specific, actionable insights with actual numbers
4. Work efficiently - complete analysis in 2-3 browser interactions"""
)

def invoke(payload):
    """Invoke agent with error handling"""
    user_message = payload.get("prompt", "")

    try:
        print("🚀 Starting analysis...")
        start_time = time.time()

        response = agent(user_message)

        elapsed_time = time.time() - start_time
        print(f"✅ Completed in {elapsed_time:.2f} seconds")

        return response.message["content"][0]["text"]

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return f"Error occurred: {str(e)}"

# Test with MarketWatch
result = invoke({
    "prompt": "Analyze Tesla stock at https://www.marketwatch.com/investing/stock/tsla"
})

print(result)
```

## What Happens Behind the Scenes

```
User Request
    ↓
Strands Agent
    ↓
Agent decides to use browser tool
    ↓
AgentCoreBrowser sends request to AWS
    ↓
AWS Bedrock AgentCore Browser Service
    ↓
Headless browser navigates to website
    ↓
Extracts content
    ↓
Returns to agent
    ↓
Agent processes with LLM
    ↓
Returns insights to user
```

## Browser Tool Capabilities

The browser tool can:

- **Navigate** to URLs
- **Click** elements
- **Extract** text and data
- **Scroll** pages
- **Fill forms** (if needed)
- **Take screenshots** (optional)
- **Handle JavaScript** (headless browser)

## System Prompt Best Practices

```python
system_prompt="""You are a web analyst with browser capabilities.

EFFICIENCY RULES:
1. Complete tasks in 2-3 browser interactions maximum
2. Extract key information quickly
3. Don't over-navigate - be direct

WHEN TO USE BROWSER:
- Need current/live data from websites
- Data not available via APIs
- Need to interact with web pages

WHAT TO EXTRACT:
- Specific data points requested
- Key metrics and numbers
- Relevant context

Always provide specific, actionable insights with actual data."""
```

## Helper Function Pattern

```python
def analyze_website(url, question=None):
    """Convenient function for website analysis"""
    if question:
        prompt = f"Visit {url} and answer: {question}"
    else:
        prompt = f"Analyze {url} and provide key insights"

    return invoke({"prompt": prompt})

# Usage
result = analyze_website(
    "https://www.marketwatch.com/investing/stock/aapl",
    "What is Apple's current stock performance?"
)
```

## Error Handling

```python
def invoke(payload):
    """Robust invoke with timeout and error handling"""
    user_message = payload.get("prompt", "")

    try:
        # Set timeout for slow websites
        response = agent(user_message)

        # Parse response
        if response.message.get("content"):
            return response.message["content"][0]["text"]
        else:
            return str(response)

    except TimeoutError:
        return "Website took too long to respond. Please try again."
    except Exception as e:
        return f"Error: {str(e)}"
```

## Use Cases

### 1. Financial Analysis

```python
agent("Analyze NVIDIA stock at https://www.marketwatch.com/investing/stock/nvda")
```

### 2. News Monitoring

```python
agent("Visit https://news.ycombinator.com and summarize top 5 stories")
```

### 3. Product Research

```python
agent("Go to https://www.amazon.com/dp/B08N5WRWNW and extract product details")
```

### 4. Competitor Analysis

```python
agent("Visit competitor website and analyze their pricing")
```

### 5. Content Extraction

```python
agent("Extract all article titles from https://techcrunch.com")
```

## Integration with Agent Core Runtime

Browser tool works seamlessly when deployed:

```python
from bedrock_agentcore.runtime import BedrockAgentCoreApp
from strands import Agent
from strands_tools.browser import AgentCoreBrowser

app = BedrockAgentCoreApp()

# Initialize browser tool
agent_core_browser = AgentCoreBrowser(region="us-east-1")

# Create agent
agent = Agent(
    tools=[agent_core_browser.browser],
    model="global.anthropic.claude-haiku-4-5-20251001-v1:0",
    system_prompt="You are a web analyst with browser capabilities."
)

@app.entrypoint
def agent_invocation(payload, context):
    user_input = payload.get("prompt")
    response = agent(user_input)
    return response.message['content'][0]['text']

if __name__ == "__main__":
    app.run()
```

## Performance Considerations

- **Typical execution**: 14-16 seconds for simple page analysis
- **Slow websites**: May timeout - implement timeout handling
- **Efficiency**: Limit to 2-3 browser interactions per task
- **Model choice**: Claude Haiku is fast and efficient for browser tasks

## Limitations

- **Timeout**: Slow websites may cause timeouts
- **JavaScript**: Complex SPAs might not fully render
- **Authentication**: Limited support for login flows
- **Rate limiting**: Websites may block automated access
- **Dynamic content**: Some content may not load in headless mode

## Best Practices

1. **Be specific** in prompts: "Extract stock price from..." not "Look at the page"
2. **Set expectations** in system prompt: "Complete in 2-3 interactions"
3. **Handle errors** gracefully with try/catch
4. **Use timeouts** for slow websites
5. **Test locally** before deploying to Agent Core
6. **Monitor performance** and adjust prompts
7. **Provide examples** in system prompt for complex tasks
8. **Use Claude Haiku** for speed (or Sonnet for complex analysis)

## Comparison with Custom Web Scraping

| Feature        | Agent Core Browser  | Custom Scraping            |
| -------------- | ------------------- | -------------------------- |
| Setup          | Import and use      | Install Selenium/Puppeteer |
| Infrastructure | AWS managed         | You manage                 |
| Scaling        | Automatic           | Manual                     |
| Maintenance    | AWS handles         | You handle                 |
| Cost           | Pay per use         | Server costs               |
| JavaScript     | Supported           | Requires headless browser  |
| Integration    | Native with Strands | Custom code                |

## Dependencies

```
strands-agents
strands-agents-tools  # For AgentCoreBrowser
bedrock-agentcore
boto3
```

## Environment Variables

```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
```

## Complete Production Example

```python
from strands import Agent
from strands_tools.browser import AgentCoreBrowser
from bedrock_agentcore.runtime import BedrockAgentCoreApp
import time

app = BedrockAgentCoreApp()

# Initialize browser
agent_core_browser = AgentCoreBrowser(region="us-east-1")

# Create agent
agent = Agent(
    tools=[agent_core_browser.browser],
    model="global.anthropic.claude-haiku-4-5-20251001-v1:0",
    system_prompt="""You are a web analyst. Extract information efficiently.
    Complete tasks in 2-3 browser interactions. Provide specific data points."""
)

@app.entrypoint
def agent_invocation(payload, context):
    """Production-ready entrypoint"""
    user_input = payload.get("prompt")

    try:
        start_time = time.time()
        response = agent(user_input)
        elapsed = time.time() - start_time

        return {
            "response": response.message['content'][0]['text'],
            "elapsed_time": f"{elapsed:.2f}s"
        }
    except Exception as e:
        return {
            "error": str(e),
            "response": "Failed to complete analysis"
        }

if __name__ == "__main__":
    app.run()
```

## For Our Content Aggregator

The browser tool could be useful for:

- **Scraping articles** from websites without APIs
- **Extracting full content** from paywalled sites (if allowed)
- **Monitoring news sites** for breaking stories
- **Analyzing article layouts** and extracting metadata
- **Following links** to get complete article text

However, for our use case, APIs (HackerNews, Dev.to) are simpler and faster. Use browser tool when:

- No API available
- Need visual/layout information
- Need to interact with dynamic content
- Scraping is allowed by site's terms

## Key Takeaways

- **Built-in tool** - No infrastructure to manage
- **Strands integration** - `strands_tools.browser.AgentCoreBrowser`
- **Headless browser** - Handles JavaScript and dynamic content
- **AWS managed** - Scales automatically
- **Simple to use** - Just add to agent's tools
- **Production ready** - Works with Agent Core Runtime
- **Fast** - 14-16 seconds typical execution
- **Flexible** - Works with any website

This is a powerful capability for building agents that need to interact with the web!
