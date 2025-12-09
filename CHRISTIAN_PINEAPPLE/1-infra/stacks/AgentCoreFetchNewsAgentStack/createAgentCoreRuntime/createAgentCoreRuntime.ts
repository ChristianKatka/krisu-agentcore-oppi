import path = require("path");
import * as agentcore from "@aws-cdk/aws-bedrock-agentcore-alpha";
import { UserPool, UserPoolClient } from "aws-cdk-lib/aws-cognito";
import { Platform } from "aws-cdk-lib/aws-ecr-assets";
import { IRole } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import {
  projectName,
  projectNamePascal,
  tenantName,
  tenantNamePascal,
} from "../../../constants";

export const createAgentCoreRuntime = (
  stack: Construct,
  envName: string,
  role: IRole,
  userPool: UserPool,
  userPoolClient: UserPoolClient
) => {
  const agentPath = path.join(
    __dirname,
    "..",
    "..",
    "..",
    "agents",
    "agentcore_agents",
    "agentcore_fetch_news_agent"
  );

  const artifact = agentcore.AgentRuntimeArtifact.fromAsset(agentPath, {
    platform: Platform.LINUX_ARM64,
  });

  const logicalId = `${envName}${projectNamePascal}${tenantNamePascal}FetchNewsAgentRuntime`;
  const name = `${projectNamePascal}_fetch_news_agent_runtime`; // must be less than or equal to 48 characters and casing this weird

  new agentcore.Runtime(stack, logicalId, {
    runtimeName: name,
    executionRole: role,
    agentRuntimeArtifact: artifact,
    authorizerConfiguration:
      agentcore.RuntimeAuthorizerConfiguration.usingCognito(userPool, [
        userPoolClient,
      ]),
  });
};
