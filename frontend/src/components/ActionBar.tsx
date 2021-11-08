import Icon from "@chakra-ui/icon";
import { Stack, Text } from "@chakra-ui/layout";
import * as React from "react";
import { BsBoxArrowInRight } from "react-icons/bs";
import { useUser } from "../context/UserContext";
import { ActionBarItem } from "./ActionBarItem";
import { LoginModal } from "./Modals/LoginModal";

export const ActionBar = () => {
  const { user, setUser } = useUser();
  return (
    <Stack position="fixed" right="5" top="5" alignItems="end" spacing="1">
      {user.loggedIn ? (
        <Text fontSize="xl" fontWeight="bold">
          {user.loggedIn ? user.username : null}
        </Text>
      ) : (
        <LoginModal />
      )}

      {user.loggedIn ? (
        <ActionBarItem
          text="Logout"
          ariaLabel="profile"
          icon={<Icon as={BsBoxArrowInRight} boxSize="1.5rem" />}
          onClick={() => setUser({ loggedIn: false })}
        />
      ) : null}
    </Stack>
  );
};
