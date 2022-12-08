import {
  ApiResponseBody,
  GetWorkoutResponseBody,
  LoginResponseBody,
  MailAuthenticationRegisterRequestBody,
  MailAuthenticationRequestBody,
  MailAuthenticationResponseBody,
  MailLoginRequestBody,
  RequestLoginLinkMailResponseBody,
  UserUpdateRequestBody,
  WorkoutRequestBody,
  WorkoutsResponseBody,
} from '@dundring/types';
export const domain = import.meta.env.VITE_DOMAIN || 'http://localhost:3000';

export const httpUrl =
  import.meta.env.VITE_HTTP_URL || 'http://localhost:8080/api';

export const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080';

const get = async <T>(
  url: string,
  abortController?: AbortController
): Promise<T> => {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    signal: abortController?.signal,
  });

  return response.json();
};

const post = async <T, U>(
  url: string,
  body: U,
  abortController?: AbortController
): Promise<T> => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
    signal: abortController?.signal,
  });

  return response.json();
};

const authGet = async <T>(
  url: string,
  token: string,
  abortController?: AbortController
): Promise<T> => {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      authorization: `Bearer ${token}`,
    },
    signal: abortController?.signal,
  });

  return response.json();
};

const authPost = async <T, U>(
  url: string,
  token: string,
  body: U,
  abortController?: AbortController
): Promise<T> => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
    signal: abortController?.signal,
  });

  return response.json();
};

export const requestLoginLinkMail = async (data: MailLoginRequestBody) => {
  return post<
    ApiResponseBody<RequestLoginLinkMailResponseBody>,
    MailLoginRequestBody
  >(`${httpUrl}/login/mail`, data);
};

export const authenticateMailLogin = async (
  body: MailAuthenticationRequestBody,
  abortController: AbortController
) => {
  return post<
    ApiResponseBody<MailAuthenticationResponseBody>,
    MailAuthenticationRequestBody
  >(`${httpUrl}/auth/mail`, body, abortController);
};

export const registerMailLogin = async (
  body: MailAuthenticationRegisterRequestBody
) => {
  return post<
    ApiResponseBody<LoginResponseBody>,
    MailAuthenticationRegisterRequestBody
  >(`${httpUrl}/register/mail`, body);
};

export const validateToken = async (
  token: string,
  abortController: AbortController
) => {
  return authPost<ApiResponseBody<LoginResponseBody>, {}>(
    `${httpUrl}/validate`,
    token,
    {},
    abortController
  );
};

export const fetchMyWorkouts = async (token: string) => {
  return authGet<ApiResponseBody<WorkoutsResponseBody>>(
    `${httpUrl}/me/workouts`,
    token
  );
};

export const getWorkout = async (workoutId: string) => {
  return get<ApiResponseBody<GetWorkoutResponseBody>>(
    `${httpUrl}/workouts/${workoutId}`
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
