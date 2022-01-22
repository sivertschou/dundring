import * as React from 'react';
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
import { Github, Slack } from 'react-bootstrap-icons';
import { Link as ReachLink } from 'react-router-dom';
import { useColorModeValue } from '@chakra-ui/color-mode';
import { useLogModal } from '../context/ModalContext';
import Icon from '@chakra-ui/icon';
import { useLogs } from '../context/LogContext';

export const BottomBar = () => {
  const { available: bluetoothIsAvailable } = useAvailability();
  const { onOpen } = useLogModal();
  const { loggedEvents } = useLogs();
  const bgColor = useColorModeValue('gray.200', 'gray.900');

  const now = new Date();
  const lastMessageShouldBeVisible =
    loggedEvents[0] &&
    now.getTime() - loggedEvents[0].timestamp.getTime() < 10000
      ? true
      : false;
  return (
    <Center width="100%" position="fixed" bottom="0">
      <Stack width="100%" spacing="0">
        <Grid
          backgroundColor={bgColor}
          width="100%"
          templateColumns="1fr 4fr 1fr"
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
            <Tooltip label="Visit the workspace on Slack">
              <Link
                href="https://join.slack.com/t/dundring/shared_invite/zt-10g7cx905-6ugYR~UdMEFBAkwdSWOAew"
                p="0"
              >
                <Icon as={Slack} p="0" />
              </Link>
            </Tooltip>
            <Tooltip label="Visit the repository on GitHub">
              <Link href="https://github.com/sivertschou/dundring">
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
