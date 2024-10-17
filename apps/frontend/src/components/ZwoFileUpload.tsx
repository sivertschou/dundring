import React from 'react';
import { WorkoutToEdit } from './Modals/WorkoutEditorModal';
import { Center, Input, Tooltip, useToast } from '@chakra-ui/react';
import { parseZwoWorkout } from '../utils/ZwoParsing';
import { Stack } from '@chakra-ui/layout';
import { Button } from '@chakra-ui/button';

interface Props {
  previewFtp: number;
  setWorkoutToEdit: (workout: WorkoutToEdit) => void;
}

const ZwoFileUpload = ({ setWorkoutToEdit, previewFtp }: Props) => {
  const toast = useToast();

  const handleFileChange = (event: any) => {
    const reader = new FileReader();

    reader.onload = (fileReaderEvent: ProgressEvent<FileReader>) => {
      const fileInput = fileReaderEvent.target?.result;
      if (typeof fileInput !== 'string') {
        toast({
          title: 'Importing workout failed',
          description:
            'The file is either invalid or contains event types that are not supported',
          isClosable: true,
          duration: 10000,
          status: 'error',
        });
        return;
      }
      const parsedWorkout = parseZwoWorkout(fileInput);
      const workout = parsedWorkout.workout;
      if (workout) {
        setWorkoutToEdit({ ...workout, type: 'new', previewFtp });
      }
      if (parsedWorkout.errors.size > 0) {
        toast({
          title: 'Something went wrong when parsing .zwo file',
          description: Array.from(parsedWorkout.errors).join('\n'),
          isClosable: true,
          duration: 10000,
          status: workout ? 'warning' : 'error',
        });
      }
    };

    reader.readAsText(event.target.files[0]);
  };

  return (
    <Stack>
      <Center>
        <label htmlFor="file-input" className="custom-file-label">
          <Tooltip
            label={
              'This feature is in Beta. You should check that the resulting workout corresponds to what you expect.\nIf you get an error, you can check the console for more information'
            }
          >
            <Button as="span" cursor="pointer">
              Import workout from .zwo file (Beta)
            </Button>
          </Tooltip>
        </label>
        <Input
          id={'file-input'}
          type="file"
          value={undefined}
          onChange={handleFileChange}
          accept=".zwo"
          hidden={true}
        />
      </Center>
    </Stack>
  );
};

export default ZwoFileUpload;
