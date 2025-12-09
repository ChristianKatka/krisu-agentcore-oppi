1 Agent = 1 Docker Image = 1 Agent Core Runtime = 1 CDK Stack

News Agent:
├── Docker Image (news agent code)
├── Agent Core Runtime (runs the container)
└── CDK Stack (deploys everything)

Weather Agent:
├── Docker Image (weather agent code)
├── Agent Core Runtime (runs the container)
└── CDK Stack (deploys everything)

# Install all dependencies (like npm install)

pip install -r requirements.txt
