import { Stack } from "aws-cdk-lib";
import { UserPool, UserPoolClient, OAuthScope } from "aws-cdk-lib/aws-cognito";
import {
  projectName,
  projectNamePascal,
  tenantName,
  tenantNamePascal,
} from "../../../constants";

export const createUserPoolClient = (
  stack: Stack,
  userPool: UserPool,
  envName: string
) => {
  const logicalId = `${envName}${projectNamePascal}${tenantNamePascal}UserPoolClient`;
  const name = `${envName}-${projectName}-${tenantName}---user-pool-client`;

  const userPoolClient = new UserPoolClient(stack, logicalId, {
    userPool,
    userPoolClientName: name,
    generateSecret: false,
    authFlows: {
      userPassword: true,
      userSrp: true,
    },
    oAuth: {
      flows: {
        authorizationCodeGrant: true,
        implicitCodeGrant: false,
      },
      scopes: [OAuthScope.OPENID, OAuthScope.EMAIL, OAuthScope.PROFILE],
      callbackUrls: ["http://localhost:3000/callback"],
      logoutUrls: ["http://localhost:3000/logout"],
    },

    preventUserExistenceErrors: false,
    enableTokenRevocation: true,
  });

  return userPoolClient;
};
