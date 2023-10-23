import { Button, Icon, Tooltip } from '@chakra-ui/react';
import { ArrowDown, ArrowUp } from 'react-bootstrap-icons';
import { useSmartTrainer } from '../../context/SmartTrainerContext';
import { wattFromFtpPercent } from '../../utils/general';

interface Props {
  value: number;
  activeFtp: number;
}

export const PowerControlButton = ({ value, activeFtp }: Props) => {
  const {
    isConnected: smartTrainerIsConnected,
    setResistance: setSmartTrainerResistance,
    currentResistance,
  } = useSmartTrainer();

  const canAddResistanceValue = (value: number) => {
    const watt = wattFromFtpPercent(value, activeFtp);

    return currentResistance + watt >= 0;
  };

  const isPositive = value >= 0;
  return (
    <Tooltip
      label={`${isPositive ? '+' : '-'}${Math.abs(value)}W`}
      placement="top"
    >
      <Button
        onClick={() => {
          if (!smartTrainerIsConnected) return;
          setSmartTrainerResistance(currentResistance + value);
        }}
        isDisabled={!smartTrainerIsConnected || !canAddResistanceValue(value)}
        size="sm"
        leftIcon={<Icon as={isPositive ? ArrowUp : ArrowDown} />}
        paddingX="2"
      >
        {Math.abs(value)}W
      </Button>
    </Tooltip>
  );
};
