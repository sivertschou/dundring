import { useColorModeValue } from '@chakra-ui/react';

export const useLinkColor = () => {
  const linkColor = useColorModeValue('black', 'white');
  return linkColor;
};

export const useLinkPowerColor = () =>
  useColorModeValue('purple.500', 'purple.400');
