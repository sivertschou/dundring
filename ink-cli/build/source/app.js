import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { render, Text } from 'ink';
import * as api from './api';
export default function App() {
    const Counter = () => {
        const [counter, setCounter] = React.useState(0);
        const [workouts, setWorkouts] = React.useState([]);
        React.useEffect(() => {
            const res = api.fetchMyWorkouts(api.token).then(res => {
                if (res.status === api.ApiStatus.SUCCESS) {
                    setWorkouts(res.data.workouts);
                    //   console.log('HER');
                    //   console.log(r);
                }
            });
            // .catch(x => console.log(x));
        }, []);
        React.useEffect(() => {
            const timer = setInterval(() => {
                setCounter(previousCounter => previousCounter + 1);
            }, 100);
            return () => {
                clearInterval(timer);
            };
        }, []);
        return _jsxs(Text, { color: "green", children: [counter, " tests passed"] });
    };
    return render(_jsx(Counter, {}));
}
