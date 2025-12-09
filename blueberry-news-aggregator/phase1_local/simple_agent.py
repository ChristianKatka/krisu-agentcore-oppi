"""
Christian Blueberry News Aggregator - Phase 1: Simple Local Agent
This is your first agent! It fetches news from HackerNews and Dev.to.
"""

from strands import Agent, tool
import requests

@tool
def fetch_hackernews() -> str:
    """Fetch top tech stories from HackerNews"""
    try:
        print("🔍 Fetching from HackerNews...")
        response = requests.get(
            "https://hacker-news.firebaseio.com/v0/topstories.json",
            timeout=5
        )
        story_ids = response.json()[:5]  # Get top 5 stories
        
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
        return f"❌ Error fetching Dev.to: {str(e)}"

def create_news_agent() -> Agent:
    """Create the news agent with tools"""
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
        name="BlueberryNewsAgent"
    )

if __name__ == "__main__":
    print("🫐 Blueberry News Aggregator - Phase 1")
    print("=" * 50)
    print()
    
    # Create the agent
    agent = create_news_agent()
    
    # Test query
    print("Testing agent with: 'What are the latest tech news?'")
    print()
    
    response = agent("What are the latest tech news?")
    print(response.message['content'][0]['text'])
    print()
    print("=" * 50)
    print("✅ Agent test complete!")
