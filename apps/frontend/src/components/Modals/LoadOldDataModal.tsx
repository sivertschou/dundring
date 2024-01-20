import {
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/modal';
import { Link, Stack, Text } from '@chakra-ui/layout';
import { useLoadOldDataModal } from '../../context/ModalContext';
import { useLinkPowerColor } from '../../hooks/useLinkColor';
import {
  Button,
  Heading,
  Icon,
  Image,
  ListItem,
  UnorderedList,
} from '@chakra-ui/react';
import { useData } from '../../context/DataContext';
import { ArrowCounterclockwise, Discord } from 'react-bootstrap-icons';

export const LoadOldDataModal = () => {
  const { isOpen, onClose } = useLoadOldDataModal();
  const linkColor = useLinkPowerColor();
  const { override, resetOldData } = useData();

  const f = () => {
    override();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
      }}
      size="2xl"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Temporary data</ModalHeader>
        <Stack p="5">
          <Text>
            It seems that you have some data stored from a previous session
          </Text>

          <Button
            width="100%"
            onClick={override}
            leftIcon={<Icon as={ArrowCounterclockwise} />}
          >
            Load old data
          </Button>
          <Button
            width="100%"
            onClick={resetOldData}
            leftIcon={<Icon as={Discord} />}
          >
            Discard old data
          </Button>

          <ModalCloseButton />
        </Stack>
      </ModalContent>
    </Modal>
  );
};
