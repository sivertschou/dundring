import { Button, Icon } from '@chakra-ui/react';
import * as React from 'react';
import { PauseFill, PlayFill } from 'react-bootstrap-icons';
import { useData } from '../../context/DataContext';

export const StartButton = () => {
  const { hasValidData, isRunning, start, stop } = useData();
  if (isRunning)
    return (
      <Button
        width="100%"
        size="lg"
        onClick={stop}
        leftIcon={<Icon as={PauseFill} />}
      >
        Pause
      </Button>
    );

  return (
    <Button
      width="100%"
      size="lg"
      onClick={start}
      leftIcon={<Icon as={PlayFill} />}
    >
      {hasValidData ? 'Resume' : 'Start'}
    </Button>
  );
};
