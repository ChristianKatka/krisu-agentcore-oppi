#!/bin/bash
# Christian Blueberry News Aggregator - Deployment Helper Script

set -e  # Exit on error

echo "=============================================="
echo "🫐 Christian Blueberry News Aggregator"
echo "   Deployment Helper"
echo "=============================================="
echo ""

# Check if AWS_REGION is set
if [ -z "$AWS_REGION" ]; then
    echo "❌ ERROR: AWS_REGION not set!"
    echo ""
    echo "Please set your deployment region:"
    echo "  export AWS_REGION=us-east-1"
    echo ""
    echo "Then run this script again:"
    echo "  ./deploy.sh"
    exit 1
fi

echo "📍 Region: $AWS_REGION"

# Check if AWS_PROFILE is set
if [ -n "$AWS_PROFILE" ]; then
    echo "👤 Profile: $AWS_PROFILE"
else
    echo "👤 Profile: (default)"
fi

echo ""

# Check AWS credentials
echo "🔍 Verifying AWS credentials..."
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "❌ ERROR: AWS credentials not configured or expired!"
    echo ""
    echo "For AWS SSO:"
    echo "  aws sso login --profile YOUR_PROFILE"
    echo "  export AWS_PROFILE=YOUR_PROFILE"
    echo ""
    echo "For standard credentials:"
    echo "  aws configure"
    exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "✅ Authenticated to account: $ACCOUNT_ID"
echo ""

# Check if Docker is running
echo "🐳 Checking Docker..."
if ! docker ps > /dev/null 2>&1; then
    echo "❌ ERROR: Docker is not running!"
    echo ""
    echo "Please start Docker Desktop and try again."
    exit 1
fi
echo "✅ Docker is running"
echo ""

# Check if dependencies are installed
echo "📦 Checking dependencies..."
if ! python -c "import aws_cdk" > /dev/null 2>&1; then
    echo "⚠️  CDK dependencies not installed"
    echo "Installing dependencies..."
    pip install -r requirements.txt
else
    echo "✅ Dependencies installed"
fi
echo ""

# Ask what to do
echo "What would you like to do?"
echo "  1) Deploy (cdk deploy)"
echo "  2) Bootstrap (cdk bootstrap) - first time only"
echo "  3) Synthesize (cdk synth) - preview changes"
echo "  4) Destroy (cdk destroy) - delete everything"
echo "  5) Exit"
echo ""
read -p "Enter choice [1-5]: " choice

case $choice in
    1)
        echo ""
        echo "🚀 Deploying to AWS..."
        echo ""
        cdk deploy
        ;;
    2)
        echo ""
        echo "🔧 Bootstrapping CDK..."
        echo ""
        cdk bootstrap
        ;;
    3)
        echo ""
        echo "📋 Synthesizing CloudFormation template..."
        echo ""
        cdk synth
        ;;
    4)
        echo ""
        echo "🗑️  Destroying all resources..."
        echo ""
        cdk destroy
        ;;
    5)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "✅ Done!"
