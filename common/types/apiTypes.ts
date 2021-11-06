import { Workout } from "./workoutTypes";
import { Message } from "./messageTypes";
export interface LoginRequestBody {
  username: string;
  password: string;
}

export interface RegisterRequestBody {
  username: string;
  email: string;
  password: string;
}

export enum ApiStatus {
  SUCCESS = "SUCCESS",
  FAILURE = "FAILURE",
  LOADING = "LOADING",
}
export interface ApiSuccessResponseBody {
  status: ApiStatus.SUCCESS;
}

export interface ApiErrorResponseBody {
  status: ApiStatus.FAILURE;
  message: string;
}

export interface LoginSuccessResponseBody extends ApiSuccessResponseBody {
  username: string;
  roles: string[];
  token: string;
}
export interface LoginErrorResponseBody extends ApiErrorResponseBody {}

export type LoginResponseBody =
  | LoginSuccessResponseBody
  | LoginErrorResponseBody;

export interface LoginErrorResponseBody extends ApiErrorResponseBody {}

export interface WorkoutsSuccessResponseBody extends ApiSuccessResponseBody {
  workouts: Workout[];
}
export type WorkoutsResponseBody =
  | WorkoutsSuccessResponseBody
  | ApiErrorResponseBody;

export interface MessagesSuccessResponseBody extends ApiSuccessResponseBody {
  messages: Message[];
}
export type MessagesResponseBody =
  | MessagesSuccessResponseBody
  | ApiErrorResponseBody;
