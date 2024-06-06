const memoizedPowerSpeed: Record<number, Record<number, number>> = {};

export const getPowerToSpeedMap = (
  weight: number
): ((power: number) => number) => {
  let powerSpeed = memoizedPowerSpeed[weight];

  if (powerSpeed !== undefined) {
    return (power: number) => (power > 14000 ? 40.0 : powerSpeed[power]);
  }

  const newPowerSpeed: Record<number, number> = {};
  for (let i = 0; i < 40000; i++) {
    const speedMs = i / 1000;
    const totalWeight = weight + 8; // person + bike
    const crr = 0.00366;
    const airDensity = 1.293;
    const cda = 0.32;

    const rollingResistance = totalWeight * crr * 9.8067 * speedMs;

    const dragResistance = Math.pow(speedMs, 3) * 0.5 * cda * airDensity;

    const totalPower = Math.round(
      ((rollingResistance + dragResistance) * 100) / 95
    );

    newPowerSpeed[totalPower] = speedMs;
  }
  memoizedPowerSpeed[weight] = newPowerSpeed;

  return (power: number) => (power > 1400 ? 40.0 : newPowerSpeed[power]);
};
