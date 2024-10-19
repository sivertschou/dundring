import { Center, Grid, Stack, Text, Tooltip } from '@chakra-ui/react';
import { useSmartTrainer } from '../../context/SmartTrainerContext';
import { useActiveWorkoutSession } from '../../context/ActiveWorkoutSessionContext';
import { PowerControlButton } from './PowerControlButton';
import { PowerControlInput } from './PowerControlInput';

export const PowerControls = () => {
  const { isConnected: smartTrainerIsConnected } = useSmartTrainer();

  const { activeFtp } = useActiveWorkoutSession();

  const controlValues = [1, 5, 10, -1, -5, -10];
  return (
    <Stack>
      <Text fontSize="xs" fontWeight="bold" opacity="0.5">
        Power controls
      </Text>
      <Tooltip
        label="You need to connect a smart trainer to use this functionality."
        isDisabled={smartTrainerIsConnected}
        placement="top"
      >
        <Center justifyContent="space-between">
          <Grid templateColumns="2fr 2fr 2fr" gap="1">
            {controlValues.map((value, i) => (
              <PowerControlButton key={i} value={value} activeFtp={activeFtp} />
            ))}
          </Grid>
          <PowerControlInput />
        </Center>
      </Tooltip>
    </Stack>
  );
};
