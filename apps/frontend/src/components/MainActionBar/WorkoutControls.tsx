import {
	Button,
	Center,
	Divider,
	HStack,
	Icon,
	IconButton,
	Stack,
	Text,
	Tooltip,
} from '@chakra-ui/react';
import * as React from 'react';
import {
	ArrowRepeat,
	PauseFill,
	PlayFill,
	SkipBackwardFill,
	SkipForwardFill,
	SkipStartFill,
} from 'react-bootstrap-icons';
import {useNavigate} from 'react-router-dom';
import {useActiveWorkout} from '../../context/ActiveWorkoutContext';
import {useData} from '../../context/DataContext';
import {useWorkoutEditorModal} from '../../context/ModalContext';
import {useLinkColor} from '../../hooks/useLinkColor';
import {ActiveWorkout} from '../../types';

const getPlayButtonText = (activeWorkout: ActiveWorkout) => {
	if (!activeWorkout.workout) return 'No workout selected.';

	switch (activeWorkout.status) {
		case 'not_started':
			return 'Start workout';
		case 'paused':
			return 'Resume workout';
		case 'active':
			return 'Pause workout';
		case 'finished':
			return 'Restart workout';
	}
};
export const WorkoutControls = () => {
	const {activeWorkout, syncResistance, changeActivePart, pause, start} =
		useActiveWorkout();
	const {addLap} = useData();
	const linkColor = useLinkColor();
	const navigate = useNavigate();

	const isWorkoutSelected = activeWorkout.workout !== null;
	const activeWorkoutPart = activeWorkout.activePart;
	const playButtonText = getPlayButtonText(activeWorkout);

	return (
		<Stack>
			<Text fontSize="xs" fontWeight="bold" opacity="0.5">
				Workout controls
			</Text>

			<Tooltip
				label="You need to select a workout to use this functionality."
				isDisabled={isWorkoutSelected}
				placement="top"
			>
				<Center>
					<HStack>
						<Tooltip label="Re-sync resistance" placement="top">
							<IconButton
								size="sm"
								aria-label="Re-sync resistance"
								icon={<Icon as={ArrowRepeat} />}
								isDisabled={!isWorkoutSelected}
								onClick={syncResistance}
							/>
						</Tooltip>
						<Tooltip label="Previous part" placement="top">
							<IconButton
								size="sm"
								aria-label="Previous part"
								icon={<Icon as={SkipBackwardFill} />}
								isDisabled={
									!isWorkoutSelected ||
									(activeWorkoutPart === 0 &&
										activeWorkout.status !== 'finished')
								}
								onClick={() => {
									if (!activeWorkout.workout) return;

									if (activeWorkout.status === 'finished') {
										changeActivePart(
											activeWorkout.workout.parts.length - 1,
											addLap,
										);
										return;
									}
									if (activeWorkoutPart <= 0) return;

									changeActivePart(activeWorkoutPart - 1, addLap);
								}}
							/>
						</Tooltip>

						<Tooltip label="Go to start of the part" placement="top">
							<IconButton
								size="sm"
								aria-label="Go to start of the part"
								icon={<Icon as={SkipStartFill} />}
								isDisabled={!isWorkoutSelected}
								onClick={() => {
									if (!activeWorkout.workout) return;

									changeActivePart(activeWorkoutPart, addLap);
								}}
							/>
						</Tooltip>

						<Tooltip label={playButtonText} placement="top">
							<IconButton
								size="sm"
								aria-label={playButtonText}
								icon={
									<Icon
										as={
											activeWorkout.status === 'active' ? PauseFill : PlayFill
										}
									/>
								}
								isDisabled={!isWorkoutSelected}
								onClick={() => {
									if (!activeWorkout.workout) return;

									switch (activeWorkout.status) {
										case 'finished': {
											changeActivePart(0, addLap);
											return;
										}

										case 'active': {
											pause();
											return;
										}
										default: {
											start();
											return;
										}
									}
								}}
							/>
						</Tooltip>
						<Tooltip label="Next part" placement="top">
							<IconButton
								size="sm"
								aria-label="Next part"
								icon={<Icon as={SkipForwardFill} />}
								isDisabled={!isWorkoutSelected}
								onClick={() => {
									if (!activeWorkout.workout) return;

									if (activeWorkout.status === 'finished') {
										changeActivePart(0, addLap);
									} else {
										changeActivePart(activeWorkoutPart + 1, addLap);
									}
								}}
							/>
						</Tooltip>
					</HStack>
				</Center>
			</Tooltip>

			{!isWorkoutSelected ? (
				<>
					<Center>
						<HStack>
							<Button
								variant="link"
								color={linkColor}
								onClick={() => navigate('/workout')}
							>
								Select workout
							</Button>
						</HStack>
					</Center>
					<Divider />
				</>
			) : null}
		</Stack>
	);
};
