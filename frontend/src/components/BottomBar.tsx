import * as React from 'react';
import { Center, Link, Stack, Text, Grid } from '@chakra-ui/layout';
import { useAvailability } from '../hooks/useAvailability';
import { useColorModeValue } from '@chakra-ui/react';
import { Logo } from './Logo';
import { useLogs } from '../context/LogContext';

export const BottomBar = () => {
  const { available: bluetoothIsAvailable } = useAvailability();
  const bgColor = useColorModeValue('gray.200', 'gray.900');
  const { log } = useLogs();
  return (
    <Center width="100%" position="fixed" bottom="0">
      <Stack width="100%">
        <Grid
          backgroundColor={bgColor}
          p="2"
          height={'3vh'}
          width="100%"
          templateColumns="1fr 8fr 1fr"
        >
          <Logo height={'2vh'} />
          <Text textAlign="center">{log[0] ? `${log[0].msg}` : null}</Text>
        </Grid>
        {!bluetoothIsAvailable ? (
          <Center p="2" backgroundColor="red">
            <Text fontSize="xl">
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
