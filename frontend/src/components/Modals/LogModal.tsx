import { useDisclosure } from '@chakra-ui/hooks';
import {
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/modal';
import * as React from 'react';
import { useLogs } from '../../context/LogContext';
import { Button } from '@chakra-ui/button';
import { Text } from '@chakra-ui/layout';
import { Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/table';
import { timestampToFormattedHHMMSS } from '../../utils';

export const LogModal = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { loggedEvents } = useLogs();

  const now = new Date();
  const lastMessageShouldBeVisible =
    loggedEvents[0] &&
    now.getTime() - loggedEvents[0].timestamp.getTime() < 10000
      ? true
      : false;

  return (
    <>
      <Button variant="link" fontWeight="normal" onClick={onOpen}>
        <Text
          textAlign="center"
          opacity={lastMessageShouldBeVisible ? 100 : 0}
          transition="opacity 0.5s ease"
        >
          {loggedEvents[0] ? `${loggedEvents[0].msg}` : null}
        </Text>
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Logs</ModalHeader>
          <ModalCloseButton />
          <Table>
            <Thead>
              <Tr>
                <Th>Timestamp</Th>
                <Th>Message</Th>
              </Tr>
            </Thead>
            <Tbody>
              {loggedEvents.map(({ timestamp, msg }) => (
                <Tr key={timestamp.getTime()} m={0}>
                  <Td paddingY="2">{timestampToFormattedHHMMSS(timestamp)}</Td>
                  <Td paddingY="2">{msg}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </ModalContent>
      </Modal>
    </>
  );
};
