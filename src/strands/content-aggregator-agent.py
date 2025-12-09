import os
from strands import Agent
from strands_tools import http_request

# Set AWS region
os.environ["AWS_DEFAULT_REGION"] = "us-east-1"

# Define the content aggregator system prompt
AGGREGATOR_SYSTEM_PROMPT = """You are a content aggregator and summarizer. You can:

1. Fetch top stories from HackerNews and Dev.to
2. Analyze and summarize the key topics and trends
3. Identify the most interesting or important stories
4. Present information in a clear, digestible format

When aggregating content:
- Use https://hacker-news.firebaseio.com/v0/topstories.json to get HackerNews top story IDs
- Use https://hacker-news.firebaseio.com/v0/item/{id}.json to get story details
- Use https://dev.to/api/articles?top=1 to get trending Dev.to articles
- Focus on tech, AI, and development topics
- Summarize the main themes and highlight 3-5 most interesting stories
- Be concise but informative

Format your response as a daily digest with:
1. Overview of main themes/trends
2. Top stories from each source
3. Key takeaways
"""

# Create the aggregator agent with HTTP capabilities
aggregator_agent = Agent(
    system_prompt=AGGREGATOR_SYSTEM_PROMPT,
    tools=[http_request],
)

# Run the aggregator
print("🔍 Fetching and analyzing content from HackerNews and Dev.to...\n")
response = aggregator_agent(
    "Fetch the top 10 stories from HackerNews and top 5 articles from Dev.to. "
    "Summarize the main themes and highlight the most interesting stories."
)
