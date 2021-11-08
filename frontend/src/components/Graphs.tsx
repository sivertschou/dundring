import { AspectRatio } from "@chakra-ui/layout";
import * as React from "react";
import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";
import { DataPoint } from "../types";

interface Props {
  data: DataPoint[];
}
export const Graphs = ({ data: rawData }: Props) => {
  const data = rawData.map((dp) => ({
    hr: dp.heartRate,
    power: dp.power,
  }));
  const numPoints = 500;
  const filledData = [
    ...new Array(numPoints).fill({
      hr: undefined,
      power: undefined,
    }),
    ...data,
  ].splice(-numPoints);
  return (
    <AspectRatio ratio={16 / 9} width="100%">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={filledData}>
          <defs>
            <linearGradient id="colorHR" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff4d4a" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#ff4d4a" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ae4aff" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#ae4aff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis />
          <Area
            dataKey="hr"
            stroke="#ff4d4a"
            fill="url(#colorHR)"
            animationDuration={0}
          />
          <Area
            dataKey="power"
            stroke="#ae4aff"
            fill="url(#colorPower)"
            animationDuration={0}
          />
        </AreaChart>
      </ResponsiveContainer>
    </AspectRatio>
  );
};
