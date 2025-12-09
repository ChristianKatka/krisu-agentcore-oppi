import { Stack } from "aws-cdk-lib";
import { UserPool, VerificationEmailStyle } from "aws-cdk-lib/aws-cognito";
import {
  projectName,
  projectNamePascal,
  tenantName,
  tenantNamePascal,
} from "../../../constants";

export const createUserPool = (stack: Stack, envName: string) => {
  const logicalId = `${envName}${projectNamePascal}${tenantNamePascal}UserPool`;
  const name = `${envName}-${projectName}-${tenantName}---user-pool`;

  const userPool = new UserPool(stack, logicalId, {
    userPoolName: name,
    selfSignUpEnabled: true,
    signInAliases: {
      email: true,
    },
    autoVerify: {
      email: true,
    },
    userVerification: {
      emailStyle: VerificationEmailStyle.CODE,
    },
  });

  return userPool;
};
