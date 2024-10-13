import { Icon, IconButton, Tooltip } from '@chakra-ui/react';
import { BarChartLine, BarChartLineFill } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { useActiveWorkoutSession } from '../../context/ActiveWorkoutSessionContext';

export const SelectWorkoutButton = () => {
  const navigate = useNavigate();
  const { activeWorkoutSession } = useActiveWorkoutSession();

  const text = activeWorkoutSession.workout
    ? 'Change workout'
    : 'Select workout';
  return (
    <Tooltip label={text}>
      <IconButton
        aria-label={text}
        icon={
          <Icon
            as={activeWorkoutSession.workout ? BarChartLineFill : BarChartLine}
          />
        }
        onClick={() => navigate('/workout')}
      />
    </Tooltip>
  );
};
