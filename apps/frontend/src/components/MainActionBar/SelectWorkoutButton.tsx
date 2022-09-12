import { Icon, IconButton, Tooltip } from '@chakra-ui/react';
import { BarChartLine, BarChartLineFill } from 'react-bootstrap-icons';
import { useActiveWorkout } from '../../context/ActiveWorkoutContext';
import { useWorkoutEditorModal } from '../../context/ModalContext';

export const SelectWorkoutButton = () => {
  const { onOpen: onOpenWorkoutEditor } = useWorkoutEditorModal();
  const { activeWorkout } = useActiveWorkout();

  const text = activeWorkout.workout ? 'Change workout' : 'Select workout';
  return (
    <Tooltip label={text}>
      <IconButton
        aria-label={text}
        icon={
          <Icon as={activeWorkout.workout ? BarChartLineFill : BarChartLine} />
        }
        onClick={onOpenWorkoutEditor}
      />
    </Tooltip>
  );
};
