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
import { People, PeopleFill } from "react-bootstrap-icons";
import { useWebsocket } from "../../context/WebsocketContext";
import { GroupSessionOverview } from "../GroupSession/GroupSessionOverview";
import { CreateOrJoinGroupSession } from "../GroupSession/CreateOrJoinGroupSession";

export const GroupSessionModal = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { activeGroupSession } = useWebsocket();
  return (
    <>
      <ActionBarItem
        text="Open group session overview"
        icon={<Icon as={activeGroupSession ? PeopleFill : People} />}
        onClick={onOpen}
      />
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Group session</ModalHeader>
          <ModalCloseButton />
          {activeGroupSession ? (
            <GroupSessionOverview />
          ) : (
            <CreateOrJoinGroupSession />
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
