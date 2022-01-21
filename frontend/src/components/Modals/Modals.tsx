import { WorkoutEditorModal } from './WorkoutEditorModal';
import * as React from 'react';
import { LogModal } from './LogModal';
import { LoginModal } from './LoginModal';
import { ProfileModal } from './ProfileModal';

export const Modals = () => {
  return (
    <>
      <WorkoutEditorModal />
      <LogModal />
      <LoginModal />
      <ProfileModal />
    </>
  );
};
