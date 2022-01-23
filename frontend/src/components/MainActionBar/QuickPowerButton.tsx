import {
  Box,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Tooltip,
} from '@chakra-ui/react';
import * as React from 'react';
import { LightningChargeFill } from 'react-bootstrap-icons';
import { useActiveWorkout } from '../../context/ActiveWorkoutContext';
import { useSmartTrainer } from '../../context/SmartTrainerContext';
import { wattFromFtpPercent } from '../../utils';

const defaultResistancePercentages = [
  50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150,
];
export const QuickPowerButton = () => {
  const {
    setResistance: setSmartTrainerResistance,
    isConnected: smartTrainerIsConnected,
  } = useSmartTrainer();
  const { activeFTP } = useActiveWorkout();

  return (
    <Menu placement="top">
      <MenuList>
        <Box>
          {defaultResistancePercentages.map((percentage, i) => (
            <MenuItem
              key={i}
              onClick={() =>
                setSmartTrainerResistance(
                  wattFromFtpPercent(percentage, activeFTP)
                )
              }
            >
              {wattFromFtpPercent(percentage, activeFTP)}W ({percentage}
              %)
            </MenuItem>
          ))}
        </Box>
      </MenuList>

      <Tooltip label="Quick power">
        <MenuButton
          isDisabled={!smartTrainerIsConnected}
          icon={<Icon as={LightningChargeFill} />}
          as={IconButton}
          aria-label="Quick power"
        />
      </Tooltip>
    </Menu>
  );
};
