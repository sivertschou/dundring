import {SuccessStatus, ErrorStatus, Status} from '@dundring/types';

export const success = <T>(data: T): SuccessStatus<T> => ({
	status: 'SUCCESS',
	data,
});

export const error = <E>(error: E): ErrorStatus<E> => ({
	status: 'ERROR',
	type: error,
});

export const isSuccess = <T, E>(
	status: Status<T, E>,
): status is SuccessStatus<T> => status.status === 'SUCCESS';

export const isError = <T, E>(status: Status<T, E>): status is ErrorStatus<E> =>
	status.status === 'ERROR';

export const successMap = <T1, E, T2>(
	status: Status<T1, E>,
	f: (s: T1) => T2,
): Status<T2, E> =>
	status.status === 'SUCCESS' ? success(f(status.data)) : status;
