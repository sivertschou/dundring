import { Stack } from "@chakra-ui/layout";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";

interface Props {
  onDragEnd: (e: DropResult) => void;
  children: React.ReactNode;
}
export const DraggableList = ({ onDragEnd, children }: Props) => {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable">
        {(provided) => (
          <Stack
            ref={provided.innerRef}
            {...provided.droppableProps}
            spacing="0"
          >
            {children}
            {provided.placeholder}
          </Stack>
        )}
      </Droppable>
    </DragDropContext>
  );
};
