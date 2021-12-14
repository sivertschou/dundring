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

export const GroupSessionOverview = () => {
  const { activeGroupSession, providedUsername, leaveGroupSession } =
    useWebsocket();
  if (!activeGroupSession) return null;
  return (
    <Stack p="5">
      <Heading fontSize="2xl">Room: #{activeGroupSession.id}</Heading>
      <List>
        {[
          ...activeGroupSession.members.filter(
            (member) => member.username === providedUsername
          ),
          ...activeGroupSession.members.filter(
            (member) => member.username !== providedUsername
          ),
        ].map((member, i) => {
          const workoutData = activeGroupSession.workoutData[member.username];
          const heartRate = (workoutData && workoutData[0].heartRate) || '';
          const power = (workoutData && workoutData[0].power) || '';
          return (
            <ListItem key={member.username}>
              <HStack fontSize="xl">
                <ListIcon as={i === 0 ? PersonFill : Person} />
                <Text fontWeight="bold">{member.username}</Text>
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
        <Button onClick={() => leaveGroupSession()} colorScheme="red">
          Leave
        </Button>
      </HStack>
    </Stack>
  );
};
