import * as React from "react";
import { useWebsocket } from "../../context/WebsocketContext";
import { Stack, Text } from "@chakra-ui/layout";

export const GroupSessionOverview = () => {
  const { activeGroupSession } = useWebsocket();
  if (!activeGroupSession) return null;
  return (
    <Stack p="5">
      <Text>Room: {activeGroupSession.id}</Text>
      {activeGroupSession.members.map((member) => {
        const workoutData = activeGroupSession.workoutData[member.username];
        const heartRate = (workoutData && workoutData[0].heartRate) || "";
        const power = (workoutData && workoutData[0].power) || "";
        return (
          <Text key={member.username}>
            {member.username} {heartRate} {power}
          </Text>
        );
      })}
    </Stack>
  );
};
