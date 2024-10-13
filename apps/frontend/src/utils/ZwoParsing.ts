import { parseXml, XmlDocument, XmlElement, XmlText } from '@rgrove/parse-xml';
import { Workout, WorkoutPart } from '../types';

export const parseZwoWorkout = (
  str: string
): { workout: Workout | null; errors: Set<string> } => {
  try {
    const xmlDocument: XmlDocument = parseXml(str);
    const workoutFileElement = xmlDocument.children[0];
    if (!isXmlElement(workoutFileElement)) {
      return {
        workout: null,
        errors: new Set([`Invalid ZWO-file: Missing children-element`]),
      };
    }
    const zwoWorkout = parseWorkoutFile(workoutFileElement);
    return {
      workout: zwoWorkout.workout
        ? zwoWorkoutToDundringWorkout(zwoWorkout.workout)
        : null,
      errors: zwoWorkout.errors,
    };
  } catch (err) {
    console.error(err);
    return {
      workout: null,
      errors: new Set([`Invalid ZWO-file: ${err}`]),
    };
  }
};

type ZwoWorkout = {
  name: string;
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

const parseWorkoutFile = (
  workoutFileElement: XmlElement
): { workout: ZwoWorkout | null; errors: Set<string> } => {
  const workoutElement = findXmlElementChildWithName(
    workoutFileElement,
    'workout'
  );
  if (!workoutElement) {
    return {
      workout: null,
      errors: new Set([`Invalid ZWO-file: workout-element is missing`]),
    };
  }

  const workoutParts = new Array<ZwoWorkoutPart>();

  const workoutPartErrors = new Set<string>();
  workoutElement.children.forEach((workoutPartElement) => {
    if (!isXmlElement(workoutPartElement)) {
      return;
    }
    const parsedWorkoutPart = parseWorkoutPart(workoutPartElement);

    parsedWorkoutPart.errors.forEach((error) => workoutPartErrors.add(error));

    if (parsedWorkoutPart.workoutPart) {
      workoutParts.push(parsedWorkoutPart.workoutPart);
    }
  });
  const nameText = findXmlElementChildWithName(
    workoutFileElement,
    'name'
  )?.children?.at(0);
  const name = nameText instanceof XmlText ? nameText.text : 'ZWO workout';

  return { workout: { parts: workoutParts, name }, errors: workoutPartErrors };
};

const findXmlElementChildWithName = (
  xmlNode: XmlElement,
  targetName: string
): XmlElement | null => {
  for (const child of xmlNode.children) {
    if (isXmlElement(child) && child.name === targetName) {
      return child;
    }
  }
  return null;
};

const zwoWorkoutToDundringWorkout = (zwoWorkout: ZwoWorkout): Workout => {
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
        return [toPart(part.duration, 0)];
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
    name: zwoWorkout.name,
    parts: zwoWorkout.parts.flatMap(convertPart),
  };
};

const parseWorkoutPart = (
  workoutPartElement: XmlElement
): { workoutPart: ZwoWorkoutPart | null; errors: Set<string> } => {
  const errors = new Set<string>();

  const parseAttribute = (attribute: string, type: 'int' | 'float'): number => {
    const value = workoutPartElement.attributes[attribute];
    if (!value) {
      errors.add(
        `Attribute missing for: ${workoutPartElement.name} - ${attribute}`
      );
      return 0;
    }
    const parsedNumber =
      type === 'int' ? parseInt(value, 10) : parseFloat(value);

    if (isNaN(parsedNumber)) {
      errors.add(`Invalid number: ${workoutPartElement.name} - ${attribute}`);
      return 0;
    }
    return parsedNumber;
  };

  const parseResult = (workoutPart: ZwoWorkoutPart | null) => ({
    workoutPart,
    errors,
  });

  switch (workoutPartElement.name) {
    case 'SteadyState':
      return parseResult({
        type: 'steadystate',
        duration: parseAttribute('Duration', 'int'),
        power: parseAttribute('Power', 'float'),
      });
    case 'IntervalsT':
      return parseResult({
        type: 'intervals',
        repeat: parseAttribute('Repeat', 'int'),
        onPower: parseAttribute('OnPower', 'float'),
        offPower: parseAttribute('OffPower', 'float'),
        onDuration: parseAttribute('OnDuration', 'int'),
        offDuration: parseAttribute('OffDuration', 'int'),
      });
    case 'FreeRide':
      return parseResult({
        type: 'freeride',
        duration: parseAttribute('Duration', 'int'),
      });
    case 'Ramp':
    case 'Warmup':
      return parseResult({
        type: 'warmup',
        duration: parseAttribute('Duration', 'int'),
        powerLow: parseAttribute('PowerLow', 'float'),
        powerHigh: parseAttribute('PowerHigh', 'float'),
      });
    case 'Cooldown':
      return parseResult({
        type: 'cooldown',
        duration: parseAttribute('Duration', 'int'),
        powerLow: parseAttribute('PowerLow', 'float'),
        powerHigh: parseAttribute('PowerHigh', 'float'),
      });
    default: {
      const msg = `Unsupported event ${workoutPartElement.name}`;
      console.error(msg);
      errors.add(msg);
      return parseResult(null);
    }
  }
};

const isXmlElement = (x: any): x is XmlElement => {
  return x instanceof XmlElement;
};
