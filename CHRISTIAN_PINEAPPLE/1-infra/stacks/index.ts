#!/usr/bin/env node
import * as cdk from "aws-cdk-lib/core";
import {
  projectName,
  projectNamePascal,
  tenantName,
  tenantNamePascal,
} from "../constants";
import { CognitoUserPoolStack } from "./CognitoUserPoolStack/CognitoUserPoolStack";
import { AgentCoreFetchNewsAgentStack } from "./AgentCoreFetchNewsAgentStack/AgentCoreFetchNewsAgentStack";

// cdk deploy --all -c env=dev

// Create CDK app
const app = new cdk.App();

const envName = app.node.tryGetContext("env");

if (!envName) {
  throw new Error("Missing context: pass -c env=dev or -c env=prod");
}

// Define environments
const environments: Record<string, cdk.Environment> = {
  dev: {
    account: "802026442401", // dev account,
    region: "us-east-1",
  },
  prod: {
    account: "293427195965", // prod account
    region: "us-east-1",
  },
};

const envConfig = environments[envName];

if (!envConfig) {
  throw new Error(`Invalid environment name: "${envName}"`);
}

const currentAccount = process.env.CDK_DEFAULT_ACCOUNT;

if (currentAccount && currentAccount !== envConfig.account) {
  throw new Error(
    `AWS Account mismatch: You are deploying to environment "${envName}" which expects account ${envConfig.account}, but your credentials are using ${currentAccount}`
  );
}

// --------------------------
// START OF STACKS

const cognitoUserPool = new CognitoUserPoolStack(
  app,
  `${envName}${projectNamePascal}${tenantNamePascal}CognitoUserPoolStack`,
  {
    stackName: `${envName}-${projectName}-${tenantName}---cognito-user-pool`,
    env: envConfig,
    envName,
  }
);

new AgentCoreFetchNewsAgentStack(
  app,
  `${envName}${projectNamePascal}${tenantNamePascal}AgentCoreFetchNewsAgentStack`,
  {
    stackName: `${envName}-${projectName}-${tenantName}---agentcore-fetch-news-agent`,
    description: `Fetch News Aggregator - Fetches news from HackerNews and Dev.to`,
    env: envConfig,
    envName,
    userPool: cognitoUserPool.userPool,
    userPoolClient: cognitoUserPool.userPoolClient,
  }
);
