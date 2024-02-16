import {Icon, IconButton, Tooltip} from '@chakra-ui/react';
import {BarChartLine, BarChartLineFill} from 'react-bootstrap-icons';
import {useNavigate} from 'react-router-dom';
import {useActiveWorkout} from '../../context/ActiveWorkoutContext';

export const SelectWorkoutButton = () => {
	const navigate = useNavigate();
	const {activeWorkout} = useActiveWorkout();

	const text = activeWorkout.workout ? 'Change workout' : 'Select workout';
	return (
		<Tooltip label={text}>
			<IconButton
				aria-label={text}
				icon={
					<Icon as={activeWorkout.workout ? BarChartLineFill : BarChartLine} />
				}
				onClick={() => navigate('/workout')}
			/>
		</Tooltip>
	);
};
