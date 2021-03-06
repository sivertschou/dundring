import {
  ApiResponseBody,
  ImportWorkoutResponseBody,
  LoginRequestBody,
  LoginResponseBody,
  RegisterRequestBody,
  UserUpdateRequestBody,
  WorkoutRequestBody,
  WorkoutsResponseBody,
} from '../../common/types/apiTypes';

export const domain = process.env.REACT_APP_DOMAIN || 'http://localhost:3000';

export const httpUrl =
  process.env.REACT_APP_HTTP_URL || 'http://localhost:8080/api';

export const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8080';

const get = async <T>(url: string): Promise<T> => {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  return response.json();
};

const post = async <T, U>(url: string, body: U, token?: string): Promise<T> => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });

  return response.json();
};

const authGet = async <T>(url: string, token: string): Promise<T> => {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
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
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  return response.json();
};

export const login = async (loginData: LoginRequestBody) => {
  return post<ApiResponseBody<LoginResponseBody>, LoginRequestBody>(
    `${httpUrl}/login`,
    loginData
  );
};

export const register = async (registerData: RegisterRequestBody) => {
  return post<ApiResponseBody<LoginResponseBody>, RegisterRequestBody>(
    `${httpUrl}/register`,
    registerData
  );
};

export const validateToken = async (token: string) => {
  return authPost<ApiResponseBody<LoginResponseBody>, {}>(
    `${httpUrl}/validate`,
    token,
    {}
  );
};

export const fetchMyWorkouts = async (token: string) => {
  return authGet<ApiResponseBody<WorkoutsResponseBody>>(
    `${httpUrl}/me/workouts`,
    token
  );
};

export const importWorkout = async (username: string, id: string) => {
  return get<ApiResponseBody<ImportWorkoutResponseBody>>(
    `${httpUrl}/${username}/workouts/${id}`
  );
};

export const saveWorkout = async (
  token: string,
  workout: WorkoutRequestBody
) => {
  return authPost<ApiResponseBody<WorkoutsResponseBody>, WorkoutRequestBody>(
    `${httpUrl}/me/workout`,
    token,
    workout
  );
};

export const updateUser = async (token: string, data: { ftp: number }) => {
  return authPost<
    ApiResponseBody<UserUpdateRequestBody>,
    UserUpdateRequestBody
  >(`${httpUrl}/me`, token, data);
};
