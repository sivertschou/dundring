import { Icon, IconButton, Tooltip } from '@chakra-ui/react';
import { BarChartLine, BarChartLineFill } from 'react-bootstrap-icons';
import { useActiveWorkout } from '../../context/ActiveWorkoutContext';
import { useWorkoutEditorModal } from '../../context/ModalContext';

export const LoadWorkoutButton = () => {
  const { onOpen: onOpenWorkoutEditor } = useWorkoutEditorModal();
  const { activeWorkout } = useActiveWorkout();

  const text = activeWorkout.workout ? 'Replace workout' : 'Load workout';
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
