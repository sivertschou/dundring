export const getPowerToSpeedMap = (weight: number) => {
  const powerSpeed: Record<number, number> = {};
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

    powerSpeed[totalPower] = speedMs;
  }
  return powerSpeed;
};
