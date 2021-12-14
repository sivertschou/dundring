import * as React from 'react';
import { Center, Link, Stack, Text } from '@chakra-ui/layout';
import { useAvailability } from '../hooks/useAvailability';

export const BottomBar = () => {
  const { available: bluetoothIsAvailable } = useAvailability();
  return (
    <Center width="100%" position="fixed" bottom="0">
      <Stack width="100%">
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
