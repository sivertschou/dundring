import { Button } from '@chakra-ui/button';
import {
  FormControl,
  FormHelperText,
  FormLabel,
} from '@chakra-ui/form-control';
import { Input, InputGroup, InputRightAddon } from '@chakra-ui/input';
import { Grid, HStack, Stack, Text } from '@chakra-ui/layout';
import * as React from 'react';
import { Workout, WorkoutPart } from '../../types';
import { templateColumns, WorkoutIntervalInput } from './WorkoutIntervalInput';
import { DropResult } from 'react-beautiful-dnd';
import { DraggableList } from './DraggableList';
import { DraggableItem } from './DraggableItem';
import { useUser } from '../../context/UserContext';
import { saveWorkout, toggleWorkoutVisibility } from '../../api';
import { CloudUpload, Hdd, Trash } from 'react-bootstrap-icons';
import { WorkoutToEdit } from '../Modals/WorkoutEditorModal';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Icon,
  Table,
  Tbody,
  Td,
  Tfoot,
  Th,
  Thead,
  Tooltip,
  Tr,
  useToast,
} from '@chakra-ui/react';
import { useActiveWorkout } from '../../context/ActiveWorkoutContext';
import { createZoneTableInfo } from '../../utils/zones';
import { secondsToHoursMinutesAndSecondsString } from '@dundring/utils';
import { getPowerToSpeedMap } from '../../utils/speed';
import { ApiStatus } from '@dundring/types';
import { parseInputAsInt } from '../../utils/general';

interface Props {
  workout: WorkoutToEdit;
  closeEditor: () => void;
  closeModal: () => void;
  setIsWorkoutUnsaved: (isUnsaved: boolean) => void;
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
  closeModal,
  setIsWorkoutUnsaved,
}: Props) => {
  const { activeFtp, setActiveFtp, setActiveWorkout } = useActiveWorkout();
  const { user, saveLocalWorkout } = useUser();
  const toast = useToast();
  const token = (user.loggedIn && user.token) || null;
  const [showDeleted, setShowDeleted] = React.useState(false);

  const canSaveLocally =
    loadedWorkout.type === 'new' || loadedWorkout.type === 'local';

  const canSaveRemotely =
    token && (loadedWorkout.type === 'new' || loadedWorkout.type === 'remote');

  const canBeDeleted = token && loadedWorkout.type === 'remote';

  const cancelRef = React.useRef<HTMLButtonElement>(null);

  const saveRemotely = async () => {
    if (token) {
      const res = await saveWorkout(token, { workout });
      if (res.status === ApiStatus.FAILURE) {
        toast({
          title: `Save workout remotely failed`,
          isClosable: true,
          duration: 5000,
          status: 'error',
        });
        return;
      }
      setIsWorkoutUnsaved(false);
      closeEditor();
    }
  };

  const sendTrash = async () => {
    if (token) {
      const res = await toggleWorkoutVisibility(token, workout.id, false);
      if (res.status === ApiStatus.FAILURE) {
        toast({
          title: `Deleting workout failed`,
          isClosable: true,
          duration: 5000,
          status: 'error',
        });
        return;
      }
      toast({
        title: `The workout was sent to the trash`,
        isClosable: true,
        duration: 5000,
        status: 'info',
      });
      setIsWorkoutUnsaved(false);
      closeEditor();
    }
  };

  const [ftp, setFtp] = React.useState('' + activeFtp);

  const ftpValue = parseInputAsInt(ftp);

  const [workout, setWorkout] = React.useState<EditableWorkout>({
    ...loadedWorkout,
    parts: loadedWorkout.parts.map((part, i) => ({ ...part, id: i })),
  });

  const calculateDistance = () => {
    const powerToSpeed = getPowerToSpeedMap(80);
    return (
      workout.parts
        .map(
          ({ duration, targetPower }) =>
            duration * powerToSpeed[Math.round((targetPower * ftpValue) / 100)]
        )
        .reduce((prev, cur) => prev + cur) / 1000
    );
  };

  const workoutIsUnsaved =
    loadedWorkout.type === 'new' ||
    !editableWorkoutIsEqualToLoaded(workout, loadedWorkout);

  React.useEffect(() => {
    setIsWorkoutUnsaved(workoutIsUnsaved);
  }, [workoutIsUnsaved, setIsWorkoutUnsaved]);

  const totalDuration = workout.parts.reduce(
    (sum, part) => sum + part.duration,
    0
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

  const zoneTableInfo = createZoneTableInfo(
    workout.parts,
    totalDuration,
    ftpValue
  );

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
        <FormLabel>Active FTP</FormLabel>
        <InputGroup>
          <Input
            value={ftp}
            onChange={(e) => setFtp(e.target.value)}
            onBlur={() => setActiveFtp(parseInputAsInt(ftp))}
          />
          <InputRightAddon children="W" />
        </InputGroup>
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
              ftp={ftpValue}
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
                duration: 5 * 60,
                targetPower: 70,
                ...(workout.parts.length > 0
                  ? workout.parts[workout.parts.length - 1]
                  : {}),
                id: getNextWorkoutPartsId(workout.parts),
                type: 'steady',
              },
            ],
          }))
        }
      >
        Add part
      </Button>

      <Text fontWeight="bold">
        Total duration {secondsToHoursMinutesAndSecondsString(totalDuration)}
      </Text>
      <Text>Estimated distance {calculateDistance().toFixed(1)} km</Text>
      <FormControl>
        <HStack>
          {canSaveRemotely ? (
            <Button onClick={saveRemotely} leftIcon={<Icon as={CloudUpload} />}>
              Save
            </Button>
          ) : null}
          {canSaveLocally ? (
            <Button
              onClick={() => {
                saveLocalWorkout(workout);
                setIsWorkoutUnsaved(false);
                closeEditor();
              }}
              leftIcon={<Icon as={Hdd} />}
            >
              Save locally
            </Button>
          ) : null}
          <Button
            onClick={() => {
              setActiveWorkout(workout);
              closeEditor();
              closeModal();
            }}
          >
            Use without saving
          </Button>

          {canBeDeleted && (
            <Button
              onClick={() => setShowDeleted(true)}
              leftIcon={<Icon as={Trash} />}
              color={'red'}
            >
              Send to trash
            </Button>
          )}

          <Button
            onClick={() => {
              setIsWorkoutUnsaved(false);
              closeEditor();
            }}
          >
            Cancel
          </Button>
        </HStack>
        {!user.loggedIn ? (
          <FormHelperText>
            You can create an account to store your workouts remotely, making
            them accessible from any browser you use.
          </FormHelperText>
        ) : null}
      </FormControl>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Zone</Th>
            <Th whiteSpace="nowrap">Range %</Th>
            <Th whiteSpace="nowrap">Range W</Th>
            <Th textAlign="right">Duration</Th>
            <Th>Percentage</Th>
          </Tr>
        </Thead>
        <Tbody>
          {zoneTableInfo.map(
            ({ zone, range, rangePct, duration, pctDuration, description }) => (
              <Tr key={zone}>
                <Tooltip label={description}>
                  <Td>{zone}</Td>
                </Tooltip>
                <Td whiteSpace="nowrap">
                  {rangePct.lower}
                  {rangePct.upper ? '-' + rangePct.upper : '+'}%
                </Td>
                <Td whiteSpace="nowrap">
                  {range.lower}
                  {range.upper ? '-' + range.upper : '+'} w
                </Td>
                <Td textAlign="right">{duration}</Td>
                <Td>{pctDuration}%</Td>
              </Tr>
            )
          )}
        </Tbody>
        <Tfoot>
          <Tr>
            <Td fontWeight="bold">Total</Td>
            <Td></Td>
            <Td></Td>
            <Td fontWeight="bold" textAlign="right">
              {secondsToHoursMinutesAndSecondsString(totalDuration)}
            </Td>
          </Tr>
        </Tfoot>
      </Table>
      <AlertDialog
        isOpen={showDeleted}
        leastDestructiveRef={cancelRef}
        onClose={() => setShowDeleted(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete workout
            </AlertDialogHeader>

            <AlertDialogBody>
              This will delete the workout. Are you sure?
            </AlertDialogBody>

            <AlertDialogFooter>
              <HStack>
                <Button
                  colorScheme="red"
                  onClick={() => {
                    setShowDeleted(false);
                    sendTrash();
                  }}
                  ml={3}
                >
                  Yes, delete the workout
                </Button>
                <Button ref={cancelRef} onClick={() => setShowDeleted(false)}>
                  Cancel
                </Button>
              </HStack>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Stack>
  );
};

const editableWorkoutIsEqualToLoaded = (
  editable: EditableWorkout,
  loaded: WorkoutToEdit
) => {
  if (editable.name !== loaded.name) return false;
  if (editable.parts.length !== loaded.parts.length) return false;

  for (let i = 0; i < editable.parts.length; i++) {
    const editablePart = editable.parts[i];
    const loadedPart = loaded.parts[i];

    if (editablePart.duration !== loadedPart.duration) return false;
    if (editablePart.targetPower !== loadedPart.targetPower) return false;
  }

  return true;
};
