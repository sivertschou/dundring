import { Button } from "@chakra-ui/button";
import { Stack } from "@chakra-ui/layout";
import * as React from "react";
import { useUser } from "../context/UserContext";
import { LoginModal } from "./Modals/LoginModal";

export const ActionBar = () => {
  const { user, setUser } = useUser();
  return (
    <Stack position="fixed" right="5" top="5">
      {user.loggedIn ? (
        <Button onClick={() => setUser({ loggedIn: false })}>
          {user.username}
        </Button>
      ) : (
        <LoginModal />
      )}
    </Stack>
  );
};
