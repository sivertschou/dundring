import { WorkoutEditorModal } from './WorkoutEditorModal';
import { LogModal } from './LogModal';
import { LoginModal } from './LoginModal';
import { ProfileModal } from './ProfileModal';
import { GroupSessionModal } from './GroupSessionModal';
import { WelcomeMessageModal } from './WelcomeMessageModal';
import { LoadOldDataModal } from './LoadOldDataModal';

export const Modals = () => {
  return (
    <>
      <GroupSessionModal />
      <LogModal />
      <LoginModal />
      <ProfileModal />
      <WorkoutEditorModal />
      <WelcomeMessageModal />
      <LoadOldDataModal />
    </>
  );
};
