import { AspectRatio, Grid, Stack } from '@chakra-ui/layout';
import { useBreakpointValue } from '@chakra-ui/media-query';
import * as React from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { hrColors, powerColors } from '../colors';
import { LocalRoom, Member } from '../context/WebsocketContext';
import { DataPoint } from '../types';
import { averageNonNull } from '../utils';
import { CustomChartTooltip } from './Graph/CustomChartTooltip';
import { CustomGraphTooltip } from './Graph/CustomGraphTooltip';
import { ShowData } from './Graph/GraphContainer';

interface Props {
  data: DataPoint[];
  otherUsers: Member[];
  activeGroupSession: LocalRoom | null;
  showFill: boolean;
  showUserData: ShowData;
  showOtherUsersData: { [username: string]: ShowData };
}

interface GraphData {
  [x: string]: number | undefined;
}

const mergeArrays = <T extends object>(arr1: T[], arr2: T[]): T[] => {
  const a = arr1.length > arr2.length ? arr1 : arr2;
  const b = arr1.length > arr2.length ? arr2 : arr1;
  return a.map((a, i) => ({ ...a, ...b[i] }));
};

export const Graphs = ({
  data: rawData,
  otherUsers,
  showFill,
  showUserData,
  showOtherUsersData,
  activeGroupSession,
}: Props) => {
  const numPoints = 500;
  const [allMerged, myAvgPower, otherPeoplesAvgPower] = React.useMemo(() => {
    const data = rawData.map((dp) => ({
      'You HR': dp.heartRate,
      'You Power': dp.power,
      'You Time': dp.timeStamp,
    }));
    const otherPeoplesDataMerged = otherUsers
      .map((user) => {
        const data = activeGroupSession?.workoutData[user.username];
        if (!data) return [];

        const baseData = [
          ...new Array(numPoints).fill({
            [user.username + ' HR']: undefined,
            [user.username + ' Power']: undefined,
          }),
        ] as GraphData[];

        const reversed = [...data].reverse();

        const xs = [
          ...baseData,
          ...reversed.map((data) => ({
            [user.username + ' HR']: data.heartRate,
            [user.username + ' Power']: data.power,
          })),
        ];

        return xs.splice(-numPoints);
      })
      .reduce(
        (merged, data) => mergeArrays(merged, data),
        [...Array<GraphData>(numPoints)]
      );

    const filledData = [
      ...(new Array(numPoints).fill({
        'You HR': undefined,
        'You Power': undefined,
      }) as GraphData[]),
      ...data,
    ].splice(-numPoints);

    const otherPeoplesAvgPower = otherUsers.map((user) => {
      const data = activeGroupSession?.workoutData[user.username];
      if (!data) return null;
      const avgPower = Math.floor(
        averageNonNull([data[0]?.power, data[1]?.power, data[2]?.power])
      );

      const name = `${user.username} Power`;
      return { name, [name]: avgPower };
    });
    const myAvgPower = Math.floor(
      averageNonNull([...rawData].map((d) => d.power))
    );

    return [
      mergeArrays(filledData, otherPeoplesDataMerged),
      myAvgPower,
      otherPeoplesAvgPower,
    ];
  }, [activeGroupSession?.workoutData, otherUsers, rawData]);

  const fillAreaChart = (
    dataPrefix: string,
    checked: ShowData,
    index: number,
    showFill: boolean,
    type: 'hr' | 'power'
  ) => {
    const hrColor = hrColors[index % hrColors.length];
    const powerColor = powerColors[index % powerColors.length];
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

              <XAxis />
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
