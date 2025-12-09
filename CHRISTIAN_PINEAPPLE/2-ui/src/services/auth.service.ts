import { AUTH_API_URL } from "../constants";

export const loginService = async (email: string, password: string) => {
  const credentials = { email, password };

  console.log("login servicee päästiin ja täs credut:");
  console.log(credentials);

  const response = await fetch(`${AUTH_API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("error in loginService:", errorText);
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const tokens = await response.json();

  console.log("tokens:", tokens);

  return tokens;
};

export const registerService = async (email: string, password: string) => {
  const credentials = { email, password };

  console.log("register servicee päästiin ja täs credut:");
  console.log(credentials);

  const response = await fetch(`${AUTH_API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("error in registerService:", errorText);
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const tokens = await response.json();

  console.log("tokens:", tokens);

  return tokens;
};

export const authenticateWithRefreshTokenService = async (
  refreshToken: string
) => {
  const response = await fetch(`${AUTH_API_URL}/auth/refresh-tokens`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("error in authenticateWithRefreshTokenService:", errorText);
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const tokens = await response.json();

  console.log("tokens:", tokens);

  return tokens;
};
