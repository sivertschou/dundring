import Icon from "@chakra-ui/icon";
import { Stack } from "@chakra-ui/layout";
import * as React from "react";
import { BsPersonFill } from "react-icons/bs";
import { useUser } from "../context/UserContext";
import { ActionBarItem } from "./ActionBarItem";
import { LoginModal } from "./Modals/LoginModal";

export const ActionBar = () => {
  const { user, setUser } = useUser();
  return (
    <Stack position="fixed" right="5" top="5">
      {user.loggedIn ? (
        <ActionBarItem
          text={user.username}
          ariaLabel="profile"
          icon={<Icon as={BsPersonFill} boxSize="1.5rem" />}
          onClick={() => setUser({ loggedIn: false })}
        />
      ) : (
        <LoginModal />
      )}
    </Stack>
  );
};
