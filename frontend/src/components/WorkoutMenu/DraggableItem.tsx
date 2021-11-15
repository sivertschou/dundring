import { Center, HStack, Stack } from "@chakra-ui/layout";
import {
  DragDropContext,
  Droppable,
  DropResult,
  Draggable,
} from "react-beautiful-dnd";

interface Props {
  children: React.ReactNode;
  id: string;
  index: number;
}
export const DraggableItem = ({ id, index, children }: Props) => {
  return (
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) => (
        <Center
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          {children}
        </Center>
      )}
    </Draggable>
  );
};
