import { Button } from '@chakra-ui/button';
import {
  FormControl,
  FormHelperText,
  FormLabel,
} from '@chakra-ui/form-control';
import { Input, InputGroup, InputRightAddon } from '@chakra-ui/input';
import { Divider, Stack } from '@chakra-ui/layout';
import { Center, Text, Icon, Select, useToast } from '@chakra-ui/react';
import * as React from 'react';
import { PencilSquare } from 'react-bootstrap-icons';
import { useActiveWorkout } from '../../context/ActiveWorkoutContext';
import { useUser } from '../../context/UserContext';
import { StoredWorkoutType, Workout } from '../../types';
import { parseInputAsInt } from '../../utils/general';
import { WorkoutToEdit } from '../Modals/WorkoutEditorModal';
import { defaultWorkouts } from './defaultWorkouts';
import { ApiStatus, ImportWorkout } from './ImportWorkout';
import { WorkoutListItem } from './WorkoutListItem';
import { useData } from '../../context/DataContext';
import { stringToRouteName } from '../../gps';
import { toggleWorkoutVisibility } from '../../api';

interface Props {
  setActiveWorkout: (workout: Workout, ftp: number) => void;
  setWorkoutToEdit: (workout: WorkoutToEdit) => void;
}
export const WorkoutOverview = ({
  setWorkoutToEdit,
  setActiveWorkout,
}: Props) => {
  const { workouts, localWorkouts, user } = useUser();
  const { activeFtp, setActiveFtp } = useActiveWorkout();
  const [previewFtp, setPreviewFtp] = React.useState('' + activeFtp);
  const previewFtpAsNumber = parseInputAsInt(previewFtp);
  const { activeRoute, setActiveRoute } = useData();
  const toast = useToast();
  const token = (user.loggedIn && user.token) || null;

  const allVisibleUserWorkouts = [
    ...workouts.map((workout) => ({
      workout,
      type: 'remote' as StoredWorkoutType,
    })),
    ...localWorkouts.map((workout) => ({
      workout,
      type: 'local' as StoredWorkoutType,
    })),
  ].filter((userWorkout) => userWorkout.workout.visible);

  // should this be defined in the WorkoutListItem instead, where it is used?
  const sendTrash = async (workoutId: string) => {
    if (token) {
      const res = await toggleWorkoutVisibility(token, workoutId, false);
      if (res.status === ApiStatus.FAILURE) {
        toast({
          title: `Deleting workout`,
          isClosable: true,
          duration: 5000,
          status: 'error',
        });
        return;
      }
      // setIsWorkoutUnsaved(false);
    }
  };

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
            visible: true,
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

      <FormControl id="route">
        <FormLabel>Active route</FormLabel>
        <Select
          onChange={(e) => setActiveRoute(stringToRouteName(e.target.value))}
          value={activeRoute.name}
        >
          <option value="zap">Zap (10 km)</option>
          <option value="D">D (10 km)</option>
        </Select>
      </FormControl>

      {allVisibleUserWorkouts.length > 0 && <Divider />}
      {allVisibleUserWorkouts.map(({ workout, type }, i) => (
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
          sendToTrash={sendTrash}
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
