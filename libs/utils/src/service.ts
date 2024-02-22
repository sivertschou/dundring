import { SuccessStatus, ErrorStatus, Status } from '@dundring/types';

export const success = <T>(data: T): SuccessStatus<T> => ({
  status: 'SUCCESS',
  data,
});

export const error = <E>(error: E): ErrorStatus<E> => ({
  status: 'ERROR',
  type: error,
});

export const isSuccess = <T, E>(
  status: Status<T, E>
): status is SuccessStatus<T> => status.status === 'SUCCESS';

export const isError = <T, E>(status: Status<T, E>): status is ErrorStatus<E> =>
  status.status === 'ERROR';

export const successMap = <T1, E, T2>(
  status: Status<T1, E>,
  f: (s: T1) => T2
): Status<T2, E> =>
  status.status === 'SUCCESS' ? success(f(status.data)) : status;

export const retry = async <T, E>(
  f: () => Promise<Status<T, E>>,
  attempts = 5
): Promise<Status<T, E | 'Retry failed after several attempts'>> => {
  for (let i = 0; i < attempts; i++) {
    const ret = await f();

    if (isSuccess(ret)) {
      return ret;
    }
  }

  return error('Retry failed after several attempts');
};

export const isNotNull = <T>(arg: T): arg is Exclude<T, null> => {
  return arg !== null;
};
