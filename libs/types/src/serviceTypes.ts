export interface SuccessStatus<T> {
	status: 'SUCCESS';
	data: T;
}
export interface ErrorStatus<E> {
	status: 'ERROR';
	type: E;
}

export type Status<T, E> = SuccessStatus<T> | ErrorStatus<E>;
