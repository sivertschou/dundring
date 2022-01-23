import { Center, Stack } from '@chakra-ui/layout';
import * as React from 'react';
import { GraphContainer } from '../components/Graph/GraphContainer';
import { WorkoutDisplay } from '../components/WorkoutDisplay';
import { useWebsocket } from '../context/WebsocketContext';
import { ActionBar } from '../components/ActionBar';
import { TopBar } from '../components/TopBar';
import { useLocation, useParams } from 'react-router-dom';
import { useGroupSessionModal } from '../context/ModalContext';
import { Modals } from '../components/Modals/Modals';
import { BottomBar } from '../components/BottomBar';

export const MainPage = () => {
  const { connect } = useWebsocket();
  const location = useLocation();
  const params = useParams();
  const { onOpen: onOpenGroupSessionModal, onClose: onCloseGroupSessionModal } =
    useGroupSessionModal();

  React.useEffect(() => {
    const path = location.pathname.split('/')[1];
    switch (path) {
      case 'group':
        onOpenGroupSessionModal();
        connect();
        return;
      default:
        onCloseGroupSessionModal();
    }
  }, [
    location,
    params,
    connect,
    onOpenGroupSessionModal,
    onCloseGroupSessionModal,
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
