import {
  ApiResponseBody,
  LoginRequestBody,
  LoginResponseBody,
  RegisterRequestBody,
} from "../../common/types/apiTypes";

const baseUrl = process.env.REACT_APP_BASE_URL;

const get = async <T>(url: string): Promise<T> => {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return response.json();
};

const post = async <T, U>(url: string, body: U, token?: string): Promise<T> => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  return response.json();
};

const authPost = async <T, U>(
  url: string,
  body: U,
  token: string
): Promise<T> => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  return response.json();
};

export const login = async (loginData: LoginRequestBody) => {
  return post<ApiResponseBody<LoginResponseBody>, LoginRequestBody>(
    `${baseUrl}/login`,
    loginData
  );
};

export const register = async (registerData: RegisterRequestBody) => {
  return post<ApiResponseBody<LoginResponseBody>, RegisterRequestBody>(
    `${baseUrl}/register`,
    registerData
  );
};

export const validateToken = async (token: string) => {
  if (token) {
    return authPost<ApiResponseBody<LoginResponseBody>, {}>(
      `${baseUrl}/validate`,
      {},
      token
    );
  }
  return undefined;
};
