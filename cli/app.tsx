import * as api from './api';

import React, {useState, useEffect} from 'react';
import {render, Text} from 'ink';

const Counter = () => {
	const [counter, setCounter] = useState(0);

	useEffect(() => {
		const timer = setInterval(() => {
			setCounter(previousCounter => previousCounter + 1);
		}, 100);

		return () => {
			clearInterval(timer);
		};
	}, []);

	return <Text color="green">{counter} tests passed</Text>;
};

render(<Counter />);

let r = null;

const res = api
	.fetchMyWorkouts(api.token)
	.then(res => {
		if (res.status === api.ApiStatus.SUCCESS) {
			r = JSON.stringify(res.data.workouts);
			screen.append(box);
			//   console.log('HER');
			//   console.log(r);
		}
	})
	.catch(x => console.log(x));
