import * as React from "react";
import { useWebsocket } from "../../context/WebsocketContext";
import { Stack, Text } from "@chakra-ui/layout";
import { Button } from "@chakra-ui/button";

export const GroupSessionOverview = () => {
  const { activeGroupSession, sendMessageToGroup } = useWebsocket();
  if (!activeGroupSession) return null;
  return (
    <Stack p="5">
      <Text>Room: {activeGroupSession.id}</Text>
      {activeGroupSession.members.map((member) => (
        <Text key={member.username}>{member.username}</Text>
      ))}
      <Button
        onClick={() => {
          sendMessageToGroup("HAllais");
        }}
      >
        Si halla
      </Button>
    </Stack>
  );
};
