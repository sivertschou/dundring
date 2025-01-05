import { Button, Icon } from '@chakra-ui/react';
import { PauseFill, PlayFill } from 'react-bootstrap-icons';
import { useData } from '../../context/DataContext';
import * as React from 'react';
import { useHotkey } from '../../hooks/useHotkey';

export const StartButton = () => {
  const { hasValidData, isRunning, start, stop } = useData();

  useHotkey('Space', () => (isRunning ? stop() : start()));

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
