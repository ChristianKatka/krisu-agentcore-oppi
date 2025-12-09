1 Agent = 1 Docker Image = 1 Agent Core Runtime = 1 CDK Stack

News Agent:
├── Docker Image (news agent code)
├── Agent Core Runtime (runs the container)
└── CDK Stack (deploys everything)

Weather Agent:
├── Docker Image (weather agent code)
├── Agent Core Runtime (runs the container)
└── CDK Stack (deploys everything)

# Architecture

Frontend:

Category tabs: World, Tech, Business, Sports, etc.
Each category shows top stories
Click a story to see AI-generated summary + original link
"What's trending now?" button for real-time analysis
Backend - Multi-Agent System:

Category Agents (one per category):

Tech Agent - HackerNews, Dev.to, TechCrunch API
World Agent - NewsAPI, Fox news, Reuters
Business Agent - Alpha Vantage, Finnhub, Twelve Data, etc.

Sports Agent - ESPN, sports feeds
Orchestrator Agent:

Routes user requests to right category agent
Combines results from multiple agents
Handles "biggest news right now" by querying all agents
Summarizer Agent:

Takes raw articles
Uses Bedrock Claude to create summaries
Extracts key points
MCP Servers (shared tools):

News API MCP - Fetches from various sources
Summarization MCP - Claude integration
Trending Analysis MCP - Analyzes what's hot across sources
Cache MCP - Redis/DynamoDB for recent articles
Data Flow:

User clicks "Tech News"
API Gateway → Tech Agent Runtime
Tech Agent uses News API MCP to fetch
Summarizer Agent processes articles
Results cached in DynamoDB
Frontend displays categorized, summarized news
Storage:

DynamoDB: Articles table (category, timestamp, summary, url)
S3: Full article archives
ElastiCache: Hot cache for trending stories
Would you want to start with one category working end-to-end, or build out the multi-agent orchestration first?
