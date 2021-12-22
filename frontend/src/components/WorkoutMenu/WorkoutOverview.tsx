import { Button } from '@chakra-ui/button';
import {
  FormControl,
  FormHelperText,
  FormLabel,
} from '@chakra-ui/form-control';
import Icon from '@chakra-ui/icon';
import { Input, InputGroup, InputRightAddon } from '@chakra-ui/input';
import { Divider, Stack } from '@chakra-ui/layout';
import * as React from 'react';
import { PencilSquare } from 'react-bootstrap-icons';
import { useUser } from '../../context/UserContext';
import { useActiveWorkout } from '../../context/WorkoutContext';
import { Workout } from '../../types';
import { parseInputAsInt } from '../../utils';
import { WorkoutToEdit } from '../Modals/WorkoutEditorModal';
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
  const { activeFTP, setActiveFTP } = useActiveWorkout();
  const [previewFTP, setPreviewFTP] = React.useState('' + activeFTP);
  const previewFTPAsNumber = parseInputAsInt(previewFTP);
  return (
    <Stack p="5">
      <Button
        fontSize="xl"
        mb="5"
        rightIcon={<Icon as={PencilSquare} />}
        onClick={() =>
          setWorkoutToEdit({
            name: 'New workout',
            parts: [],
            id: '',
            type: 'new',
            previewFTP: previewFTPAsNumber,
          })
        }
      >
        Create new workout
      </Button>
      <Divider />
      <FormControl id="ftp">
        <FormLabel>Based on FTP</FormLabel>
        <InputGroup>
          <Input
            value={previewFTP}
            onChange={(e) => setPreviewFTP(e.target.value)}
            onBlur={(_) => setActiveFTP(parseInputAsInt(previewFTP))}
          />
          <InputRightAddon children="W" />
        </InputGroup>
        <FormHelperText>
          This value will be used as your FTP for this session. You can change
          your actual FTP on your profile page
        </FormHelperText>
      </FormControl>

      <Divider />
      {workouts.map((workout, i) => (
        <WorkoutListItem
          key={`${i}-${workout.name}`}
          isLocallyStored={false}
          workout={workout}
          setActiveWorkout={(workout: Workout) =>
            setActiveWorkout(workout, previewFTPAsNumber)
          }
          onClickEdit={() => {
            setWorkoutToEdit({
              ...workout,
              type: 'remote',
              previewFTP: previewFTPAsNumber,
            });
          }}
        />
      ))}
      {localWorkouts.map((workout, i) => (
        <WorkoutListItem
          key={`${i}-${workout.name}`}
          isLocallyStored={true}
          workout={workout}
          setActiveWorkout={(workout: Workout) =>
            setActiveWorkout(workout, previewFTPAsNumber)
          }
          onClickEdit={() => {
            setWorkoutToEdit({
              ...workout,
              type: 'local',
              previewFTP: previewFTPAsNumber,
            });
          }}
        />
      ))}
    </Stack>
  );
};
