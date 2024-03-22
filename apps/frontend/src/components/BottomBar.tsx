import {
  Center,
  Link,
  Stack,
  Text,
  Grid,
  HStack,
  Flex,
} from '@chakra-ui/layout';
import { Button } from '@chakra-ui/button';
import { Tooltip } from '@chakra-ui/tooltip';
import { useAvailability } from '../hooks/useAvailability';
import { Logo } from './Logo';
import { Github, MoonFill, Slack, SunFill } from 'react-bootstrap-icons';
import { MainActionBar } from './MainActionBar';
import { Link as ReachLink } from 'react-router-dom';
import { useColorMode, useColorModeValue } from '@chakra-ui/color-mode';
import { useLogModal } from '../context/ModalContext';
import { useLogs } from '../context/LogContext';
import { Icon } from '@chakra-ui/react';
import { githubRepo, slackInvite } from '../links';

export const BottomBar = () => {
  const { colorMode, setColorMode } = useColorMode();
  const { available: bluetoothIsAvailable } = useAvailability();
  const { onOpen } = useLogModal();
  const { loggedEvents } = useLogs();
  const bgColor = useColorModeValue('gray.200', 'gray.900');
  const isDarkmode = colorMode !== 'light';
  const colorModeButtonText = isDarkmode
    ? 'Toggle light mode'
    : 'Toggle dark mode';

  const now = new Date();
  const lastMessageShouldBeVisible =
    loggedEvents[0] &&
    now.getTime() - loggedEvents[0].timestamp.getTime() < 10000
      ? true
      : false;
  return (
    <Center width="100%" position="fixed" bottom="0" pointerEvents="none">
      <Stack width="100%" spacing="0">
        <MainActionBar />
        <Grid
          backgroundColor={bgColor}
          width="100%"
          templateColumns="1fr 4fr 1fr"
          pointerEvents="auto"
        >
          <Flex p="1">
            <Link as={ReachLink} to="/">
              <Logo height="20px" />
            </Link>
          </Flex>
          <Button variant="link" fontWeight="normal" onClick={onOpen}>
            <Text
              textAlign="center"
              opacity={lastMessageShouldBeVisible ? 100 : 0}
              transition="opacity 0.5s ease"
            >
              {loggedEvents[0] ? `${loggedEvents[0].msg}` : null}
            </Text>
          </Button>
          <HStack justifyContent="flex-end" paddingX="2">
            <Center>
              <Tooltip label={colorModeButtonText}>
                <Link>
                  <Icon
                    as={isDarkmode ? SunFill : MoonFill}
                    aria-label={colorModeButtonText}
                    onClick={() => setColorMode(isDarkmode ? 'light' : 'dark')}
                  />
                </Link>
              </Tooltip>
            </Center>
            <Tooltip label="Visit the workspace on Slack">
              <Link href={slackInvite} p="0">
                <Icon as={Slack} p="0" />
              </Link>
            </Tooltip>
            <Tooltip label="Visit the repository on GitHub">
              <Link href={githubRepo}>
                <Icon as={Github} />
              </Link>
            </Tooltip>
          </HStack>
        </Grid>
        {!bluetoothIsAvailable ? (
          <Center p="2" backgroundColor="red">
            <Text fontSize="l">
              Bluetooth is not available in this browser yet. Check{' '}
              <Link
                textDecor="underline"
                href="https://developer.mozilla.org/en-US/docs/Web/API/Bluetooth#browser_compatibility"
              >
                the docs for browsers supporting Bluetooth
              </Link>
              .
            </Text>
          </Center>
        ) : null}
      </Stack>
    </Center>
  );
};
