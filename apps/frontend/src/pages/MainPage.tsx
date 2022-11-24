import { Center, Stack } from '@chakra-ui/layout';
import * as React from 'react';
import { GraphContainer } from '../components/Graph/GraphContainer';
import { WorkoutDisplay } from '../components/WorkoutDisplay';
import { useWebsocket } from '../context/WebsocketContext';
import { ActionBar } from '../components/ActionBar';
import { TopBar } from '../components/TopBar';
import { useLocation, useParams } from 'react-router-dom';
import {
  useFeedbackModal,
  useGroupSessionModal,
  useLoginModal,
  useLogModal,
  useProfileModal,
  useWorkoutEditorModal,
} from '../context/ModalContext';
import { Modals } from '../components/Modals/Modals';
import { BottomBar } from '../components/BottomBar';

export const MainPage = () => {
  const { connect } = useWebsocket();
  const location = useLocation();
  const params = useParams();
  const {
    onOpen: onOpenWorkoutEditorModal,
    onClose: onCloseWorkoutEditorModal,
  } = useWorkoutEditorModal();
  const { onOpen: onOpenGroupSessionModal, onClose: onCloseGroupSessionModal } =
    useGroupSessionModal();
  const { onOpen: onOpenProfileModal, onClose: onCloseProfileModal } =
    useProfileModal();
  const { onOpen: onOpenFeedbackModal, onClose: onCloseFeedbackModal } =
    useFeedbackModal();
  const { onOpen: onOpenLogModal, onClose: onCloseLogModal } = useLogModal();
  const { onOpen: onOpenLoginModal, onClose: onCloseLoginModal } =
    useLoginModal();

  React.useEffect(() => {
    const path = location.pathname.split('/')[1];
    console.log('PATH:', path);
    switch (path) {
      case 'feedback':
        onOpenFeedbackModal();
        return;
      case 'group':
        onOpenGroupSessionModal();
        connect();
        return;

      case 'workout':
        onOpenWorkoutEditorModal();
        return;

      case 'profile':
        onOpenProfileModal();
        return;

      case 'login':
      case 'auth':
        onOpenLoginModal();
        return;

      case 'logs':
        onOpenLogModal();
        return;

      default:
        onCloseFeedbackModal();
        onCloseGroupSessionModal();
        onCloseLogModal();
        onCloseLoginModal();
        onCloseProfileModal();
        onCloseWorkoutEditorModal();
    }
  }, [
    location,
    params,
    connect,
    onOpenFeedbackModal,
    onCloseFeedbackModal,
    onOpenLogModal,
    onCloseLogModal,
    onOpenLoginModal,
    onCloseLoginModal,
    onOpenProfileModal,
    onCloseProfileModal,
    onOpenGroupSessionModal,
    onCloseGroupSessionModal,
    onOpenWorkoutEditorModal,
    onCloseWorkoutEditorModal,
  ]);

  return (
    <>
      <Center>
        <Stack width="100%" pt={['30', '50', '100']}>
          <Center width="100%">
            <Center width="90%">
              <WorkoutDisplay />
              <GraphContainer />
            </Center>
          </Center>
        </Stack>
      </Center>
      <TopBar />
      <ActionBar />
      <Modals />
      <BottomBar />
    </>
  );
};
