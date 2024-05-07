import { XmlDocument, XmlElement, parseXml } from '@rgrove/parse-xml';
import { Workout, WorkoutPart } from '../types';

type ZwoWorkout = {
  name?: string;
  parts: Array<ZwoWorkoutPart>;
};

type ZwoWorkoutPart = SteadyState | IntervalsT | FreeRide | Warmup | Cooldown;

type SteadyState = { type: 'steadystate'; duration: number; power: number };

type IntervalsT = {
  type: 'intervals';
  repeat: number;
  onDuration: number;
  offDuration: number;
  onPower: number;
  offPower: number;
};

type FreeRide = { type: 'freeride'; duration: number };

type Warmup = {
  type: 'warmup' | 'ramp';
  duration: number;
  powerLow: number;
  powerHigh: number;
};

type Cooldown = {
  type: 'cooldown';
  duration: number;
  powerLow: number;
  powerHigh: number;
};

export const zwoWorkoutToDundringWorkout = (
  zwoWorkout: ZwoWorkout
): Workout => {
  const toPart = (duration: number, power: number): WorkoutPart => {
    return {
      duration,
      targetPower: Math.round(power * 1000) / 10,
      type: 'steady',
    };
  };

  const convertPart = (part: ZwoWorkoutPart): WorkoutPart[] => {
    switch (part.type) {
      case 'steadystate':
        return [toPart(part.duration, part.power)];
      case 'freeride':
        return [toPart(part.duration, 0.5)];
      case 'cooldown':
      case 'ramp':
      case 'warmup':
        return [
          toPart(part.duration / 3, part.powerLow),
          toPart(
            part.duration / 3,
            part.powerHigh - (part.powerHigh - part.powerLow) / 2
          ),
          toPart(part.duration / 3, part.powerHigh),
        ];

      case 'intervals':
        return Array(part.repeat)
          .fill('')
          .flatMap((_) => [
            toPart(part.onDuration, part.onPower),
            toPart(part.offDuration, part.offPower),
          ]);
    }
  };

  return {
    id: '',
    name: zwoWorkout.name || 'ZWO workout',
    parts: zwoWorkout.parts.flatMap(convertPart),
  };
};

export const parse = (str: string): ZwoWorkout | null => {
  try {
    const document: XmlDocument = parseXml(str);
    if (document.children.length != 1) {
      return null;
    }
    const workoutFileElement = document.children[0];
    if (workoutFileElement instanceof XmlElement === false) {
      return null;
    }
    return parseWorkoutFile(workoutFileElement);
  } catch (error) {
    return null;
  }
};

const parseWorkoutFile = (
  workoutFileElement: XmlElement
): ZwoWorkout | null => {
  const workoutElement = workoutFileElement.children.find(
    (child) => child instanceof XmlElement && child.name === 'workout'
  );
  if (workoutElement instanceof XmlElement === false) {
    return null;
  }
  const workoutParts = workoutElement.children.flatMap((workoutPartElement) => {
    if (workoutPartElement instanceof XmlElement === false) {
      return [];
    }
    const workoutPartOrNull = parseWorkoutPart(workoutPartElement);
    return workoutPartOrNull ? [workoutPartOrNull] : [];
  });
  return { parts: workoutParts };
};

const parseWorkoutPart = (
  workoutPartElement: XmlElement
): ZwoWorkoutPart | null => {
  const attrs = workoutPartElement.attributes;
  switch (workoutPartElement.name) {
    case 'SteadyState':
      return {
        type: 'steadystate',
        duration: parseInt(attrs['Duration'], 10),
        power: parseFloat(attrs['Power']),
      };
    case 'IntervalsT':
      return {
        type: 'intervals',
        repeat: parseInt(attrs['Repeat'], 10),
        onPower: parseFloat(attrs['OnPower']),
        offPower: parseFloat(attrs['OffPower']),
        onDuration: parseInt(attrs['OnDuration'], 10),
        offDuration: parseInt(attrs['OffDuration'], 10),
      };
    case 'FreeRide':
      return {
        type: 'freeride',
        duration: parseInt(attrs['Duration'], 10),
      };
    case 'Ramp':
    case 'Warmup':
      return {
        type: 'warmup',
        duration: parseInt(attrs['Duration'], 10),
        powerLow: parseFloat(attrs['PowerLow']),
        powerHigh: parseFloat(attrs['PowerHigh']),
      };
    case 'Cooldown':
      return {
        type: 'cooldown',
        duration: parseInt(attrs['Duration'], 10),
        powerLow: parseFloat(attrs['PowerLow']),
        powerHigh: parseFloat(attrs['PowerHigh']),
      };
    default: {
      console.error('unsopported event', workoutPartElement.name);
      return null;
    }
  }
};
