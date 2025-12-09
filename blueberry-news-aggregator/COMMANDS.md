# 🫐 Blueberry News Aggregator - Command Cheat Sheet

## 📦 Dependency Management (Like npm in Node.js)

```bash
# Install all dependencies (like npm install)
pip install -r requirements.txt

# Install a specific package (like npm install package-name)
pip install strands-agents

# Install and save to requirements.txt
pip install some-package
echo "some-package>=1.0.0" >> requirements.txt

# List installed packages (like npm list)
pip list

# Show info about a package (like npm info)
pip show strands-agents

# Update a package (like npm update)
pip install --upgrade strands-agents

# Uninstall a package (like npm uninstall)
pip uninstall strands-agents

# Generate requirements.txt from installed packages
pip freeze > requirements.txt
```

## 🚀 Running Your Agent

```bash
# Navigate to project
cd blueberry-news-aggregator

# Run simple test agent
python phase1_local/simple_agent.py

# Run interactive chat agent
python phase1_local/interactive_agent.py

# Run with specific Python version
python3.12 phase1_local/interactive_agent.py
```

## 🐍 Virtual Environment

```bash
# Create virtual environment (one time)
python3.12 -m venv venv

# Activate virtual environment
source venv/bin/activate        # Mac/Linux
venv\Scripts\activate           # Windows

# Deactivate virtual environment
deactivate

# Check if virtual environment is active
which python                    # Should show path to venv
```

## 🔧 Development

```bash
# Check Python version
python --version
python3.12 --version

# Check if package is installed
pip show strands-agents

# Run Python interactively
python
>>> import strands
>>> exit()

# Check for syntax errors
python -m py_compile phase1_local/simple_agent.py

# Format code (optional - install black first)
pip install black
black phase1_local/
```

## 📝 Git Commands

```bash
# Initialize git (if not already)
git init

# Check status
git status

# Add files
git add .

# Commit
git commit -m "Add Phase 1 local agents"

# View changes
git diff

# View commit history
git log --oneline
```

## 🔍 Debugging

```bash
# Run with verbose output
python -v phase1_local/simple_agent.py

# Check for import errors
python -c "import strands; print('OK')"

# Test API connectivity
curl https://hacker-news.firebaseio.com/v0/topstories.json

# Check environment variables
printenv | grep AWS
```

## 📊 Project Info

```bash
# Count lines of code
find . -name "*.py" | xargs wc -l

# List all Python files
find . -name "*.py"

# Search for text in files
grep -r "fetch_hackernews" .

# Show project structure
tree                            # If tree is installed
ls -R                          # Alternative
```

## 🧪 Testing (Future)

```bash
# Install pytest
pip install pytest

# Run tests
pytest

# Run tests with coverage
pip install pytest-cov
pytest --cov=phase1_local
```

## 🌐 AWS Commands (Phase 2+)

```bash
# Check AWS credentials
aws sts get-caller-identity

# List Bedrock models
aws bedrock list-foundation-models --region us-east-1

# Check CDK version
cdk --version

# Bootstrap CDK (one time)
cdk bootstrap

# Deploy to AWS
cdk deploy

# Destroy AWS resources
cdk destroy
```

## 💡 Quick Comparisons: Python vs Node.js

| Task          | Python                            | Node.js               |
| ------------- | --------------------------------- | --------------------- |
| Install deps  | `pip install -r requirements.txt` | `npm install`         |
| Add package   | `pip install package`             | `npm install package` |
| Run script    | `python script.py`                | `node script.js`      |
| List packages | `pip list`                        | `npm list`            |
| Package file  | `requirements.txt`                | `package.json`        |
| Lock file     | (none by default)                 | `package-lock.json`   |
| Virtual env   | `venv/`                           | `node_modules/`       |

## 🎯 Common Workflows

### First Time Setup

```bash
cd blueberry-news-aggregator
pip install -r requirements.txt
python phase1_local/interactive_agent.py
```

### Daily Development

```bash
source venv/bin/activate
python phase1_local/interactive_agent.py
# Make changes
python phase1_local/interactive_agent.py
```

### Adding New Feature

```bash
# Install new dependency
pip install new-package

# Add to requirements.txt
echo "new-package>=1.0.0" >> requirements.txt

# Test
python phase1_local/simple_agent.py

# Commit
git add .
git commit -m "Add new feature"
```

### Updating Dependencies

```bash
# Update all packages
pip install --upgrade -r requirements.txt

# Update specific package
pip install --upgrade strands-agents

# Regenerate requirements.txt
pip freeze > requirements.txt
```

## 🆘 Emergency Commands

```bash
# Something broken? Reinstall everything
pip uninstall -r requirements.txt -y
pip install -r requirements.txt

# Python cache issues?
find . -type d -name __pycache__ -exec rm -r {} +
find . -type f -name "*.pyc" -delete

# Start fresh with virtual environment
deactivate
rm -rf venv
python3.12 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## 📚 Help Commands

```bash
# Get help on pip
pip --help

# Get help on a specific pip command
pip install --help

# Get help on Python
python --help

# Get help on a Python module
python -m strands --help
```

---

**Pro Tip**: Bookmark this file! It has all the commands you'll need. 🫐
