import { useData } from '../../context/DataContext';
import { Center, Grid, Text } from '@chakra-ui/react';
import { DownloadTCXButton } from './DownloadTCXButton';

export const PausedWorkoutButtons = () => {
  const { hasValidData, isRunning } = useData();
  if (isRunning || !hasValidData) return null;

  return (
    <Grid templateColumns="1fr 1fr 1fr" gap="1">
      <Text />
      <Center width="8em">
        <DownloadTCXButton />
      </Center>
      <Text />
    </Grid>
  );
};
