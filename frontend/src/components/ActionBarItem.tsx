import { Center, HStack, Link, Text } from "@chakra-ui/layout";
import * as React from "react";

interface Props {
  text: string;
  ariaLabel: string;
  icon: React.ReactElement;
  onClick: () => void;
}

export const ActionBarItem = ({ text, icon, ariaLabel, onClick }: Props) => {
  const [hover, setHover] = React.useState(false);
  const color = "rgba(66, 66, 66, .6)";
  const hoverColor = "rgba(66, 66, 66, 1)";
  return (
    <Link
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
      padding="2"
      _hover={{ textDecoration: "none" }}
    >
      <HStack spacing="0">
        <Center overflow="hidden" paddingRight="2">
          <Text
            fontSize="xl"
            textDecor={"none"}
            transform={hover ? "translate(0,0)" : "translate(120%,0)"}
            opacity={hover ? "1" : "0"}
            overflow="hidden"
            transition="transform 0.2s ease, opacity 0.2s ease"
          >
            {text}
          </Text>
        </Center>
        <Center
          p="3"
          borderRadius="100%"
          backgroundColor={hover ? hoverColor : color}
        >
          {icon}
        </Center>
      </HStack>
    </Link>
  );
};
