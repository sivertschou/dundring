import { WorkoutEditorModal } from './WorkoutEditorModal';
import { LogModal } from './LogModal';
import { LoginModal } from './LoginModal';
import { ProfileModal } from './ProfileModal';
import { GroupSessionModal } from './GroupSessionModal';
import { FeedbackModal } from './FeedbackModal';

export const Modals = () => {
  return (
    <>
      <GroupSessionModal />
      <LogModal />
      <FeedbackModal />
      <LoginModal />
      <ProfileModal />
      <WorkoutEditorModal />
    </>
  );
};
