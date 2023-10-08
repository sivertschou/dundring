import { Button } from '@chakra-ui/button';
import {
  FormControl,
  FormHelperText,
  FormLabel,
} from '@chakra-ui/form-control';
import Icon from '@chakra-ui/icon';
import { Input, InputGroup, InputRightAddon } from '@chakra-ui/input';
import { Divider, Stack } from '@chakra-ui/layout';
import { Center, Text } from '@chakra-ui/react';
import * as React from 'react';
import { PencilSquare } from 'react-bootstrap-icons';
import { useActiveWorkout } from '../../context/ActiveWorkoutContext';
import { useUser } from '../../context/UserContext';
import { StoredWorkoutType, Workout, WorkoutType } from '../../types';
import { parseInputAsInt } from '../../utils/general';
import { WorkoutToEdit } from '../Modals/WorkoutEditorModal';
import { defaultWorkouts } from './defaultWorkouts';
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
  const { workouts, localWorkouts } = useUser();
  const { activeFtp, setActiveFtp } = useActiveWorkout();
  const [previewFtp, setPreviewFtp] = React.useState('' + activeFtp);
  const previewFtpAsNumber = parseInputAsInt(previewFtp);

  const allUserWorkouts = [
    ...workouts.map((workout) => ({
      workout,
      type: 'remote' as StoredWorkoutType,
    })),
    ...localWorkouts.map((workout) => ({
      workout,
      type: 'local' as StoredWorkoutType,
    })),
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
        <FormLabel>Active FTP</FormLabel>
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

      {allUserWorkouts.length > 0 && <Divider />}
      {allUserWorkouts.map(({ workout, type }, i) => (
        <WorkoutListItem
          key={i}
          type={type}
          workout={workout}
          setActiveWorkout={(workout: Workout) =>
            setActiveWorkout(workout, previewFtpAsNumber)
          }
          onClickEdit={() => {
            setWorkoutToEdit({
              ...workout,
              type,
              previewFtp: previewFtpAsNumber,
            });
          }}
        />
      ))}

      <Divider />
      <Center>
        <Text size="5xl">Predefined workouts</Text>
      </Center>
      {defaultWorkouts.map((workout, i) => (
        <WorkoutListItem
          key={i}
          type="library"
          workout={workout}
          setActiveWorkout={(workout: Workout) =>
            setActiveWorkout(workout, previewFtpAsNumber)
          }
          onClickEdit={() => {
            setWorkoutToEdit({
              ...workout,
              type: 'new',
              previewFtp: previewFtpAsNumber,
            });
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
