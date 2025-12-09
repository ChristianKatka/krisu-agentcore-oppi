# Christian Blueberry agentcore_fetch_news_agent - Dockerfile for Agent Core Runtime
# This creates an ARM64 container for AWS Agent Core

FROM public.ecr.aws/docker/library/python:3.11-slim

# Creates working directory inside docker container
WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY agentcore_fetch_news_agent.py .

# Create docker user, best security practice
RUN useradd -m bedrock_agentcore
USER bedrock_agentcore

EXPOSE 8080

CMD ["python", "agentcore_fetch_news_agent.py"]