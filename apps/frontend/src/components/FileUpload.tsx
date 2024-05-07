import React, { useState } from 'react';
import { WorkoutToEdit } from './Modals/WorkoutEditorModal';
import { parse, zwoWorkoutToDundringWorkout } from '../utils/zwoparsing';
import { Input, useToast } from '@chakra-ui/react';

interface Props {
  file: string | null;
  setFile: (file: string) => void;
}

const FileUploader = ({ file, setFile }: Props) => {
  const toast = useToast();

  const fileReadingErrorToast = () =>
    toast({
      title: `Importing workout failed. The file is either invalid or contains event types that are not supported`,
      isClosable: true,
      duration: 10000,
      status: 'error',
    });

  const handleFileChange = (event: any) => {
    const reader = new FileReader();

    reader.onload = (fileReaderEvent: ProgressEvent<FileReader>) => {
      const fileInput = fileReaderEvent.target?.result;
      if (typeof fileInput !== 'string') {
        fileReadingErrorToast();
        return;
      }
      setFile(fileInput as string);
    };

    reader.readAsText(event.target.files[0]);
  };

  return (
    <div>
      Import workout from Zwift file (.zwo)
      <Input
        type="file"
        value={undefined}
        onChange={handleFileChange}
        accept=".zwo"
      />
    </div>
  );
};

export default FileUploader;
