import { Amplify } from "aws-amplify";
import { COGNITO_USER_POOL_ID, COGNITO_CLIENT_ID } from "./constants";

// Configure Amplify with your Cognito settings
export const configureAmplify = () => {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: COGNITO_USER_POOL_ID,
        userPoolClientId: COGNITO_CLIENT_ID,
      },
    },
  });
};
