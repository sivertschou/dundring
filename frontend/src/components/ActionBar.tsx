import { useColorMode } from "@chakra-ui/color-mode";
import Icon from "@chakra-ui/icon";
import { Stack, Text } from "@chakra-ui/layout";
import * as React from "react";
import {
  BoxArrowRight,
  Heart,
  HeartFill,
  LightningCharge,
  LightningChargeFill,
  Moon,
  Sun,
} from "react-bootstrap-icons";
import { hrColor, powerColor } from "../colors";
import { useHeartRateMonitor } from "../context/HeartRateContext";
import { useSmartTrainer } from "../context/SmartTrainerContext";
import { useUser } from "../context/UserContext";
import { useWebsocket } from "../context/WebsocketContext";
import { ActionBarItem } from "./ActionBarItem";
import { GroupSessionModal } from "./Modals/GroupSessionModal";
import { LoginModal } from "./Modals/LoginModal";
import { WorkoutEditorModal } from "./Modals/WorkoutEditorModal";

export const ActionBar = () => {
  const { user, setUser } = useUser();
  const { activeGroupSession } = useWebsocket();
  const {
    isConnected: hrIsConnected,
    disconnect: disconnectHR,
    requestPermission: connectHR,
  } = useHeartRateMonitor();

  const {
    isConnected: smartTrainerIsConnected,
    disconnect: disconnectSmartTrainer,
    requestPermission: connectSmartTrainer,
  } = useSmartTrainer();

  const { colorMode, setColorMode } = useColorMode();
  return (
    <Stack position="fixed" right="5" top="5" alignItems="flex-end" spacing="1">
      {user.loggedIn ? (
        <Text fontSize="xl" fontWeight="bold">
          {user.loggedIn ? user.username : null}
        </Text>
      ) : (
        <LoginModal />
      )}
      {activeGroupSession ? (
        <Text fontSize="lg" fontWeight="bold">
          #{activeGroupSession.id}
        </Text>
      ) : null}
      {hrIsConnected ? (
        <ActionBarItem
          text="Disconnect HR"
          icon={<Icon as={HeartFill} mt="1" />}
          onClick={disconnectHR}
          iconColor={hrColor}
        />
      ) : (
        <ActionBarItem
          text="Connect HR"
          icon={<Icon as={Heart} mt="1" />}
          onClick={connectHR}
        />
      )}
      {smartTrainerIsConnected ? (
        <ActionBarItem
          text="Disconnect Smart Trainer"
          icon={<Icon as={LightningChargeFill} />}
          onClick={disconnectSmartTrainer}
          iconColor={powerColor}
        />
      ) : (
        <ActionBarItem
          text="Connect Smart Trainer"
          icon={<Icon as={LightningCharge} />}
          onClick={connectSmartTrainer}
        />
      )}
      <GroupSessionModal />
      <WorkoutEditorModal />
      {colorMode === "light" ? (
        <ActionBarItem
          text="Enable darkmode"
          icon={<Icon as={Moon} />}
          onClick={() => setColorMode("dark")}
        />
      ) : (
        <ActionBarItem
          text="Enable lightmode"
          icon={<Icon as={Sun} />}
          onClick={() => setColorMode("light")}
        />
      )}
      {user.loggedIn ? (
        <ActionBarItem
          text="Logout"
          icon={<Icon as={BoxArrowRight} />}
          onClick={() => setUser({ loggedIn: false })}
        />
      ) : null}
    </Stack>
  );
};
