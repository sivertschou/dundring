import { DataPoint } from '../../types';
import * as React from 'react';
import { Graphs } from '../Graphs';
import { Center, HStack, Stack } from '@chakra-ui/layout';
import { Tooltip } from '@chakra-ui/tooltip';
import { IconButton } from '@chakra-ui/button';
import Icon from '@chakra-ui/icon';
import { BarChartLine, BarChartLineFill } from 'react-bootstrap-icons';
import { GraphCheckboxes } from './GraphCheckboxes';
import { useWebsocket } from '../../context/WebsocketContext';

export interface ShowData {
  hr: boolean;
  power: boolean;
}
interface Props {
  data: DataPoint[];
}

export const GraphContainer = ({ data }: Props) => {
  const [showFill, setShowFill] = React.useState(true);
  const toggleGraphFillButtonText = showFill
    ? 'Hide graph fill'
    : 'Show graph fill';
  const { activeGroupSession, providedUsername } = useWebsocket();
  const otherUsers = React.useMemo(
    () =>
      activeGroupSession
        ? activeGroupSession.members.filter(
            (otherUser) => otherUser.username !== providedUsername
          )
        : [],
    [activeGroupSession, providedUsername]
  );
  const [showUserData, setShowUserData] = React.useState<ShowData>({
    hr: true,
    power: true,
  });
  const [showOtherUsersData, setShowOtherUsersData] = React.useState<{
    [username: string]: ShowData;
  }>({});

  const graphs = React.useMemo(
    () => (
      <Graphs
        data={data}
        showFill={showFill}
        showUserData={showUserData}
        showOtherUsersData={showOtherUsersData}
        activeGroupSession={activeGroupSession}
        otherUsers={otherUsers}
      />
    ),
    [
      data,
      showFill,
      showUserData,
      showOtherUsersData,
      activeGroupSession,
      otherUsers,
    ]
  );
  return (
    <Stack width="100%">
      <HStack flexDir="row-reverse">
        <Tooltip label={toggleGraphFillButtonText} placement="left">
          <IconButton
            variant="ghost"
            icon={<Icon as={showFill ? BarChartLineFill : BarChartLine} />}
            aria-label={toggleGraphFillButtonText}
            isRound={true}
            onClick={() => setShowFill((prev) => !prev)}
          />
        </Tooltip>
      </HStack>
      {graphs}
      <Stack>
        <Center>
          <HStack>
            <GraphCheckboxes
              title={'You'}
              setChecked={(checked) => setShowUserData(checked)}
              checked={showUserData}
            />
            {otherUsers.map((user, i) => (
              <GraphCheckboxes
                key={user.username}
                title={user.username}
                index={i + 1}
                setChecked={(checked) =>
                  setShowOtherUsersData((prev) => ({
                    ...prev,
                    [user.username]: checked,
                  }))
                }
                checked={
                  showOtherUsersData[user.username] || { hr: true, power: true }
                }
              />
            ))}
          </HStack>
        </Center>
      </Stack>
    </Stack>
  );
};
