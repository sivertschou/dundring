import { Workout } from './workoutTypes';

export enum ApiStatus {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  LOADING = 'LOADING',
}
export interface ApiSuccessResponseBody<T> {
  status: ApiStatus.SUCCESS;
  data: T;
}
export interface ApiErrorResponseBody {
  status: ApiStatus.FAILURE;
  message: string;
}
export interface ApiLoading {
  status: ApiStatus.LOADING;
}

export type ApiResponseBody<T> =
  | ApiSuccessResponseBody<T>
  | ApiErrorResponseBody;

export interface MailLoginRequestBody {
  mail: string;
}

export type RequestLoginLinkMailResponseBody =
  | 'Login link sent'
  | 'Register link sent';

export interface AuthenticationRequestBody {
  code: string;
}

export interface AuthenticationResponseBody {
  user_created: boolean;
  data: LoginResponseBody;
}

export interface LoginResponseBody {
  username: string;
  userId: string;
  token: string;
  ftp: number;
}

export interface UserUpdateRequestBody {
  ftp?: number;
  username?: string;
}

export interface UserUpdateResponseBody {
  ftp: number;
  username: string;
  accessToken: string;
}

export interface WorkoutsResponseBody {
  workouts: Workout[];
}
export interface UpdateWorkoutResponseBody {
  workout: Workout;
}

export interface GetWorkoutResponseBody {
  workout: Workout;
}

export interface WorkoutRequestBody {
  workout: Workout;
}
