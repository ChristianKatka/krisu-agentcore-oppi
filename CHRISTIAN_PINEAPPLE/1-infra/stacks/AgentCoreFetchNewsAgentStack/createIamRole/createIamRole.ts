import { PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import {
  projectName,
  projectNamePascal,
  tenantName,
  tenantNamePascal,
} from "../../../constants";

export const createIamRole = (stack: Construct, envName: string) => {
  const logicalId = `${envName}${projectNamePascal}${tenantNamePascal}NewsAgentLambdaExecutionRole`;
  const name = `${envName}-${projectName}-${tenantName}---news-agent-execution-role`;

  const lambdaRole = new Role(stack, logicalId, {
    assumedBy: new ServicePrincipal("bedrock-agentcore.amazonaws.com"),
    roleName: name,
    description: `execution role for ${envName}-${projectName}-${tenantName}---news-agent`,
  });

  lambdaRole.addToPolicy(
    new PolicyStatement({
      actions: ["bedrock:*", "ecr:*", "logs:*"],
      resources: ["*"],
    })
  );

  return lambdaRole;
};
