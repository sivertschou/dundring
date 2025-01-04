import { Button, Icon } from '@chakra-ui/react';
import { PauseFill, PlayFill } from 'react-bootstrap-icons';
import { useData } from '../../context/DataContext';
import * as React from 'react';

export const StartButton = () => {
  const { hasValidData, isRunning, start, stop } = useData();
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore keypress for pages that is not the start-page, like /workout and /group
      if (window.location.pathname !== '/') {
        return;
      }
      if (event.code === 'Space') {
        event.preventDefault();
        buttonRef.current?.click();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (isRunning)
    return (
      <Button
        ref={buttonRef}
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
      ref={buttonRef}
      width="100%"
      size="lg"
      onClick={start}
      leftIcon={<Icon as={PlayFill} />}
    >
      {hasValidData ? 'Resume' : 'Start'}
    </Button>
  );
};
