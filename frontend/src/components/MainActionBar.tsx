import * as React from 'react';
import { Center, Stack, Grid, HStack } from '@chakra-ui/layout';
import { Button, IconButton } from '@chakra-ui/button';
import {
  Grid3x2GapFill,
  BarChartLine,
  BarChartLineFill,
} from 'react-bootstrap-icons';
import Icon from '@chakra-ui/icon';
import { Tooltip } from '@chakra-ui/tooltip';
import { useColorModeValue } from '@chakra-ui/color-mode';
import { useSmartTrainer } from '../context/SmartTrainerContext';
import { useWorkoutEditorModal } from '../context/ModalContext';
import { StartButton } from './MainActionBar/StartButton';
import { PowerControls } from './MainActionBar/PowerControls';
import { PausedWorkoutButtons } from './MainActionBar/PausedWorkoutButtons';
import { QuickPowerButton } from './MainActionBar/QuickPowerButton';
import { WorkoutControls } from './MainActionBar/WorkoutControls';

export const MainActionBar = () => {
  const [showPowerControls, setShowPowerControls] = React.useState(false);
  const [showWorkoutControls, setShowWorkoutControls] = React.useState(false);

  const {
    isConnected: smartTrainerIsConnected,
    requestPermission: connectToSmartTrainer,
  } = useSmartTrainer();

  const { onOpen: onOpenWorkoutEditor } = useWorkoutEditorModal();

  const bgColor = useColorModeValue('gray.200', 'gray.900');
  return (
    <Center mb="5">
      <Stack p="5" borderRadius="1em" bgColor={bgColor} pointerEvents="auto">
        {showWorkoutControls ? <WorkoutControls /> : null}
        {showPowerControls ? <PowerControls /> : null}

        {!smartTrainerIsConnected ? (
          <Button variant="link" onClick={() => connectToSmartTrainer()}>
            Connect to Smart Trainer
          </Button>
        ) : null}
        <Grid templateColumns="1fr 1fr 1fr" gap="1" alignItems="end">
          <Center height="100%">
            <HStack>
              <Tooltip label="Load workout">
                <IconButton
                  aria-label="Load workout"
                  icon={<Icon as={true ? BarChartLineFill : BarChartLine} />}
                  onClick={onOpenWorkoutEditor}
                />
              </Tooltip>
              <Tooltip label="Show workout controls">
                <IconButton
                  aria-label="Show workout controls"
                  variant={showWorkoutControls ? 'outline' : 'solid'}
                  onClick={() => setShowWorkoutControls((current) => !current)}
                  icon={<Icon as={Grid3x2GapFill} />}
                />
              </Tooltip>
            </HStack>
          </Center>
          <Center width="8em">
            <StartButton />
          </Center>
          <Center height="100%">
            <HStack justifyContent="flex-end">
              <Tooltip label="Show power controls">
                <IconButton
                  aria-label="Show power controls"
                  variant={showPowerControls ? 'outline' : 'solid'}
                  onClick={() => setShowPowerControls((current) => !current)}
                  icon={<Icon as={Grid3x2GapFill} />}
                />
              </Tooltip>
              <QuickPowerButton />
            </HStack>
          </Center>
        </Grid>
        <PausedWorkoutButtons />
      </Stack>
    </Center>
  );
};
