import { WorkoutEditorModal } from './WorkoutEditorModal';
import * as React from 'react';
import { LogModal } from './LogModal';
import { LoginModal } from './LoginModal';

export const Modals = () => {
  return (
    <>
      <WorkoutEditorModal />
      <LogModal />
      <LoginModal />
    </>
  );
};
