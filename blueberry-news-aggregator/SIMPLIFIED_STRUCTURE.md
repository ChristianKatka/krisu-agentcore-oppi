# ✨ Simplified to 2 Files!

## 🎉 What Changed

We simplified from **3 requirements.txt files** to just **2**!

### Before (3 files):

```
blueberry-news-aggregator/
├── requirements.txt                    ← Runtime dependencies
└── phase2_agentcore/
    ├── requirements.txt                ← DUPLICATE! ❌
    └── deployment/
        └── requirements.txt            ← Deployment tools
```

### After (2 files):

```
blueberry-news-aggregator/
├── requirements.txt                    ← Runtime dependencies ✅
└── phase2_agentcore/deployment/
    └── requirements.txt                ← Deployment tools ✅
```

## 📦 Just Like Node.js!

### Node.js:

```json
{
  "dependencies": { ... },      // Runtime
  "devDependencies": { ... }    // Dev tools
}
```

### Python (Now):

```
requirements.txt              // Runtime (like dependencies)
deployment/requirements.txt   // Dev tools (like devDependencies)
```

**Much cleaner!** 🎯

## 🔧 What We Changed

### 1. Deleted Duplicate File

❌ Removed `phase2_agentcore/requirements.txt`

### 2. Updated Dockerfile

Changed the Docker build to use the root `requirements.txt`:

```dockerfile
# Before
COPY requirements.txt requirements.txt

# After
COPY requirements.txt requirements.txt  # From project root
COPY phase2_agentcore/news_agent.py .
```

### 3. Updated CDK Stack

Changed the build context to project root:

```python
docker_image = DockerImageAsset(
    directory=os.path.join(os.path.dirname(__file__), "..", ".."),  # Project root
    file="phase2_agentcore/Dockerfile",
    platform=Platform.LINUX_ARM64
)
```

## 📝 The Two Files

### File #1: `requirements.txt` (Runtime)

**Location**: `blueberry-news-aggregator/requirements.txt`

**What it's for**: Your agent's runtime dependencies

```txt
strands-agents>=1.0.0
requests>=2.31.0
boto3>=1.40.0
bedrock-agentcore
python-dotenv>=1.0.0
```

**Used by**:

- Phase 1 local development
- Phase 2 Docker container
- Your agent running on AWS

### File #2: `deployment/requirements.txt` (Dev Tools)

**Location**: `phase2_agentcore/deployment/requirements.txt`

**What it's for**: CDK deployment tools

```txt
aws-cdk-lib>=2.220.0
constructs>=10.0.0
```

**Used by**:

- CDK deployment only
- Not installed in Docker container
- Not needed for running the agent

## 🚀 How to Use

### Phase 1 (Local Development):

```bash
cd blueberry-news-aggregator
pip install -r requirements.txt
python phase1_local/interactive_agent.py
```

### Phase 2 (Deploy to AWS):

```bash
cd phase2_agentcore/deployment
pip install -r requirements.txt  # Install CDK tools
cdk deploy                       # Docker uses root requirements.txt
```

## ✅ Benefits

1. **Less duplication** - One source of truth for runtime dependencies
2. **Easier maintenance** - Update dependencies in one place
3. **More like Node.js** - Similar to dependencies vs devDependencies
4. **Cleaner structure** - Less confusing for developers

## 🎯 Summary

**Before**: 3 files (confusing!)
**After**: 2 files (clean!)

Just like Node.js:

- `requirements.txt` = `dependencies`
- `deployment/requirements.txt` = `devDependencies`

**Everything still works the same, just cleaner!** 🫐

## 📚 Quick Reference

| File                          | Purpose             | When to Update             |
| ----------------------------- | ------------------- | -------------------------- |
| `requirements.txt`            | Agent runtime needs | Add new agent dependencies |
| `deployment/requirements.txt` | CDK tools           | Rarely (CDK updates)       |

**That's it! Just 2 files to maintain.** 🎉
