import React, { useState } from 'react';
import { WorkoutToEdit } from './Modals/WorkoutEditorModal';
import { parse, zwoWorkoutToDundringWorkout } from '../utils/zwoparsing';
import { Input } from '@chakra-ui/react';

interface Props {
  file: File | null;
  setFile: (file: File) => void;
}

const FileUploader = ({ file, setFile }: Props) => {
  // const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: any) => {
    setFile(event.target.files[0]);

    const reader = new FileReader();

    reader.onload = (e) => {
      console.log(e.target?.result);
      // setFile(e.target?.result as string || "");

      if (!e.target?.result) return;
      const parsed = parse(e.target.result as string);
      if (!parsed) return;

      const workout = zwoWorkoutToDundringWorkout(parsed);

      // setWorkoutToEdit({
      //     ...workout,
      //     type: 'new',
      // })
    };

    // Read the content of the file
    reader.readAsText(event.target.files[0]);
  };

  return (
    <div>
      Import workout from Zwift file (.zwo)
      <Input type="file" onChange={handleFileChange} accept=".zwo" />
    </div>
  );
};

export default FileUploader;
