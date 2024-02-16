import {
  ApiResponseBody,
  AuthenticationRequestBody,
  AuthenticationResponseBody,
  GetWorkoutResponseBody,
  LoginResponseBody,
  MailLoginRequestBody,
  RequestLoginLinkMailResponseBody,
  UserUpdateRequestBody,
  WorkoutRequestBody,
  WorkoutsResponseBody,
} from '@dundring/types';
import { getEnv } from './utils/environment';

export const domain = location.origin;

export const httpUrl = getEnv().dundringHttpServerUrl;
export const wsUrl = getEnv().dundringWsServerUrl;

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
  >(`${httpUrl}/auth/mail/login`, data);
};

export const authenticateMailLogin = async (
  body: AuthenticationRequestBody
) => {
  return post<
    ApiResponseBody<AuthenticationResponseBody>,
    AuthenticationRequestBody
  >(`${httpUrl}/auth/mail/authenticate`, body);
};

export const authenticateStravaLogin = async (
  body: AuthenticationRequestBody
) => {
  return post<
    ApiResponseBody<AuthenticationResponseBody>,
    AuthenticationRequestBody
  >(`${httpUrl}/auth/strava/authenticate`, body);
};

export const validateToken = async (
  token: string,
  abortController: AbortController
) => {
  return authPost<ApiResponseBody<LoginResponseBody>, {}>(
    `${httpUrl}/auth/token/validate`,
    token,
    {},
    abortController
  );
};

export const fetchMyWorkouts = async (token: string) => {
  return authGet<ApiResponseBody<WorkoutsResponseBody>>(
    `${httpUrl}/workouts`,
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
    `${httpUrl}/workouts`,
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
