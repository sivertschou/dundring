interface SuccessStatus<T> {
  status: 'SUCCESS';
  data: T;
}
interface ErrorStatus<E> {
  status: 'ERROR';
  type: E;
}

export type Status<T, E> = SuccessStatus<T> | ErrorStatus<E>;
