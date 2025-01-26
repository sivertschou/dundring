import {
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/modal';
import { useWebsocket } from '../../context/WebsocketContext';
import { GroupSessionOverview } from '../GroupSession/GroupSessionOverview';
import { CreateOrJoinGroupSession } from '../GroupSession/CreateOrJoinGroupSession';
import {
  useGroupSessionModal,
  useOptionsModal,
} from '../../context/ModalContext';
import { useNavigate } from 'react-router-dom';
import { Center, HStack, Text } from '@chakra-ui/layout';
import { GraphCheckboxes } from '../Graph/GraphCheckboxes';
import * as React from 'react';
import { ShowData } from '../Graph/GraphContainer';
import { Tooltip } from '@chakra-ui/tooltip';
import { IconButton } from '@chakra-ui/button';
import { Icon } from '@chakra-ui/react';
import { BarChartLine, BarChartLineFill } from 'react-bootstrap-icons';
import { useOptionsContext } from '../../context/OptionsContext';
import { Checkbox } from '@chakra-ui/checkbox';

export const OptionsModal = () => {
  const { isOpen } = useOptionsModal();
  const navigate = useNavigate();

  const { intervalSounds } = useOptionsContext();

  return (
    <Modal isOpen={isOpen} onClose={() => navigate('/')}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Options</ModalHeader>
        <ModalCloseButton />
        <Center>
          <HStack>
            <Tooltip label={'Plays a sound'}>
              <Checkbox
                onChange={(e) => {
                  intervalSounds.set(e.target.checked);
                }}
                isChecked={intervalSounds.value}
              >
                Interval coundown sound
              </Checkbox>
            </Tooltip>
          </HStack>
        </Center>
      </ModalContent>
    </Modal>
  );
};
