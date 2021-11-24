import { useColorModeValue } from "@chakra-ui/color-mode";
import { Grid, SimpleGrid, Stack, Text } from "@chakra-ui/layout";
import { Table, Td, Tr } from "@chakra-ui/table";

interface Payload {
  name: string;
  value: number;
  color: string;
}

interface Props {
  active?: boolean;
  label?: string;
  payload?: Payload[];
}

const formatLine = (name: string, value: number) => {
  const unit = name.split(" ")[1] === "HR" ? " bpm" : " W";
  return [`${name.split(" ")[0]}`, value, unit];
};
export const CustomTooltip = ({ active, payload, label }: Props) => {
  const bgColor = useColorModeValue("white", "gray.800");
  if (active && payload && payload.length) {
    return (
      <Table bgColor={bgColor} borderRadius="5" variant="unstyled">
        {payload.map((dataPoint, i) => {
          const [name, value, unit] = formatLine(
            dataPoint.name,
            dataPoint.value
          );
          return (
            <Tr>
              <Td p="0">
                <Text color={dataPoint.color} align="right" p="1">
                  {name}:
                </Text>
              </Td>
              <Td p="0">
                <Text
                  color={dataPoint.color}
                  align="right"
                  fontWeight="bold"
                  paddingY="1"
                >
                  {value}
                </Text>
              </Td>
              <Td p="0">
                <Text color={dataPoint.color} paddingY="1" pr="1">
                  {" "}
                  {unit}
                </Text>
              </Td>
            </Tr>
          );
        })}
        {/* <Text>{`${payload[0].value}`}</Text>
        <Text>Anything you want can be displayed here.</Text> */}
      </Table>
    );
  }

  return null;
};
