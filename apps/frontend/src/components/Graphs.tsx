import { AspectRatio, Grid, Stack } from '@chakra-ui/layout';
import { useBreakpointValue } from '@chakra-ui/media-query';
import { Member } from '@dundring/types';
import * as React from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  YAxis,
} from 'recharts';
import { hrColors, powerColors, untrackedColor } from '../colors';
import { useData } from '../context/DataContext';
import { LocalRoom } from '../context/WebsocketContext';
import { CustomChartTooltip } from './Graph/CustomChartTooltip';
import { CustomGraphTooltip } from './Graph/CustomGraphTooltip';
import { ShowData } from './Graph/GraphContainer';

interface Props {
  otherUsers: Member[];
  activeGroupSession: LocalRoom | null;
  showFill: boolean;
  showUserData: ShowData;
  showOtherUsersData: { [username: string]: ShowData };
}
const mergeArrays = <A,>(arr1: A[], arr2: A[]) => {
  const a = arr1.length > arr2.length ? arr1 : arr2;
  const b = arr1.length > arr2.length ? arr2 : arr1;
  return a.map((a, i) => ({ ...a, ...b[i] }));
};

type DataElement = {
  [usernameAndType: `${string} ${'HR' | 'Power'}`]: number | undefined;
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
  const [allMerged, myAvgPower, otherPeoplesAvgPower] = React.useMemo(() => {
    const data = rawData.map((dataPoint) => ({
      'You HR': dataPoint.heartRate,
      'You Power': dataPoint.power,
    }));

    const untrackedData = rawUntrackedData.map((dataPoint) => ({
      'You-Untracked HR': dataPoint.heartRate,
      'You-Untracked Power': dataPoint.power,
    }));

    const otherPeoplesDataMerged = otherUsers
      .map((user) => {
        const data = activeGroupSession?.workoutData[user.username];
        if (!data) return [];
        const filler = {
          [user.username + ' HR']: undefined,
          [user.username + ' Power']: undefined,
        };
        const baseData = new Array<DataElement>(numPoints).fill(filler);
        const reversedUserData: Array<DataElement> = [...data]
          .reverse()
          .map((data) => ({
            [user.username + ' HR']: data.heartRate,
            [user.username + ' Power']: data.power,
          }));

        return [...baseData, ...reversedUserData].splice(-numPoints);
      })
      .reduce(
        (merged, data) => mergeArrays(merged, data),
        Array<DataElement>(numPoints)
      );

    const filledData = [
      ...new Array<DataElement>(numPoints).fill({
        'You HR': undefined,
        'You Power': undefined,
      }),
      ...data,
    ].splice(-numPoints);

    const filledUntrackedData = [
      ...new Array<DataElement>(numPoints).fill({
        'You-Untracked HR': undefined,
        'You-Untracked Power': undefined,
      }),
      ...untrackedData,
    ].splice(-numPoints);

    const otherPeoplesAvgPower = otherUsers.map((user) => {
      const data = activeGroupSession?.workoutData[user.username];
      if (!data) return null;
      const avgPower = Math.floor(
        ((data[0]?.power || 0) +
          (data[1]?.power || 0) +
          (data[1]?.power || 0)) /
          3
      );
      const name = `${user.username} Power`;
      return { name, [name]: avgPower };
    });
    const myAvgPower = Math.floor(
      [...rawData]
        .splice(-3)
        .reduce((sum, data) => sum + (data.power || 0), 0) / 3
    );

    return [
      mergeArrays(
        mergeArrays(filledData, otherPeoplesDataMerged),
        filledUntrackedData
      ),
      myAvgPower,
      otherPeoplesAvgPower,
    ];
  }, [activeGroupSession?.workoutData, otherUsers, rawData, rawUntrackedData]);

  const fillAreaChart = (
    dataPrefix: string,
    checked: ShowData,
    index: number,
    showFill: boolean,
    type: 'hr' | 'power',
    isUntracked: boolean = false
  ) => {
    const hrColor = isUntracked
      ? untrackedColor
      : hrColors[index % hrColors.length];
    const powerColor = isUntracked
      ? untrackedColor
      : powerColors[index % powerColors.length];
    const hrGradientId = dataPrefix + 'colorHR';
    const powerGradientId = dataPrefix + 'colorPower';
    const showHr = type === 'hr' && checked.hr;
    const showPower = type === 'power' && checked.power;
    return (
      <React.Fragment key={index}>
        {showFill ? (
          <defs>
            {showHr ? (
              <linearGradient
                id={`${hrGradientId}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={hrColor} stopOpacity={0.4} />
                <stop offset="95%" stopColor={hrColor} stopOpacity={0} />
              </linearGradient>
            ) : null}
            {showPower ? (
              <linearGradient
                id={`${powerGradientId}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={powerColor} stopOpacity={0.4} />
                <stop offset="95%" stopColor={powerColor} stopOpacity={0} />
              </linearGradient>
            ) : null}
          </defs>
        ) : null}

        {showHr ? (
          <Area
            dataKey={`${dataPrefix} HR`}
            stroke={hrColor}
            fill={`url(#${hrGradientId})`}
            animationDuration={0}
          />
        ) : null}
        {showPower ? (
          <Area
            dataKey={`${dataPrefix} Power`}
            stroke={powerColor}
            fill={`url(#${powerGradientId})`}
            animationDuration={0}
          />
        ) : null}
      </React.Fragment>
    );
  };

  const fillBarChart = (dataPrefix: string, show: boolean, index: number) => {
    const powerColor = powerColors[index % powerColors.length];
    const powerGradientId = dataPrefix + 'colorPower';
    return (
      <React.Fragment key={index}>
        {showFill ? (
          <defs>
            <linearGradient
              id={`${powerGradientId}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="5%" stopColor={powerColor} stopOpacity={0.8} />
              <stop offset="95%" stopColor={powerColor} stopOpacity={0} />
            </linearGradient>
          </defs>
        ) : null}

        {show ? (
          <Bar
            dataKey={`${dataPrefix} Power`}
            stroke={powerColor}
            fill={`url(#${powerGradientId})`}
          />
        ) : null}
      </React.Fragment>
    );
  };

  const showPowerBar = useBreakpointValue({ base: false, md: true });
  return (
    <Stack width="100%">
      <Grid templateColumns={showPowerBar ? '5fr 1fr' : '1fr'}>
        <AspectRatio ratio={16 / 9} width="100%">
          <ResponsiveContainer>
            <AreaChart data={allMerged}>
              {otherUsers.map((user, i) =>
                fillAreaChart(
                  user.username,
                  showOtherUsersData[user.username] || {
                    hr: true,
                    power: true,
                  },
                  i + 1,
                  showFill,
                  'power'
                )
              )}
              {fillAreaChart(
                'You-Untracked',
                showUserData,
                0,
                showFill,
                'power',
                true
              )}
              {fillAreaChart('You', showUserData, 0, showFill, 'power')}
              {otherUsers.map((user, i) =>
                fillAreaChart(
                  user.username,
                  showOtherUsersData[user.username] || {
                    hr: true,
                    power: true,
                  },
                  i + 1,
                  showFill,
                  'hr'
                )
              )}
              {fillAreaChart('You', showUserData, 0, showFill, 'hr')}
              {fillAreaChart(
                'You-Untracked',
                showUserData,
                0,
                showFill,
                'hr',
                true
              )}

              <YAxis />
              <Tooltip content={<CustomGraphTooltip />} />
            </AreaChart>
          </ResponsiveContainer>
        </AspectRatio>
        {showPowerBar ? (
          <AspectRatio ratio={1} width="100%">
            <ResponsiveContainer>
              <BarChart
                data={[
                  [
                    { name: 'You Power', 'You Power': myAvgPower },
                    ...otherPeoplesAvgPower,
                  ].reduce((res, cur) => ({ ...res, ...cur }), {}),
                ]}
              >
                {fillBarChart('You', true, 0)}
                {otherUsers.map((user, i) =>
                  fillBarChart(user.username, true, i + 1)
                )}
                <YAxis />
                <Tooltip content={<CustomChartTooltip />} cursor={false} />
              </BarChart>
            </ResponsiveContainer>
          </AspectRatio>
        ) : null}
      </Grid>
    </Stack>
  );
};
