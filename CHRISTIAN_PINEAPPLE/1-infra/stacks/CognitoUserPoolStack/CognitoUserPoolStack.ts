import { Stack, StackProps } from "aws-cdk-lib";
import { UserPool, UserPoolClient } from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";
import { createUserPool } from "./utils/createUserPool";
import { createUserPoolClient } from "./utils/createUserPoolClient";

interface Props extends StackProps {
  envName: string;
}

export class CognitoUserPoolStack extends Stack {
  public userPool: UserPool;
  public userPoolClient: UserPoolClient;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props);

    const { envName } = props;

    this.userPool = createUserPool(this, envName);
    this.userPoolClient = createUserPoolClient(this, this.userPool, envName);

    // const domain = this.userPool.addDomain("Domain", {
    //   cognitoDomain: {
    //     domainPrefix: `${envName}-${projectName}-${tenantName}-cognito`, // must be globally unique
    //   },
    // });

    // new CfnOutput(this, "CognitoBaseUrl", {
    //   value: `https://${domain.domainName}.auth.${this.region}.amazoncognito.com`,
    // });

    // new CfnOutput(this, "AuthorizeUrl", {
    //   value: `https://${domain.domainName}.auth.${this.region}.amazoncognito.com/oauth2/authorize?client_id=${this.userPoolClient.userPoolClientId}&response_type=code&scope=openid+email+profile&redirect_uri=http://localhost:3000/callback`,
    // });
  }
}
