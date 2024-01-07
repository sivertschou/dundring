import * as React from 'react';
import { useWebsocket } from '../../context/WebsocketContext';
import {
  Heading,
  HStack,
  List,
  ListIcon,
  ListItem,
  Stack,
  Text,
} from '@chakra-ui/layout';
import { Button } from '@chakra-ui/button';
import { Person, PersonFill } from 'react-bootstrap-icons';
import { hrColors, powerColors } from '../../colors';
import { useToast } from '@chakra-ui/toast';
import { useClipboard } from '@chakra-ui/hooks';
import * as api from '../../api';
import { Tooltip } from '@chakra-ui/tooltip';
import { useLinkColor } from '../../hooks/useLinkColor';

export const GroupSessionOverview = () => {
  const { activeGroupSession, providedUsername, leaveGroupSession } =
    useWebsocket();

  const linkColor = useLinkColor();
  const toast = useToast();
  const { onCopy } = useClipboard(
    `${api.domain}/group/${activeGroupSession?.id}`
  );

  if (!activeGroupSession) return null;

  const copyLink = () => {
    onCopy();

    toast({
      title: `Copied group session link to clipboard!`,
      isClosable: true,
      duration: 2000,
      status: 'success',
    });
  };
  return (
    <Stack p="5">
      <HStack>
        <Tooltip label="Copy group session link to clipboard">
          <Button variant="link" size="lg" onClick={copyLink} color={linkColor}>
            <Heading fontSize="2xl">Room: #{activeGroupSession.id} </Heading>
          </Button>
        </Tooltip>
      </HStack>
      <List>
        {[
          ...activeGroupSession.members.filter(
            (member) => member === providedUsername
          ),
          ...activeGroupSession.members.filter(
            (member) => member !== providedUsername
          ),
        ].map((member, i) => {
          const workoutData = activeGroupSession.workoutData[member];
          const heartRate = (workoutData && workoutData[0].heartRate) || '';
          const power = (workoutData && workoutData[0].power) || '';
          return (
            <ListItem key={member}>
              <HStack fontSize="xl">
                <ListIcon as={i === 0 ? PersonFill : Person} />
                <Text fontWeight="bold">{member}</Text>
                <Text color={hrColors[i]}>
                  {heartRate ? heartRate + 'bpm' : ''}
                </Text>{' '}
                <Text color={powerColors[i]}>{power ? power + 'W' : ''}</Text>
              </HStack>
            </ListItem>
          );
        })}
      </List>

      <HStack>
        <Button onClick={copyLink}>Copy link</Button>
        <Button onClick={() => leaveGroupSession()} colorScheme="red">
          Leave
        </Button>
      </HStack>
    </Stack>
  );
};
