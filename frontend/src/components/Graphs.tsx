import { IconButton } from "@chakra-ui/button";
import Icon from "@chakra-ui/icon";
import { AspectRatio, Center, Grid, HStack, Stack } from "@chakra-ui/layout";
import { Tooltip as ChakraTooltip } from "@chakra-ui/tooltip";
import * as React from "react";
import { BarChartLine, BarChartLineFill } from "react-bootstrap-icons";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { hrColors, powerColors } from "../colors";
import { useWebsocket } from "../context/WebsocketContext";
import { DataPoint } from "../types";
import { CustomChartTooltip } from "./Graph/CustomChartTooltip";
import { CustomGraphTooltip } from "./Graph/CustomGraphTooltip";
import { GraphCheckboxes } from "./Graph/GraphCheckboxes";

interface Props {
  data: DataPoint[];
}
export interface ShowData {
  hr: boolean;
  power: boolean;
}
const mergeArrays = (arr1: any[], arr2: any[]) => {
  const a = arr1.length > arr2.length ? arr1 : arr2;
  const b = arr1.length > arr2.length ? arr2 : arr1;
  return a.map((a, i) => ({ ...a, ...b[i] }));
};

export const Graphs = ({ data: rawData }: Props) => {
  const { activeGroupSession, providedUsername } = useWebsocket();
  const [showFill, setShowFill] = React.useState(true);
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

  const numPoints = 500;
  const [allMerged, myAvgPower, otherPeoplesAvgPower] = React.useMemo(() => {
    const data = rawData.map((dp) => ({
      "You HR": dp.heartRate,
      "You Power": dp.power,
    }));
    const otherPeoplesDataMerged = otherUsers
      .map((user) => {
        const data = activeGroupSession?.workoutData[user.username];
        if (!data) return [];
        const baseData = [
          ...new Array(numPoints).fill({
            [user.username + " HR"]: undefined,
            [user.username + " Power"]: undefined,
          }),
        ];

        const reversed = [...data].reverse();

        return [
          ...baseData,
          ...reversed.map((data) => ({
            [user.username + " HR"]: data.heartRate,
            [user.username + " Power"]: data.power,
          })),
        ].splice(-numPoints);
      })
      .reduce(
        (merged, data) => mergeArrays(merged, data),
        [...Array(numPoints)]
      );

    const filledData = [
      ...new Array(numPoints).fill({
        "You HR": undefined,
        "You Power": undefined,
      }),
      ...data,
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
      mergeArrays(filledData, otherPeoplesDataMerged),
      myAvgPower,
      otherPeoplesAvgPower,
    ];
  }, [activeGroupSession?.workoutData, otherUsers, rawData]);

  const fillAreaChart = (
    dataPrefix: string,
    checked: ShowData,
    index: number,
    showFill: boolean
  ) => {
    const hrColor = hrColors[index % hrColors.length];
    const powerColor = powerColors[index % powerColors.length];
    const hrGradientId = dataPrefix + "colorHR";
    const powerGradientId = dataPrefix + "colorPower";
    return (
      <React.Fragment key={index}>
        {showFill ? (
          <defs>
            <linearGradient id={`${hrGradientId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={hrColor} stopOpacity={0.8} />
              <stop offset="95%" stopColor={hrColor} stopOpacity={0} />
            </linearGradient>
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

        {checked.hr ? (
          <Area
            dataKey={`${dataPrefix} HR`}
            stroke={hrColor}
            fill={`url(#${hrGradientId})`}
            animationDuration={0}
          />
        ) : null}
        {checked.power ? (
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
    const powerGradientId = dataPrefix + "colorPower";
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
  console.log("rerender graph");

  const toggleGraphFillButtonText = showFill
    ? "Hide graph fill"
    : "Show graph fill";
  return (
    <Stack width="100%">
      <HStack flexDir="row-reverse">
        <ChakraTooltip label={toggleGraphFillButtonText} placement="left">
          <IconButton
            variant="ghost"
            icon={<Icon as={showFill ? BarChartLineFill : BarChartLine} />}
            aria-label={toggleGraphFillButtonText}
            isRound={true}
            onClick={() => setShowFill((prev) => !prev)}
          />
        </ChakraTooltip>
      </HStack>
      <Grid templateColumns="5fr 1fr">
        <AspectRatio ratio={16 / 9} width="100%">
          <ResponsiveContainer>
            <AreaChart data={allMerged}>
              {fillAreaChart("You", showUserData, 0, showFill)}
              {otherUsers.map((user, i) =>
                fillAreaChart(
                  user.username,
                  showOtherUsersData[user.username] || {
                    hr: true,
                    power: true,
                  },
                  i + 1,
                  showFill
                )
              )}
              <YAxis />
              <Tooltip content={<CustomGraphTooltip />} />
            </AreaChart>
          </ResponsiveContainer>
        </AspectRatio>
        <AspectRatio ratio={1} width="100%">
          <ResponsiveContainer>
            <BarChart
              data={[
                [
                  { name: "You Power", "You Power": myAvgPower },
                  ...otherPeoplesAvgPower,
                ].reduce((res, cur) => ({ ...res, ...cur }), {}),
              ]}
            >
              {fillBarChart("You", true, 0)}
              {otherUsers.map((user, i) =>
                fillBarChart(user.username, true, i + 1)
              )}
              <YAxis />
              <Tooltip content={<CustomChartTooltip />} cursor={false} />
            </BarChart>
          </ResponsiveContainer>
        </AspectRatio>
      </Grid>
      <Stack>
        <Center>
          <HStack>
            <GraphCheckboxes
              title={"You"}
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
