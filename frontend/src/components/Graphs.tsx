import { AspectRatio, Center, HStack, Stack } from "@chakra-ui/layout";
import * as React from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, YAxis } from "recharts";
import { hrColors, powerColors } from "../colors";
import { useWebsocket } from "../context/WebsocketContext";
import { DataPoint } from "../types";
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
  const otherUsers = activeGroupSession
    ? activeGroupSession.members.filter(
        (otherUser) => otherUser.username !== providedUsername
      )
    : [];
  const [showUserData, setShowUserData] = React.useState<ShowData>({
    hr: true,
    power: true,
  });
  const [showOtherUsersData, setShowOtherUsersData] = React.useState<{
    [username: string]: ShowData;
  }>({});

  const numPoints = 500;
  const data = rawData.map((dp) => ({
    "Your HR": dp.heartRate,
    "Your Power": dp.power,
  }));
  const otherPeoplesData = otherUsers.map((user) => {
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
  });

  const otherPeoplesDataMerged = otherPeoplesData.reduce(
    (merged, data) => mergeArrays(merged, data),
    [...Array(numPoints)]
  );

  const filledData = [
    ...new Array(numPoints).fill({
      "Your HR": undefined,
      "Your Power": undefined,
    }),
    ...data,
  ].splice(-numPoints);

  const allMerged = mergeArrays(filledData, otherPeoplesDataMerged);

  const fillAreaChart = (
    dataPrefix: string,
    checked: ShowData,
    index: number
  ) => {
    const hrColor = hrColors[index % hrColors.length];
    const powerColor = powerColors[index % powerColors.length];
    const hrGradientId = dataPrefix + "colorHR";
    const powerGradientId = dataPrefix + "colorPower";
    return (
      <>
        <defs>
          <linearGradient id={`${hrGradientId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={hrColor} stopOpacity={0.8} />
            <stop offset="95%" stopColor={hrColor} stopOpacity={0} />
          </linearGradient>
          <linearGradient id={`${powerGradientId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={powerColor} stopOpacity={0.8} />
            <stop offset="95%" stopColor={powerColor} stopOpacity={0} />
          </linearGradient>
        </defs>

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
      </>
    );
  };

  return (
    <Stack width="100%">
      <AspectRatio ratio={16 / 9} width="100%">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={allMerged}>
            {fillAreaChart("Your", showUserData, 0)}
            {otherUsers.map((user, i) =>
              fillAreaChart(
                user.username,
                showOtherUsersData[user.username] || { hr: true, power: true },
                i + 1
              )
            )}
            <YAxis />
            <Tooltip />
          </AreaChart>
        </ResponsiveContainer>
      </AspectRatio>
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
