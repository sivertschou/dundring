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
  | ApiErrorResponseBody
  | ApiLoading;

export interface LoginRequestBody {
  username: string;
  password: string;
}

export interface LoginResponseBody {
  username: string;
  roles: UserRole[];
  token: string;
}

export interface RegisterRequestBody {
  username: string;
  mail: string;
  password: string;
}

export interface WorkoutsResponseBody {
  workouts: Workout[];
}

export interface MessagesResponseBody {
  messages: Message[];
}

export interface WorkoutRequestBody {
  workout: Workout;
}
