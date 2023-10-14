import { Button, Icon, Tooltip } from '@chakra-ui/react';
import { ArrowDown, ArrowUp } from 'react-bootstrap-icons';
import { useSmartTrainer } from '../../context/SmartTrainerContext';
import { wattFromFtpPercent } from '../../utils/general';

interface Props {
  value: number;
  activeFtp: number;
  setActiveFtp: (newFtp: number) => void;
}

export const PowerControlButton = ({
  value,
  activeFtp,
  setActiveFtp,
}: Props) => {
  const { isConnected: smartTrainerIsConnected } = useSmartTrainer();

  const canAddResistanceValue = (value: number) => {
    const watt = wattFromFtpPercent(value, activeFtp);

    return activeFtp + watt >= 0;
  };

  const isPositive = value >= 0;
  return (
    <Tooltip
      label={`${isPositive ? '+' : '-'}${Math.abs(
        wattFromFtpPercent(value, activeFtp)
      )}W (${value}%)`}
      placement="top"
    >
      <Button
        onClick={() => {
          if (!smartTrainerIsConnected) return;
          const addWatt = wattFromFtpPercent(value, activeFtp);
          setActiveFtp(activeFtp + addWatt);
        }}
        isDisabled={!smartTrainerIsConnected || !canAddResistanceValue(value)}
        size="sm"
        leftIcon={<Icon as={isPositive ? ArrowUp : ArrowDown} />}
        paddingX="2"
      >
        {Math.abs(value)}%
      </Button>
    </Tooltip>
  );
};
