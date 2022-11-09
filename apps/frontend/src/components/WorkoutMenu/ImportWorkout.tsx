import * as React from 'react';
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  HStack,
  Input,
  InputGroup,
} from '@chakra-ui/react';
import { importWorkout } from '../../api';
import { Text } from '@chakra-ui/layout';
import { WorkoutToEdit } from '../Modals/WorkoutEditorModal';
import { useParams } from 'react-router-dom';

export enum ApiStatus {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  LOADING = 'LOADING',
}

interface Props {
  setWorkoutToEdit: (workout: WorkoutToEdit) => void;
  previewFtp: number;
}

export const ImportWorkout = ({ setWorkoutToEdit, previewFtp }: Props) => {
  const { workoutId: workoutIdParam } = useParams();
  const [errorMessage, setErrorMessage] = React.useState('');
  const [workoutIdInput, setWorkoutIdInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const workoutIdInputIsValidFormat =
    workoutIdInput.match('([a-zA-Z0-9]+-[0-9]+)') !== null;

  const handleImportWorkout = React.useCallback(
    async (username: string, id: string) => {
      setIsLoading(true);
      const workoutResponse = await importWorkout(username, id);
      setIsLoading(false);

      switch (workoutResponse.status) {
        case ApiStatus.SUCCESS: {
          setWorkoutToEdit({
            ...workoutResponse.data.workout,
            type: 'new',
            previewFtp,
          });
          return;
        }
        case ApiStatus.FAILURE: {
          setErrorMessage(workoutResponse.message);
          return;
        }
      }
    },
    [setIsLoading, previewFtp, setWorkoutToEdit]
  );

  React.useEffect(() => {
    if (!workoutIdParam) return;
    const [username, id] = workoutIdParam.split('-');
    setWorkoutIdInput(workoutIdParam);
    console.log('username:', username, 'id:', id);
    handleImportWorkout(username, id);
  }, [handleImportWorkout, workoutIdParam]);

  const onClickImportWorkout = async () => {
    const [username, id] = workoutIdInput.split('-');
    handleImportWorkout(username, id);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (workoutIdInputIsValidFormat) onClickImportWorkout();
      }}
    >
      <FormControl
        isInvalid={!workoutIdInputIsValidFormat && workoutIdInput !== ''}
      >
        <FormLabel>Import workout</FormLabel>
        <HStack>
          <InputGroup>
            <Input
              placeholder="Workout id : username-id"
              type="workoutIdInput"
              name="workoutIdInput"
              value={workoutIdInput}
              onChange={(e) => {
                setWorkoutIdInput(e.target.value.replace(' ', ''));
                setErrorMessage('');
              }}
            />
          </InputGroup>
          <Button
            isLoading={isLoading}
            disabled={!workoutIdInputIsValidFormat}
            onClick={onClickImportWorkout}
          >
            Import
          </Button>
        </HStack>
        <FormErrorMessage>
          {'Invalid workout id. Format: username-id'}
        </FormErrorMessage>
        {errorMessage ? <Text color="red.500">{errorMessage}</Text> : null}
        <FormHelperText>
          You can import/clone an other user's workout by entering the workout
          id. A workout's id can be found by pressing the copy button on a given
          workout that is stored remotely.
        </FormHelperText>
      </FormControl>
    </form>
  );
};
