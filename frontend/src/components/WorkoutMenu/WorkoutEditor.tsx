import { Button } from '@chakra-ui/button';
import { FormControl, FormLabel } from '@chakra-ui/form-control';
import { Input } from '@chakra-ui/input';
import { Grid, HStack, Stack, Text } from '@chakra-ui/layout';
import * as React from 'react';
import { Workout, WorkoutPart } from '../../types';
import { templateColumns, WorkoutIntervalInput } from './WorkoutIntervalInput';
import { DropResult } from 'react-beautiful-dnd';
import { DraggableList } from './DraggableList';
import { DraggableItem } from './DraggableItem';
import {
  formatMinutesAndSecondsAsString,
  secondsToMinutesAndSeconds,
} from '../../utils';
import { useUser } from '../../context/UserContext';
import { saveWorkout } from '../../api';
import { CloudUpload, Hdd } from 'react-bootstrap-icons';
import Icon from '@chakra-ui/icon';
import { WorkoutToEdit } from '../Modals/WorkoutEditorModal';
import { useActiveWorkout } from '../../context/WorkoutContext';
interface Props {
  workout: WorkoutToEdit;
  closeEditor: () => void;
}

interface EditableWorkoutPart extends WorkoutPart {
  id: number;
}
interface EditableWorkout extends Workout {
  parts: EditableWorkoutPart[];
}

export const WorkoutEditor = ({
  workout: loadedWorkout,
  closeEditor,
}: Props) => {
  const { activeFTP, setActiveFTP } = useActiveWorkout();
  const { user, saveLocalWorkout } = useUser();
  const token = user.loggedIn && user.token;
  const canSaveLocally =
    loadedWorkout.type === 'new' || loadedWorkout.type === 'local';
  const canSaveRemotely =
    token && (loadedWorkout.type === 'new' || loadedWorkout.type === 'remote');

  const parseInputAsInt = (input: string) => {
    const parsed = parseInt(input);
    if (isNaN(parsed)) {
      return 0;
    }
    return parsed;
  };

  const [ftp, setFtp] = React.useState('' + activeFTP);

  const ftpNum = parseInputAsInt(ftp);

  const [workout, setWorkout] = React.useState<EditableWorkout>({
    ...loadedWorkout,
    parts: loadedWorkout.parts.map((part, i) => ({ ...part, id: i })),
  });
  const checkValidation = true;
  const totalDuration = workout.parts.reduce(
    (sum, part) => sum + part.duration,
    0
  );
  const totalDurationFormatted = formatMinutesAndSecondsAsString(
    secondsToMinutesAndSeconds(totalDuration)
  );

  function onDragEnd(result: DropResult) {
    const { destination, source } = result;
    // reorderedParts
    if (!destination) {
      return;
    }
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const updatedArray = [...workout.parts];
    updatedArray.splice(source.index, 1);
    updatedArray.splice(destination.index, 0, workout.parts[source.index]);
    setWorkout((workout) => ({ ...workout, parts: updatedArray }));
  }

  const getNextWorkoutPartsId = (workoutParts: EditableWorkoutPart[]) =>
    workoutParts.reduce((maxId, cur) => Math.max(maxId, cur.id), 0) + 1;

  return (
    <Stack p="5">
      <FormControl id="workoutName">
        <FormLabel>Workout name</FormLabel>
        <Input
          autoFocus={loadedWorkout.type === 'new'}
          value={workout.name}
          onChange={(e) =>
            setWorkout((workout) => ({ ...workout, name: e.target.value }))
          }
          placeholder="Workout name"
        />
      </FormControl>
      <FormControl id="ftp">
        <FormLabel>FTP</FormLabel>
        <Input
          value={ftp}
          onChange={(e) => setFtp(e.target.value)}
          onBlur={() => setActiveFTP(parseInputAsInt(ftp))}
        />
      </FormControl>

      {workout.parts.length > 0 ? (
        <Grid templateColumns={templateColumns} gap="1" mb="2">
          <Text />
          <Text>Minutes</Text>
          <Text>Seconds</Text>
          <Text />
          <Text>Power</Text>
        </Grid>
      ) : null}
      <DraggableList onDragEnd={onDragEnd}>
        {workout.parts.map((part, index) => (
          <DraggableItem id={part.id + ''} index={index} key={part.id}>
            <WorkoutIntervalInput
              key={part.id}
              checkValidation={checkValidation}
              removeWorkoutPart={() =>
                setWorkout((workout) => ({
                  ...workout,
                  parts: workout.parts.filter((_part, i) => index !== i),
                }))
              }
              duplicateWorkoutPart={() =>
                setWorkout((workout) => {
                  const newParts = [...workout.parts];
                  newParts.splice(index + 1, 0, {
                    ...workout.parts[index],
                    id: getNextWorkoutPartsId(workout.parts),
                  });
                  return {
                    ...workout,
                    parts: newParts,
                  };
                })
              }
              setWorkoutPart={(workoutPart: WorkoutPart) => {
                setWorkout((workout) => {
                  return {
                    ...workout,
                    parts: workout.parts.map((part, i) =>
                      index === i ? { ...part, ...workoutPart } : part
                    ),
                  };
                });
              }}
              workoutPart={part}
              ftp={ftpNum}
            />
          </DraggableItem>
        ))}
      </DraggableList>

      <Button
        onClick={() =>
          setWorkout((workout) => ({
            ...workout,
            parts: [
              ...workout.parts,
              {
                duration: 120,
                targetPower: 75,
                id: getNextWorkoutPartsId(workout.parts),
              },
            ],
          }))
        }
      >
        Add part
      </Button>
      <Text>Total duration: {totalDurationFormatted}</Text>
      <HStack>
        {canSaveRemotely ? (
          <Button
            onClick={() => {
              saveWorkout(token, { workout });
              closeEditor();
            }}
            leftIcon={<Icon as={CloudUpload} />}
          >
            Save
          </Button>
        ) : null}
        {canSaveLocally ? (
          <Button
            onClick={() => {
              saveLocalWorkout(workout);
              closeEditor();
            }}
            leftIcon={<Icon as={Hdd} />}
          >
            Save locally
          </Button>
        ) : null}
        <Button onClick={closeEditor}>Cancel</Button>
      </HStack>
    </Stack>
  );
};
