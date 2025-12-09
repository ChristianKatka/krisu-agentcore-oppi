from strands import Agent, tool
import requests
from bedrock_agentcore.runtime import BedrockAgentCoreApp

# AWS Agent Core app
agentcore_app = BedrockAgentCoreApp()

# Tool 1: Fetch HackerNews
@tool
def fetch_hackernews() -> str:
    """Get top 5 HackerNews stories"""
    hackernews_api_url = "https://hacker-news.firebaseio.com/v0/topstories.json"
    top_story_ids = requests.get(hackernews_api_url).json()[:5]
    
    formatted_stories = []
    for story_id in top_story_ids:
        story_url = f"https://hacker-news.firebaseio.com/v0/item/{story_id}.json"
        story_data = requests.get(story_url).json()
        formatted_stories.append(f"• {story_data.get('title')}\n  {story_data.get('url')}")
    
    return "HackerNews:\n" + "\n".join(formatted_stories)

# Tool 2: Fetch Dev.to
@tool
def fetch_devto_news() -> str:
    """Get latest 5 Dev.to articles"""
    devto_api_url = "https://dev.to/api/articles?per_page=5"
    articles_data = requests.get(devto_api_url).json()
    
    formatted_articles = []
    for article in articles_data:
        formatted_articles.append(f"• {article['title']}\n  {article['url']}")
    
    return "Dev.to:\n" + "\n".join(formatted_articles)

# Create agent with tools
def create_news_agent_with_tools() -> Agent:
    agent_system_prompt = "You are a news assistant. Fetch and show tech news."
    agent_tools = [fetch_hackernews, fetch_devto_news]
    
    return Agent(
        tools=agent_tools,
        system_prompt=agent_system_prompt,
        name="NewsAgent"
    )

# Extract user query from AWS payload
def get_user_query_from_payload(aws_payload: dict) -> str:
    default_query = "What are the latest tech news?"
    if not aws_payload:
        return default_query
    return aws_payload.get("prompt", default_query)

# Get response text from agent
def get_response_text_from_agent(agent_response) -> str:
    return agent_response.message['content'][0]['text']

# Build success response for AWS
def build_success_response(response_text: str) -> dict:
    return {
        "status": "success",
        "response": response_text
    }

# AWS Agent Core entrypoint - called when agent is invoked
@agentcore_app.entrypoint
def handle_aws_invocation(payload=None, context=None):
    user_query = get_user_query_from_payload(payload)
    
    news_agent = create_news_agent_with_tools()
    agent_response = news_agent(user_query)
    
    response_text = get_response_text_from_agent(agent_response)
    return build_success_response(response_text)

# Run HTTP server on port 8080
if __name__ == "__main__":
    agentcore_app.run()
