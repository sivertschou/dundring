import {
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/modal';
import { useOptionsModal } from '../../context/ModalContext';
import { useNavigate } from 'react-router-dom';
import { Center, Stack } from '@chakra-ui/layout';
import * as React from 'react';
import { useReadWriteOptions } from '../../context/OptionsContext';
import { Checkbox } from '@chakra-ui/checkbox';
import { Tooltip } from '@chakra-ui/tooltip';

export const OptionsModal = () => {
  const { isOpen } = useOptionsModal();
  const navigate = useNavigate();

  const options = useReadWriteOptions();

  return (
    <Modal isOpen={isOpen} onClose={() => navigate('/')}>
      <ModalOverlay />
      <ModalContent p="5">
        <ModalHeader>Options</ModalHeader>
        <ModalCloseButton />
        <Center>
          <Stack>
            <OptionsCheckbox
              option={options.showIntervalTimer}
              tooltip={
                'Check to have the remaing time of an interval displayed'
              }
              text={'Show remaining time for interval'}
            />
            <OptionsCheckbox
              option={options.showTotalDurationTimer}
              tooltip={
                'Check to have the total duration of a session displayed'
              }
              text={'Show total duration timer'}
            />
            <OptionsCheckbox
              option={options.playIntervalCountdownSounds}
              tooltip={
                'Check to play a countdown sound the last 5 seconds of an interval'
              }
              text={'Play sound at the end of intervals'}
            />
          </Stack>
        </Center>
      </ModalContent>
    </Modal>
  );
};

const OptionsCheckbox = (props: {
  option: { value: boolean; set: (b: boolean) => void };
  tooltip: string;
  text: string; // use props.children??
}) => {
  const { option, tooltip, text } = props;
  return (
    // needs shouldWrapChildren to behave correctly on checkboxes
    <Tooltip label={tooltip} shouldWrapChildren>
      <Checkbox
        onChange={(e) => {
          option.set(e.target.checked);
        }}
        isChecked={option.value}
      >
        {text}
      </Checkbox>
    </Tooltip>
  );
};
