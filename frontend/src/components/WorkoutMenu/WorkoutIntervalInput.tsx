import { IconButton } from '@chakra-ui/button';
import { Tooltip } from '@chakra-ui/tooltip';
import Icon from '@chakra-ui/icon';
import { Input, InputGroup, InputRightAddon } from '@chakra-ui/input';
import { Text, Grid, Center } from '@chakra-ui/layout';
import { FormControl } from '@chakra-ui/react';
import * as React from 'react';
import { Files, List, X } from 'react-bootstrap-icons';
import { WorkoutPart } from '../../types';
import { parseInputAsInt } from '../../utils';
import { findZone } from '../../zones';

interface Data {
  seconds: number;
  power: number;
  secondsInput: string;
  minutesInput: string;
  powerPercentInput: string;
  powerWattInput: string;
}
interface UpdateTimeSeconds {
  type: 'UPDATE_TIME_SECONDS';
  value: string;
  setWorkoutPart: (workoutPart: WorkoutPart) => void;
}
interface UpdateTimeMinutes {
  type: 'UPDATE_TIME_MINUTES';
  value: string;
  setWorkoutPart: (workoutPart: WorkoutPart) => void;
}
interface UpdateTime {
  type: 'UPDATE_TIME';
  setWorkoutPart: (workoutPart: WorkoutPart) => void;
}
interface UpdatePowerWatt {
  type: 'UPDATE_POWER_WATT';
  value: string;
  ftp: number;
  setWorkoutPart: (workoutPart: WorkoutPart) => void;
}
interface UpdatePowerPercent {
  type: 'UPDATE_POWER_PERCENT';
  value: string;
  ftp: number;
  setWorkoutPart: (workoutPart: WorkoutPart) => void;
}

type DataAction =
  | UpdateTime
  | UpdateTimeSeconds
  | UpdateTimeMinutes
  | UpdatePowerWatt
  | UpdatePowerPercent;

interface Props {
  workoutPart: WorkoutPart;
  setWorkoutPart: (workoutPart: WorkoutPart) => void;
  removeWorkoutPart: () => void;
  duplicateWorkoutPart: () => void;
  ftp: number;
}
export const templateColumns = '1fr 4fr 4fr 1fr 5fr 5fr 1fr 1fr 1fr';

const calculateNewDuration = (minutesInput: string, secondsInput: string) => {
  const minutesAsSeconds = parseInputAsInt(minutesInput) * 60;
  const secondsAsSeconds = parseInputAsInt(secondsInput);

  const duration = minutesAsSeconds + secondsAsSeconds;
  if (duration < 0) {
    return { duration: 0, seconds: '0', minutes: '0' };
  }

  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);
  return { duration, seconds, minutes };
};

const ftpPercentFromWatt = (watt: number, ftp: number) =>
  Math.floor((watt / ftp) * 1000) / 10;

const wattFromFtpPercent = (ftpPercent: number, ftp: number) =>
  Math.floor((ftpPercent * ftp) / 100);

const parseWattInput = (input: string) => {
  const parsed = parseFloat(input);

  if (isNaN(parsed)) return null;

  return Math.floor(parsed);
};

const parseFtpPercentInput = (input: string) => {
  const parsed = parseFloat(input);

  if (isNaN(parsed)) return null;

  return Math.floor(parsed * 10) / 10;
};

export const WorkoutIntervalInput = ({
  setWorkoutPart,
  removeWorkoutPart,
  duplicateWorkoutPart,
  workoutPart,
  ftp,
}: Props) => {
  const updateWorkout = (
    data: Data,
    setWorkoutPart: (part: WorkoutPart) => void
  ) => {
    setWorkoutPart({ duration: data.seconds, targetPower: data.power });
    return data;
  };
  const reducer = (currentData: Data, action: DataAction): Data => {
    switch (action.type) {
      case 'UPDATE_TIME': {
        const { duration, seconds, minutes } = calculateNewDuration(
          currentData.minutesInput,
          currentData.secondsInput
        );

        const updatedData: Data = {
          ...currentData,
          secondsInput: '' + seconds,
          minutesInput: '' + minutes,
          seconds: duration,
        };

        return updateWorkout(updatedData, action.setWorkoutPart);
      }

      case 'UPDATE_TIME_SECONDS':
        return { ...currentData, secondsInput: action.value };

      case 'UPDATE_TIME_MINUTES':
        return { ...currentData, minutesInput: action.value };

      case 'UPDATE_POWER_WATT': {
        const parsed = parseWattInput(action.value);

        if (parsed === null) {
          return {
            ...currentData,
            powerWattInput: action.value,
            powerPercentInput: '',
            power: 0,
          };
        }

        const updatedData: Data = {
          ...currentData,
          powerWattInput: '' + parsed,
          powerPercentInput: '' + ftpPercentFromWatt(parsed, ftp),
          power: ftpPercentFromWatt(parsed, ftp),
        };

        return updateWorkout(updatedData, action.setWorkoutPart);
      }

      case 'UPDATE_POWER_PERCENT': {
        const parsed = parseFtpPercentInput(action.value);

        if (parsed === null) {
          return {
            ...currentData,
            powerWattInput: action.value,
            powerPercentInput: '',
            power: 0,
          };
        }

        const updatedData: Data = {
          ...currentData,
          powerWattInput: '' + wattFromFtpPercent(parsed, ftp),
          powerPercentInput: '' + parsed,
          power: parsed,
        };

        return updateWorkout(updatedData, action.setWorkoutPart);
      }
    }
  };

  const secondsFromProps = Math.floor(workoutPart.duration % 60);
  const minutesFromProps = Math.floor(workoutPart.duration / 60);
  const { duration: durationFromProps } = calculateNewDuration(
    '' + minutesFromProps,
    '' + secondsFromProps
  );
  const ftpPercentFromProps = workoutPart.targetPower;
  const wattFromProps = wattFromFtpPercent(ftpPercentFromProps, ftp);

  const memoizedReducer = React.useCallback(reducer, [ftp]);
  const [data, dispatchDataUpdate] = React.useReducer(memoizedReducer, {
    seconds: durationFromProps,
    secondsInput: '' + secondsFromProps,
    minutesInput: '' + minutesFromProps,
    power: ftpPercentFromProps,
    powerPercentInput: '' + ftpPercentFromProps,
    powerWattInput: '' + wattFromProps,
  });

  const durationIsInvalid = false;
  const powerIsInvalid = data.power <= 0;

  return (
    <Grid templateColumns={templateColumns} gap="1" marginY="1">
      <Center>
        <Icon as={List} />
      </Center>
      <FormControl isInvalid={durationIsInvalid}>
        <InputGroup>
          <Input
            placeholder="minutes"
            type="number"
            value={data.minutesInput}
            onChange={(e) =>
              dispatchDataUpdate({
                type: 'UPDATE_TIME_MINUTES',
                value: e.target.value,
                setWorkoutPart,
              })
            }
            onBlur={() =>
              dispatchDataUpdate({
                type: 'UPDATE_TIME',
                setWorkoutPart,
              })
            }
          />
          <InputRightAddon children="m" />
        </InputGroup>
      </FormControl>
      <FormControl isInvalid={durationIsInvalid}>
        <InputGroup>
          <Input
            placeholder="seconds"
            type="number"
            value={data.secondsInput}
            onChange={(e) => {
              dispatchDataUpdate({
                type: 'UPDATE_TIME_SECONDS',
                value: e.target.value,
                setWorkoutPart,
              });
            }}
            onBlur={() =>
              dispatchDataUpdate({
                type: 'UPDATE_TIME',
                setWorkoutPart,
              })
            }
          />
          <InputRightAddon children="s" />
        </InputGroup>
      </FormControl>
      <Center>
        <Text fontSize="xl" fontWeight="bold">
          @
        </Text>
      </Center>
      <FormControl isInvalid={powerIsInvalid}>
        <InputGroup>
          <Input
            placeholder="power"
            type="number"
            value={data.powerWattInput}
            onChange={(e) => {
              dispatchDataUpdate({
                type: 'UPDATE_POWER_WATT',
                value: e.target.value,
                ftp,
                setWorkoutPart,
              });
            }}
          />
          <InputRightAddon children="W" />
        </InputGroup>
      </FormControl>
      <FormControl isInvalid={powerIsInvalid}>
        <InputGroup>
          <Input
            placeholder="%FTP"
            type="number"
            value={data.powerPercentInput}
            onChange={(e) => {
              dispatchDataUpdate({
                type: 'UPDATE_POWER_PERCENT',
                value: e.target.value,
                ftp,
                setWorkoutPart,
              });
            }}
          />
          <InputRightAddon children="%" />
        </InputGroup>
      </FormControl>
      <Tooltip label="Zone">
        <Center>{findZone(data.power)}</Center>
      </Tooltip>
      <Tooltip label="Duplicate" placement="left">
        <Center>
          <IconButton
            aria-label="Duplicate interval"
            variant="ghost"
            onClick={duplicateWorkoutPart}
            icon={<Icon as={Files} />}
          />
        </Center>
      </Tooltip>
      <Tooltip label="Remove" placement="right">
        <Center>
          <IconButton
            aria-label="Remove interval"
            variant="ghost"
            onClick={removeWorkoutPart}
            icon={<Icon as={X} />}
          />
        </Center>
      </Tooltip>
    </Grid>
  );
};
