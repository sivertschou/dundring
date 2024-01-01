import { AspectRatio, Grid, Stack } from '@chakra-ui/layout';
import { useBreakpointValue } from '@chakra-ui/media-query';
import * as React from 'react';
import { useData } from '../context/DataContext';
import { LocalRoom } from '../context/WebsocketContext';
import { ShowData } from './Graph/GraphContainer';
import { PowerBar } from './PowerBar';
import { DataPoint, PowerChart } from './PowerChart';

interface Props {
  otherUsers: string[];
  activeGroupSession: LocalRoom | null;
  showFill: boolean;
  showUserData: ShowData;
  showOtherUsersData: { [username: string]: ShowData };
}

const mergeArrays = <T1 extends object, T2 extends object>(
  arr1: T1[],
  arr2: T2[]
) => {
  const a = arr1.length > arr2.length ? arr1 : arr2;
  const b = arr1.length > arr2.length ? arr2 : arr1;
  return a.map((aItem, i) => ({ ...aItem, ...b[i] }));
};

export const Graphs = ({
  otherUsers,
  showFill,
  showUserData,
  showOtherUsersData,
  activeGroupSession,
}: Props) => {
  const { data: laps, untrackedData: rawUntrackedData } = useData();
  const rawData = laps.flatMap((x) => x.dataPoints);
  const numPoints = 500;

  const allMerged = React.useMemo(() => {
    const data = rawData.map((dataPoint) => ({
      'You HR': dataPoint.heartRate,
      'You Power': dataPoint.power,
    }));

    const untrackedData = rawUntrackedData.map((dataPoint) => ({
      'You-Untracked HR': dataPoint.heartRate,
      'You-Untracked Power': dataPoint.power,
    }));

    const otherPeoplesDataMerged = otherUsers
      .map((username) => {
        const data = activeGroupSession?.workoutData[username];
        if (!data) return [];
        const baseData: DataPoint[] = [
          ...new Array(numPoints).fill({
            [username + ' HR']: undefined,
            [username + ' Power']: undefined,
          }),
        ];

        const reversed = [...data].reverse();

        return [
          ...baseData,
          ...reversed.map((data) => ({
            [username + ' HR']: data.heartRate,
            [username + ' Power']: data.power,
          })),
        ].splice(-numPoints);
      })
      .reduce(
        (merged, data) => mergeArrays(merged, data),
        [...(Array(numPoints) as DataPoint[])]
      );

    const filledData = [
      ...(new Array(numPoints).fill({
        'You HR': undefined,
        'You Power': undefined,
      }) as DataPoint<'You'>[]),
      ...data,
    ].splice(-numPoints);

    const filledUntrackedData = [
      ...(new Array(numPoints).fill({
        'You-Untracked HR': undefined,
        'You-Untracked Power': undefined,
      }) as DataPoint<'You-Untracked'>[]),
      ...untrackedData,
    ].splice(-numPoints);

    return mergeArrays(
      mergeArrays(filledData, otherPeoplesDataMerged),
      filledUntrackedData
    );
  }, [rawData, rawUntrackedData, otherUsers, activeGroupSession]);

  const myAvgPower = Math.floor(
    [...rawData].splice(-3).reduce((sum, data) => sum + (data.power || 0), 0) /
      3
  );

  const otherPeoplesAvgPower = otherUsers.map((username) => {
    const data = activeGroupSession?.workoutData[username];
    if (!data) return null;
    const avgPower = Math.floor(
      ((data[0]?.power || 0) + (data[1]?.power || 0) + (data[2]?.power || 0)) /
        3
    );
    const name = `${username} Power`;
    return { name, [name]: avgPower };
  });

  const showPowerBar = useBreakpointValue({ base: false, md: true });

  return (
    <Stack width="100%">
      <Grid templateColumns={showPowerBar ? '5fr 1fr' : '1fr'}>
        <AspectRatio ratio={16 / 9} width="100%">
          <PowerChart
            allMerged={allMerged}
            otherUsers={otherUsers}
            showOtherUsersData={showOtherUsersData}
            showUserData={showUserData}
            showFill={showFill}
          />
        </AspectRatio>
        {showPowerBar && (
          <AspectRatio ratio={1}>
            <PowerBar
              showFill={showFill}
              otherUsers={otherUsers}
              otherPeoplesAvgPower={otherPeoplesAvgPower}
              myAvgPower={myAvgPower}
            />
          </AspectRatio>
        )}
      </Grid>
    </Stack>
  );
};
