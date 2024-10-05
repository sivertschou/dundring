import { useData } from '../../context/DataContext';
import { Center, Checkbox, Grid, HStack, Text } from '@chakra-ui/react';
import { DownloadTCXButton } from './DownloadTCXButton';
import { UploadToStravaButton } from './UploadToStravaButton';
import * as React from 'react';

export const PausedWorkoutButtons = () => {
  const { hasValidData, isRunning } = useData();
  if (isRunning || !hasValidData) return null;

  return (
    <Grid templateColumns="1fr 1fr 1fr" gap="1" height="2.5em">
      <Text />
      <Center width="8em">
        <UploadToStravaButton />
      </Center>
      <Center width="8em">
        <DownloadTCXButton />
      </Center>
    </Grid>
  );
};
