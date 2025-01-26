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
import { Center, HStack, Stack, Text } from '@chakra-ui/layout';
import { GraphCheckboxes } from '../Graph/GraphCheckboxes';
import * as React from 'react';
import { ShowData } from '../Graph/GraphContainer';
import { Tooltip } from '@chakra-ui/tooltip';
import { IconButton } from '@chakra-ui/button';
import { Icon } from '@chakra-ui/react';
import { BarChartLine, BarChartLineFill } from 'react-bootstrap-icons';
import { useOptions } from '../../context/OptionsContext';
import { Checkbox } from '@chakra-ui/checkbox';

export const OptionsModal = () => {
  const { isOpen } = useOptionsModal();
  const navigate = useNavigate();

  const options = useOptions();

  return (
    <Modal isOpen={isOpen} onClose={() => navigate('/')}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Options</ModalHeader>
        <ModalCloseButton />
        <Center>
          <Stack>
            <OptionsCheckbox
              option={options.showIntervalTimer}
              label={'Show remaining time for interval'}
              text={'Show remaining time for interval'}
            />
            <OptionsCheckbox
              option={options.showTotalDurationTimer}
              label={'Show total duration timer'}
              text={'Show total duration timer'}
            />
            <OptionsCheckbox
              option={options.showGraph}
              label={'Show graph'}
              text={'Show graph'}
            />
            <OptionsCheckbox
              option={options.showPowerBar}
              label={'Show power bar'}
              text={'Show power bar'}
            />
            <OptionsCheckbox
              option={options.showMap}
              label={'Show map'}
              text={'Show map'}
            />
            <OptionsCheckbox
              option={options.showCadence}
              label={'Show cadence'}
              text={'Show cadence'}
            />
            <OptionsCheckbox
              option={options.showHeartRateMax}
              label={'Show heart rate max'}
              text={'Show heart rate max'}
            />
            <OptionsCheckbox
              option={options.showHeartRateCurrent}
              label={'Show heart rate current'}
              text={'Show heart rate current'}
            />
          </Stack>
        </Center>
      </ModalContent>
    </Modal>
  );
};

const OptionsCheckbox = (props: {
  option: { value: boolean; set: (b: boolean) => void };
  label: string;
  text: string; // use props.children??
}) => {
  const { option, label, text } = props;
  return (
    // <Tooltip label={label}>
    <Checkbox
      onChange={(e) => {
        option.set(e.target.checked);
      }}
      isChecked={option.value}
    >
      {text}
    </Checkbox>
    // </Tooltip>
  );
};
