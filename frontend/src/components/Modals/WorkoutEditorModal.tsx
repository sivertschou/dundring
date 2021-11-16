import { IconButton } from "@chakra-ui/button";
import { useDisclosure } from "@chakra-ui/hooks";
import { Icon } from "@chakra-ui/icon";
import {
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/modal";
import * as React from "react";
import { ActionBarItem } from "../ActionBarItem";
import { ArrowLeft, BarChartLine } from "react-bootstrap-icons";
import { WorkoutOverview } from "../WorkoutMenu/WorkoutOverview";
import { Workout } from "../../types";
import { WorkoutEditor } from "../WorkoutMenu/WorkoutEditor";
import { useActiveWorkout } from "../../context/WorkoutContext";
import { useUser } from "../../context/UserContext";

export const WorkoutEditorModal = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { refetchData: refetchUserData } = useUser();
  const [workoutToEdit, setWorkoutToEdit] = React.useState<Workout | null>(
    null
  );

  const { setActiveWorkout } = useActiveWorkout();
  return (
    <>
      <ActionBarItem
        text="Open workout editor"
        ariaLabel="Open workout editor"
        icon={<Icon as={BarChartLine} />}
        onClick={onOpen}
      />

      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {workoutToEdit ? (
              <>
                <IconButton
                  variant="ghost"
                  aria-label="Back to overview"
                  mr="1"
                  onClick={() => setWorkoutToEdit(null)}
                  icon={<Icon as={ArrowLeft} />}
                />
                Edit workout
              </>
            ) : (
              <>Your workouts</>
            )}
          </ModalHeader>
          <ModalCloseButton />
          {workoutToEdit ? (
            <WorkoutEditor
              setWorkout={setActiveWorkout}
              workout={workoutToEdit}
              cancel={() => {
                refetchUserData();
                setWorkoutToEdit(null);
              }}
            />
          ) : (
            <WorkoutOverview setWorkoutToEdit={setWorkoutToEdit} />
          )}
          {/* <ModalFooter>
            {!isLoading ? (
              <Button onClick={() => {}}>Save</Button>
            ) : (
              <Spinner />
            )}
          </ModalFooter> */}
        </ModalContent>
      </Modal>
    </>
  );
};
