import { AspectRatio, Center } from "@chakra-ui/layout";
import * as React from "react";
import {
  Area,
  AreaChart,
  Line,
  LineChart,
  ResponsiveContainer,
  YAxis,
} from "recharts";
import { DataPoint } from "./types";

interface Props {
  data: DataPoint[];
}
export const Graphs = ({ data: rawData }: Props) => {
  const data = rawData.map((dp) => ({
    name: ":)",
    hr: dp.heartRate,
    power: dp.power,
  }));
  const numPoints = 500;
  const filledData = [
    ...new Array(numPoints).fill({
      name: ":)",
      hr: undefined,
      power: undefined,
    }),
    ...data,
  ].splice(-numPoints);
  return (
    <AspectRatio ratio={16 / 9} width="100%">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={filledData}>
          <YAxis />
          <Area dataKey="hr" stroke="red" fill="red" animationDuration={0} />
          <Area
            dataKey="power"
            stroke="purple"
            fill="purple"
            animationDuration={0}
          />
        </AreaChart>
      </ResponsiveContainer>
    </AspectRatio>
  );
};
