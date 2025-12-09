import { Stack, StackProps } from "aws-cdk-lib";
import { UserPool, UserPoolClient } from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";
import { createAgentCoreRuntime } from "./createAgentCoreRuntime/createAgentCoreRuntime";
import { createIamRole } from "./createIamRole/createIamRole";

interface Props extends StackProps {
  envName: string;
  userPool: UserPool;
  userPoolClient: UserPoolClient;
}

export class AgentCoreFetchNewsAgentStack extends Stack {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props);

    const { envName, userPool, userPoolClient } = props;

    const role = createIamRole(this, envName);

    createAgentCoreRuntime(this, envName, role, userPool, userPoolClient);
  }
}
