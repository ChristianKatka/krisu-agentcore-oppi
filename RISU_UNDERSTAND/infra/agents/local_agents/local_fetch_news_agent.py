from strands import Agent, tool
import requests

@tool
def fetch_hackernews() -> str:
    """Get top 5 HackerNews stories"""
    response = requests.get("https://hacker-news.firebaseio.com/v0/topstories.json")
    story_ids = response.json()[:5]
    
    stories = []
    for story_id in story_ids:
        story = requests.get(f"https://hacker-news.firebaseio.com/v0/item/{story_id}.json").json()
        stories.append(f"• {story.get('title')}\n  {story.get('url')}")
    
    return "HackerNews:\n" + "\n".join(stories)

@tool
def fetch_devto_news() -> str:
    """Get latest 5 Dev.to articles"""
    response = requests.get("https://dev.to/api/articles?per_page=5")
    articles = response.json()
    
    stories = []
    for article in articles:
        stories.append(f"• {article['title']}\n  {article['url']}")
    
    return "Dev.to:\n" + "\n".join(stories)

# Create agent
agent = Agent(
    tools=[fetch_hackernews, fetch_devto_news],
    system_prompt="You are a news assistant. Fetch and show tech news.",
    name="NewsAgent"
)

# Test it
if __name__ == "__main__":
    response = agent("What are the latest tech news?")
    print(response.message['content'][0]['text'])
