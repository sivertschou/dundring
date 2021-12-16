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
  const { log } = useLogs();

  return (
    <>
      <Button variant="link" onClick={onOpen}>
        <Text textAlign="center">{log[0] ? `${log[0].msg}` : null}</Text>
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
              {log.map(({ timestamp, msg }) => (
                <Tr key={timestamp.getTime()} m={0}>
                  <Td paddingY="1">{timestampToFormattedHHMMSS(timestamp)}</Td>
                  <Td paddingY="1">{msg}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </ModalContent>
      </Modal>
    </>
  );
};
