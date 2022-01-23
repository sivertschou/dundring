import { WorkoutEditorModal } from './WorkoutEditorModal';
import * as React from 'react';
import { LogModal } from './LogModal';
import { LoginModal } from './LoginModal';
import { ProfileModal } from './ProfileModal';
import { GroupSessionModal } from './GroupSessionModal';

export const Modals = () => {
  return (
    <>
      <LogModal />
      <LoginModal />
      <ProfileModal />
      <GroupSessionModal />
      <WorkoutEditorModal />
    </>
  );
};
