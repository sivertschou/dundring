import { Center } from "@chakra-ui/layout";
import { Draggable } from "react-beautiful-dnd";

interface Props {
  children: React.ReactNode;
  id: string;
  index: number;
}
export const DraggableItem = ({ id, index, children }: Props) => {
  return (
    <Draggable draggableId={id} index={index}>
      {(provided, _snapshot) => (
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
