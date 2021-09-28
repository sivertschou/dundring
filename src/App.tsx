import { Center, Stack, Text } from "@chakra-ui/layout";
import { ChakraProvider, Button } from "@chakra-ui/react";
import * as React from "react";
import { useHeartRate } from "./hooks/useHeartRate";
import theme from "./theme";

interface DataPoint {
  heartRate?: number;
  timeStamp: Date;
}
const toTCX = (dataPoints: DataPoint[]) => {
  const filtererdDataPoints = dataPoints.filter((d) => d.heartRate);
  const startTime = filtererdDataPoints[0].timeStamp;
  const endTime = filtererdDataPoints[filtererdDataPoints.length - 1].timeStamp;

  const duration = (endTime.getTime() - startTime.getTime()) / 1000;
  const avgHR = 69; // TODO
  const maxHR = 69; // TODO

  const output = `
<?xml version="1.0" encoding="UTF-8"?>
<TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2">
  <Activities>
    <Activity Sport="Biking">
      <Id>${startTime.toISOString()}</Id>
      <Lap StartTime="${startTime.toISOString()}">
        <TotalTimeSeconds>${duration}</TotalTimeSeconds>
        <AverageHeartRateBpm>
          <Value>${avgHR}</Value>
        </AverageHeartRateBpm>
        <MaximumHeartRateBpm>
          <Value>${maxHR}</Value>
        </MaximumHeartRateBpm>
        <Intensity>Active</Intensity>
        <TriggerMethod>Manual</TriggerMethod>
        <Track>
        ${filtererdDataPoints.map(
          (d) =>
            `<Trackpoint>
              <Time>${d.timeStamp.toISOString()}</Time>
              <HeartRateBpm>
                <Value>${d.heartRate}</Value>
              </HeartRateBpm>
              <SensorState>Present</SensorState>
            </Trackpoint>`
        )}
          </Track>
        </Lap>
    </Activity>
  </Activities>
  <Author xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="Application_t">
    <Name>Dundring</Name>
    <Build>
      <Version>
        <VersionMajor>0</VersionMajor>
        <VersionMinor>0</VersionMinor>
      </Version>
    </Build>
    <LangID>EN</LangID>
    <PartNumber>XXX-XXXXX-XX</PartNumber>
  </Author>
</TrainingCenterDatabase>
 `;

  console.log("output:", output);

  const url = window.URL.createObjectURL(new Blob([output]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `FileName.tcx`);

  // Append to html link element page
  document.body.appendChild(link);

  // Start download
  link.click();

  // Clean up and remove the link
  link.parentNode.removeChild(link);
};

export const App = () => {
  const { requestHRPermission, heartRate, isConnected, disconnect } =
    useHeartRate();

  const [data, setData] = React.useState([] as DataPoint[]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (isConnected) {
        setData((data) => [
          ...data,
          {
            heartRate: heartRate ? heartRate : undefined,
            timeStamp: new Date(),
          },
        ]);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [heartRate, isConnected]);

  return (
    <ChakraProvider theme={theme}>
      <Center>
        <Stack>
          <Button
            onClick={() => (isConnected ? disconnect() : requestHRPermission())}
          >
            {isConnected ? "Disconnect" : "Connect"}{" "}
          </Button>
          {isConnected ? <Text>HR: {heartRate}</Text> : null}
          {!isConnected && data ? (
            <Button onClick={() => toTCX(data)}>Convert to TCX</Button>
          ) : null}
          <Stack direction="column-reverse">
            {data
              .filter((d) => d.heartRate)
              .map((d, i) => (
                <Text key={i}>
                  {d.timeStamp.toUTCString()} HR: {d.heartRate}
                </Text>
              ))}
          </Stack>
        </Stack>
      </Center>
    </ChakraProvider>
  );
};
