interface SuccessStatus<T> {
  status: 'SUCCESS';
  data: T;
}
interface ErrorStatus<E> {
  status: 'ERROR';
  type: E;
}

export type Status<T, E> = SuccessStatus<T> | ErrorStatus<E>;

export const mapStatus = <T, E, U>(
  data: Status<T, E>,
  f: (data: T) => U
): Status<U, E> => {
  if (data.status === 'SUCCESS') {
    return { status: 'SUCCESS', data: f(data.data) };
  }
  return data;
};
