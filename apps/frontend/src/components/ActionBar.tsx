import { Button } from '@chakra-ui/button';
import { Stack, Text } from '@chakra-ui/layout';
import { Icon } from '@chakra-ui/react';
import {
  BarChartLine,
  BarChartLineFill,
  Heart,
  HeartFill,
  LightningCharge,
  LightningChargeFill,
  People,
  PeopleFill,
  Person,
} from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { hrColor, powerColor } from '../colors';
import { useActiveWorkoutSession } from '../context/ActiveWorkoutSessionContext';
import { useHeartRateMonitor } from '../context/HeartRateContext';
import { useSmartTrainer } from '../context/SmartTrainerContext';
import { useUser } from '../context/UserContext';
import { useWebsocket } from '../context/WebsocketContext';
import { useLinkColor } from '../hooks/useLinkColor';
import { ActionBarItem } from './ActionBarItem';
import { settingUpProfile } from '@dundring/utils';

export const ActionBar = () => {
  const { user } = useUser();
  const { activeGroupSession } = useWebsocket();
  const { activeWorkoutSession } = useActiveWorkoutSession();
  const linkColor = useLinkColor();
  const navigate = useNavigate();

  const {
    isConnected: hrIsConnected,
    status: hrStatus,
    disconnect: disconnectHR,
    requestPermission: connectHR,
  } = useHeartRateMonitor();

  const {
    isConnected: smartTrainerIsConnected,
    status: smartTrainerStatus,
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
          onClick={() => navigate('/profile')}
          pointerEvents="auto"
          color={linkColor}
        >
          <Text fontSize="xl" fontWeight="bold">
            {settingUpProfile(user) ? 'Complete profile setup' : user.username}
          </Text>
        </Button>
      ) : (
        <ActionBarItem
          text="Login"
          icon={<Icon as={Person} />}
          onClick={() => navigate('/login')}
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
          isLoading={hrStatus === 'connecting'}
          icon={<Icon as={Heart} mt="1" />}
          onClick={connectHR}
          iconColor={hrStatus === 'error' ? 'red.500' : undefined}
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
          isLoading={smartTrainerStatus === 'connecting'}
          icon={<Icon as={LightningCharge} />}
          onClick={connectSmartTrainer}
          iconColor={smartTrainerStatus === 'error' ? 'red.500' : undefined}
        />
      )}
      <ActionBarItem
        text="Open group session overview"
        icon={<Icon as={activeGroupSession ? PeopleFill : People} />}
        onClick={() => {
          navigate('/group');
        }}
      />
      <ActionBarItem
        text="Open workout editor"
        icon={
          <Icon
            as={activeWorkoutSession.workout ? BarChartLineFill : BarChartLine}
          />
        }
        onClick={() => navigate('/workout')}
      />
    </Stack>
  );
};
