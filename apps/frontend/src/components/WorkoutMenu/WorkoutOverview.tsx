import { Button } from '@chakra-ui/button';
import {
  FormControl,
  FormHelperText,
  FormLabel,
} from '@chakra-ui/form-control';
import Icon from '@chakra-ui/icon';
import { Input, InputGroup, InputRightAddon } from '@chakra-ui/input';
import { Divider, Stack } from '@chakra-ui/layout';
import { ApiStatus } from '@dundring/types';
import * as React from 'react';
import { PencilSquare } from 'react-bootstrap-icons';
import { deleteWorkout } from '../../api';
import { useActiveWorkout } from '../../context/ActiveWorkoutContext';
import { useUser } from '../../context/UserContext';
import { Workout } from '../../types';
import { parseInputAsInt } from '../../utils/general';
import { WorkoutToEdit } from '../Modals/WorkoutEditorModal';
import { ImportWorkout } from './ImportWorkout';
import { WorkoutListItem } from './WorkoutListItem';

interface Props {
  setActiveWorkout: (workout: Workout, ftp: number) => void;
  setWorkoutToEdit: (workout: WorkoutToEdit) => void;
}
export const WorkoutOverview = ({
  setWorkoutToEdit,
  setActiveWorkout,
}: Props) => {
  const { user, workouts, localWorkouts } = useUser();
  const token = (user.loggedIn && user.token) || null;
  const { activeFtp, setActiveFtp } = useActiveWorkout();
  const [previewFtp, setPreviewFtp] = React.useState('' + activeFtp);
  const previewFtpAsNumber = parseInputAsInt(previewFtp);

  const allWorkouts = [
    ...workouts.map((workout) => ({ workout, locallyStored: false })),
    ...localWorkouts.map((workout) => ({ workout, locallyStored: true })),
  ];

  return (
    <Stack p="5">
      <Button
        fontSize="xl"
        mb="5"
        rightIcon={<Icon as={PencilSquare} />}
        onClick={() =>
          setWorkoutToEdit({
            name: 'New workout',
            parts: [
              {
                duration: 5 * 60,
                targetPower: 70,
                type: 'steady',
              },
            ],
            id: '',
            type: 'new',
            previewFtp: previewFtpAsNumber,
          })
        }
      >
        Create new workout
      </Button>
      <FormControl id="ftp">
        <FormLabel>Active Ftp</FormLabel>
        <InputGroup>
          <Input
            value={previewFtp}
            onChange={(e) => setPreviewFtp(e.target.value)}
            onBlur={(_) => setActiveFtp(parseInputAsInt(previewFtp))}
          />
          <InputRightAddon children="W" />
        </InputGroup>
        <FormHelperText>
          This value will be used as your FTP for this session. You can change
          your actual FTP on your profile page
        </FormHelperText>
      </FormControl>

      <Divider />
      {allWorkouts.map(({ workout, locallyStored }, i) => (
        <WorkoutListItem
          key={i}
          isLocallyStored={locallyStored}
          workout={workout}
          setActiveWorkout={(workout: Workout) =>
            setActiveWorkout(workout, previewFtpAsNumber)
          }
          onClickEdit={() => {
            setWorkoutToEdit({
              ...workout,
              type: locallyStored ? 'local' : 'remote',
              previewFtp: previewFtpAsNumber,
            });
          }}
          onClickDelete={async () => {
            console.log(token);
            if (token) {
              const res = await deleteWorkout(token, workout.id);
              if (res.status === ApiStatus.FAILURE) {
                // TODO: Show error message
                console.log('FAILURE');
                return;
              }
            }
          }}
        />
      ))}

      <Divider />
      <ImportWorkout
        setWorkoutToEdit={setWorkoutToEdit}
        previewFtp={previewFtpAsNumber}
      />
    </Stack>
  );
};
