import { test } from 'node:test';
import assert from 'node:assert';
import { predictCycle, getCurrentPhase } from './cycle-engine.js';

test('predictCycle - default parameters', () => {
  const lastPeriodStart = '2024-01-01';
  const prediction = predictCycle(lastPeriodStart);

  assert.strictEqual(prediction.lastPeriodStart, '2024-01-01');
  assert.strictEqual(prediction.nextPeriodStart, '2024-01-29');
  assert.strictEqual(prediction.nextPeriodEnd, '2024-02-03');
  assert.strictEqual(prediction.contextZoneStart, '2024-01-24');
  assert.strictEqual(prediction.contextZoneEnd, '2024-01-28');
  assert.strictEqual(prediction.ovulationDate, '2024-01-15');
  assert.strictEqual(prediction.currentPeriodEnd, '2024-01-06');
  assert.strictEqual(prediction.currentBadMoodStart, '2023-12-31');
  assert.strictEqual(prediction.currentBadMoodEnd, '2024-01-02');
});

test('predictCycle - custom parameters', () => {
  const lastPeriodStart = '2024-01-01';
  const prediction = predictCycle(lastPeriodStart, 30, 7);

  assert.strictEqual(prediction.nextPeriodStart, '2024-01-31');
  assert.strictEqual(prediction.nextPeriodEnd, '2024-02-07');
  assert.strictEqual(prediction.currentPeriodEnd, '2024-01-08');
});

test('predictCycle - month boundary (Feb to Mar, Leap Year)', () => {
  const lastPeriodStart = '2024-02-15'; // 2024 is a leap year
  const prediction = predictCycle(lastPeriodStart, 28);

  assert.strictEqual(prediction.nextPeriodStart, '2024-03-14');
});

test('predictCycle - month boundary (Feb to Mar, Non-Leap Year)', () => {
  const lastPeriodStart = '2023-02-15';
  const prediction = predictCycle(lastPeriodStart, 28);

  assert.strictEqual(prediction.nextPeriodStart, '2023-03-15');
});

test('predictCycle - end of year transition', () => {
  const lastPeriodStart = '2023-12-20';
  const prediction = predictCycle(lastPeriodStart, 28);

  assert.strictEqual(prediction.nextPeriodStart, '2024-01-17');
});

test('getCurrentPhase - Menstruation (Current Period)', () => {
  const lastPeriodStart = '2024-01-01';
  const checkDate = '2024-01-02';
  const phaseInfo = getCurrentPhase(lastPeriodStart, 28, 5, checkDate);

  assert.strictEqual(phaseInfo.phase, 'Menstruation');
  assert.strictEqual(phaseInfo.isBadMood, true);
});

test('getCurrentPhase - Menstruation (Next Predicted Period)', () => {
  const lastPeriodStart = '2024-01-01';
  const checkDate = '2024-01-29';
  const phaseInfo = getCurrentPhase(lastPeriodStart, 28, 5, checkDate);

  assert.strictEqual(phaseInfo.phase, 'Menstruation');
  assert.strictEqual(phaseInfo.isBadMood, true);
});

test('getCurrentPhase - Ovulation Window', () => {
  const lastPeriodStart = '2024-01-01';
  const checkDate = '2024-01-15'; // 29 - 14
  const phaseInfo = getCurrentPhase(lastPeriodStart, 28, 5, checkDate);

  assert.strictEqual(phaseInfo.phase, 'Ovulation Window');
});

test('getCurrentPhase - Luteal Phase (Context Zone)', () => {
  const lastPeriodStart = '2024-01-01';
  const checkDate = '2024-01-25'; // Between 24 and 28
  const phaseInfo = getCurrentPhase(lastPeriodStart, 28, 5, checkDate);

  assert.strictEqual(phaseInfo.phase, 'Luteal Phase (Context Zone)');
  assert.strictEqual(phaseInfo.isContextZone, true);
});

test('getCurrentPhase - Follicular Phase', () => {
  const lastPeriodStart = '2024-01-01';
  const checkDate = '2024-01-10';
  const phaseInfo = getCurrentPhase(lastPeriodStart, 28, 5, checkDate);

  assert.strictEqual(phaseInfo.phase, 'Follicular Phase');
  assert.strictEqual(phaseInfo.isContextZone, false);
});

test('getCurrentPhase - Bad Mood Window (before next period)', () => {
  const lastPeriodStart = '2024-01-01';
  const checkDate = '2024-01-28'; // 1 day before Jan 29
  const phaseInfo = getCurrentPhase(lastPeriodStart, 28, 5, checkDate);

  assert.strictEqual(phaseInfo.isBadMood, true);
});
