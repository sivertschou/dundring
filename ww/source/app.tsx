import React from 'react';
import { render, Text } from 'ink';

const httpUrl = 'http://localhost:8080/api';

export const token =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0NGVjYmIxYy1iMDA1LTQzNTMtODE3NS0zY2JjZGYyNzU3MTIiLCJ1c2VybmFtZSI6Im1vcnRlYWtvIiwiaWF0IjoxNzA4MDk1MTI2LCJleHAiOjE3MTg0NjMxMjZ9.O1TOICCigHB4umkQkzFLI9OQadcNTaWnbt2ijUbdRt8';

export const fetchMyWorkouts = async (token: string) => {
	return authGet(`${httpUrl}/workouts`, token);
};

export const authGet = async (
	url: string,
	token: string,
	abortController?: AbortController,
): Promise<ApiResponseBody<any>> => {
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




export type ApiResponseBody<T> =
	| ApiSuccessResponseBody<T>
	| ApiErrorResponseBody;

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



export default function App() {
	const Counter = () => {
		// const [counter, setCounter] = React.useState(0);

		const [workouts, setWorkouts] = React.useState([] as any[]);

		React.useEffect(() => {
			fetchMyWorkouts(token).then(res => {
				if (res.status === ApiStatus.SUCCESS) {
					setWorkouts(res.data.workouts);

					//   console.log('HER');
					//   console.log(r);
				}
			});
			// .catch(x => console.log(x));
		}, []);



		return <Text color="green">{workouts} tests passed</Text>;
	};

	return render(<Counter />);
}





