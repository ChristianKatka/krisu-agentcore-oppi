"""
Blueberry News Aggregator - Phase 2: Agent Core Runtime
This version is designed to run on AWS Agent Core.
"""

from strands import Agent, tool
import requests
import os
from bedrock_agentcore.runtime import BedrockAgentCoreApp

# Initialize Agent Core App
app = BedrockAgentCoreApp()

@tool
def fetch_hackernews() -> str:
    """Fetch top tech stories from HackerNews"""
    try:
        print("🔍 Fetching from HackerNews...")
        response = requests.get(
            "https://hacker-news.firebaseio.com/v0/topstories.json",
            timeout=5
        )
        story_ids = response.json()[:5]
        
        stories = []
        for story_id in story_ids:
            story_response = requests.get(
                f"https://hacker-news.firebaseio.com/v0/item/{story_id}.json",
                timeout=5
            )
            story = story_response.json()
            title = story.get('title', 'No title')
            url = story.get('url', 'No URL')
            stories.append(f"• {title}\n  {url}")
        
        return "📰 Top HackerNews Stories:\n\n" + "\n\n".join(stories)
    
    except Exception as e:
        print(f"Error fetching HackerNews: {str(e)}")
        return f"❌ Error fetching HackerNews: {str(e)}"

@tool
def fetch_devto_news() -> str:
    """Fetch latest articles from Dev.to"""
    try:
        print("🔍 Fetching from Dev.to...")
        response = requests.get(
            "https://dev.to/api/articles?per_page=5",
            timeout=5
        )
        articles = response.json()
        
        stories = []
        for article in articles:
            title = article.get('title', 'No title')
            url = article.get('url', '')
            tags = ', '.join(article.get('tag_list', [])[:3])
            stories.append(f"• {title}\n  Tags: {tags}\n  {url}")
        
        return "📰 Latest Dev.to Articles:\n\n" + "\n\n".join(stories)
    
    except Exception as e:
        print(f"Error fetching Dev.to: {str(e)}")
        return f"❌ Error fetching Dev.to: {str(e)}"

def create_news_agent() -> Agent:
    """Create the Blueberry news agent with tools"""
    return Agent(
        tools=[fetch_hackernews, fetch_devto_news],
        system_prompt="""You are Blueberry 🫐, a helpful news assistant.

You can fetch the latest tech and AI news from:
- HackerNews (use fetch_hackernews tool)
- Dev.to (use fetch_devto_news tool)

When users ask for news:
1. Use the appropriate tool(s) to fetch fresh news
2. Present the information in a friendly, organized way
3. Be concise but informative

Always be helpful and enthusiastic about sharing news!""",
        name="ChristianBlueberryNewsAgent"
    )

# Agent coren entry point
@app.entrypoint
def invoke(payload, context):
    # payload comes from use
    """
    Main entrypoint for Agent Core Runtime.
    This function is called when the agent is invoked from AWS.
    """
    try:
        
        session_id = context.session_id
        # Get user query from payload
        query = payload.get("prompt", "What are the latest tech news?") if payload else "What are the latest tech news?"
        
        print(f"📥 Received query: {query}")
        
        # Create and invoke agent
        agent = create_news_agent()
        response = agent(query)
        
        # Extract response text
        response_text = response.message['content'][0]['text']
        
        print(f"✅ Response generated successfully")
        
        # Return response in Agent Core format
        return {
            "status": "success",
            "response": response_text,
            "agent": "ChristianBlueberryNewsAgent",
            "version": "phase2"
        }
    
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        
        return {
            "status": "error",
            "error": str(e),
            "agent": "ChristianBlueberryNewsAgent"
        }

if __name__ == "__main__":
    # Run the Agent Core app
    print("🫐 Blueberry News Agent - Agent Core Runtime")
    print("Starting server on port 8080...")
    app.run()
