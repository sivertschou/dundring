import { Workout } from './workoutTypes';
import { Message } from './messageTypes';
import { UserRole } from './userTypes';

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

export interface MailAuthenticationRequestBody {
  ticket: string;
}

export interface MailAuthenticationRegisterRequestBody {
  ticket: string;
  username: string;
}

export type MailAuthenticationResponseBody =
  | { type: 'user_exists'; data: LoginResponseBody }
  | { type: 'user_does_not_exist'; mail: string };

export interface LoginResponseBody {
  username: string;
  userId: string;
  token: string;
  ftp: number;
}

export interface UserUpdateRequestBody {
  ftp: number;
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

export interface MessagesResponseBody {
  messages: Message[];
}

export interface WorkoutRequestBody {
  workout: Workout;
}
