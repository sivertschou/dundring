import { expect, test } from 'vitest';
import { ftpPercentFromWatt, wattFromFtpPercent } from './general';

test('Watt values passed through ftpPercentFromWatt and wattFromFtpPercent ends up with the entered Watt value', () => {
  let failures = [];
  for (let ftp = 200; ftp <= 500; ftp += 1) {
    for (let watt = 0; watt <= 1000; watt += 1) {
      const ftpPct = ftpPercentFromWatt(watt, ftp);
      const wattFromFtpPct = wattFromFtpPercent(ftpPct, ftp);
      if (wattFromFtpPct !== watt) {
        failures.push({
          watt,
          exactWattFromFtpPct: (ftpPct * ftp) / 100,
          ftpPct,
          ftp,
        });
      }
    }
  }
  expect(failures.length).toBe(0);
});
