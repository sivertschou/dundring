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
import { LightningChargeFill } from 'react-bootstrap-icons';
import { useActiveWorkoutSession } from '../../context/ActiveWorkoutSessionContext';
import { useSmartTrainer } from '../../context/SmartTrainerContext';
import { wattFromFtpPercent } from '../../utils/general';

const defaultResistancePercentages = [
  50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150,
];

export const QuickPowerButton = () => {
  const {
    setResistance: setSmartTrainerResistance,
    isConnected: smartTrainerIsConnected,
  } = useSmartTrainer();
  const { activeFtp } = useActiveWorkoutSession();

  return (
    <Menu placement="top">
      <MenuList>
        <Box>
          <MenuItem onClick={() => setSmartTrainerResistance(0)}>
            Free mode
          </MenuItem>
          {defaultResistancePercentages.map((percentage, i) => (
            <MenuItem
              key={i}
              onClick={() =>
                setSmartTrainerResistance(
                  wattFromFtpPercent(percentage, activeFtp)
                )
              }
            >
              {wattFromFtpPercent(percentage, activeFtp)}W ({percentage}
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
