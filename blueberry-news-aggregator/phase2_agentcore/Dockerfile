# Christian Blueberry News Aggregator - Dockerfile for Agent Core Runtime
# This creates an ARM64 container for AWS Agent Core

FROM public.ecr.aws/docker/library/python:3.11-slim

# Set working directory
WORKDIR /app

# Copy and install dependencies from root requirements.txt
# Build context is project root, so we can access requirements.txt directly
COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Install OpenTelemetry for observability (CloudWatch traces)
RUN pip install --no-cache-dir aws-opentelemetry-distro>=0.10.1

# Create non-root user for security
RUN useradd -m -u 1000 bedrock_agentcore
USER bedrock_agentcore

# Expose ports
EXPOSE 8080
EXPOSE 8000

# Copy agent code from phase2_agentcore directory
COPY phase2_agentcore/news_agent.py .

# Run with OpenTelemetry instrumentation for CloudWatch observability
CMD ["opentelemetry-instrument", "python", "-m", "news_agent"]
