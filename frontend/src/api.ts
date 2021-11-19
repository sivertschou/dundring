import {
  ApiResponseBody,
  LoginRequestBody,
  LoginResponseBody,
  RegisterRequestBody,
  WorkoutRequestBody,
  WorkoutsResponseBody,
} from "../../common/types/apiTypes";

const baseUrl = process.env.REACT_APP_BASE_URL + "/api";

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

const authGet = async <T>(url: string, token: string): Promise<T> => {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      authorization: `Bearer ${token}`,
    },
  });

  return response.json();
};

const authPost = async <T, U>(
  url: string,
  token: string,
  body: U
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
  return authPost<ApiResponseBody<LoginResponseBody>, {}>(
    `${baseUrl}/validate`,
    token,
    {}
  );
};

export const fetchMyWorkouts = async (token: string) => {
  return authGet<ApiResponseBody<WorkoutsResponseBody>>(
    `${baseUrl}/me/workouts`,
    token
  );
};

export const saveWorkout = async (
  token: string,
  workout: WorkoutRequestBody
) => {
  return authPost<ApiResponseBody<WorkoutsResponseBody>, WorkoutRequestBody>(
    `${baseUrl}/me/workout`,
    token,
    workout
  );
};
