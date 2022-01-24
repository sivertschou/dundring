import { Button } from '@chakra-ui/button';
import { useColorMode } from '@chakra-ui/color-mode';
import Icon from '@chakra-ui/icon';
import { Stack, Text } from '@chakra-ui/layout';
import * as React from 'react';
import {
  BarChartLine,
  BarChartLineFill,
  BoxArrowRight,
  Heart,
  HeartFill,
  LightningCharge,
  LightningChargeFill,
  Moon,
  People,
  PeopleFill,
  Person,
  Sun,
} from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { hrColor, powerColor } from '../colors';
import { useActiveWorkout } from '../context/ActiveWorkoutContext';
import { useHeartRateMonitor } from '../context/HeartRateContext';
import {
  useLoginModal,
  useProfileModal,
  useWorkoutEditorModal,
} from '../context/ModalContext';
import { useSmartTrainer } from '../context/SmartTrainerContext';
import { useUser } from '../context/UserContext';
import { useWebsocket } from '../context/WebsocketContext';
import { useLinkColor } from '../hooks/useLinkColor';
import { ActionBarItem } from './ActionBarItem';

export const ActionBar = () => {
  const { user, setUser } = useUser();
  const { activeGroupSession } = useWebsocket();
  const { activeWorkout } = useActiveWorkout();
  const { colorMode, setColorMode } = useColorMode();
  const { onOpen: onOpenWorkoutEditorModal } = useWorkoutEditorModal();
  const { onOpen: onOpenLoginModal } = useLoginModal();
  const { onOpen: onOpenProfileModal } = useProfileModal();
  const linkColor = useLinkColor();
  const navigate = useNavigate();

  const {
    isConnected: hrIsConnected,
    disconnect: disconnectHR,
    requestPermission: connectHR,
  } = useHeartRateMonitor();

  const {
    isConnected: smartTrainerIsConnected,
    disconnect: disconnectSmartTrainer,
    requestPermission: connectSmartTrainer,
  } = useSmartTrainer();

  return (
    <Stack
      position="fixed"
      right="5"
      top="5"
      alignItems="flex-end"
      spacing="1"
      pointerEvents="none"
    >
      {user.loggedIn ? (
        <Button
          variant="link"
          fontWeight="normal"
          onClick={onOpenProfileModal}
          pointerEvents="auto"
          color={linkColor}
        >
          <Text fontSize="xl" fontWeight="bold">
            {user.username}
          </Text>
        </Button>
      ) : (
        <ActionBarItem
          text="Login"
          icon={<Icon as={Person} />}
          onClick={onOpenLoginModal}
        />
      )}
      {activeGroupSession ? (
        <Text fontSize="lg" fontWeight="bold">
          #{activeGroupSession.id}
        </Text>
      ) : null}
      {hrIsConnected ? (
        <ActionBarItem
          text="Disconnect HR"
          icon={<Icon as={HeartFill} mt="1" />}
          onClick={disconnectHR}
          iconColor={hrColor}
        />
      ) : (
        <ActionBarItem
          text="Connect HR"
          icon={<Icon as={Heart} mt="1" />}
          onClick={connectHR}
        />
      )}
      {smartTrainerIsConnected ? (
        <ActionBarItem
          text="Disconnect smart trainer"
          icon={<Icon as={LightningChargeFill} />}
          onClick={disconnectSmartTrainer}
          iconColor={powerColor}
        />
      ) : (
        <ActionBarItem
          text="Connect smart trainer"
          icon={<Icon as={LightningCharge} />}
          onClick={connectSmartTrainer}
        />
      )}
      <ActionBarItem
        text="Open group session overview"
        icon={<Icon as={activeGroupSession ? PeopleFill : People} />}
        onClick={() => {
          // onOpenGroupSessionModal();
          // connect();
          navigate('/group');
        }}
      />
      <ActionBarItem
        text="Open workout editor"
        icon={
          <Icon as={activeWorkout.workout ? BarChartLineFill : BarChartLine} />
        }
        onClick={onOpenWorkoutEditorModal}
      />
      {colorMode === 'light' ? (
        <ActionBarItem
          text="Enable darkmode"
          icon={<Icon as={Moon} />}
          onClick={() => setColorMode('dark')}
        />
      ) : (
        <ActionBarItem
          text="Enable lightmode"
          icon={<Icon as={Sun} />}
          onClick={() => setColorMode('light')}
        />
      )}
      {user.loggedIn ? (
        <ActionBarItem
          text="Logout"
          icon={<Icon as={BoxArrowRight} />}
          onClick={() => setUser({ loggedIn: false })}
        />
      ) : null}
    </Stack>
  );
};
