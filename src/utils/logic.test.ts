import test from 'node:test';
import assert from 'node:assert/strict';
import { generateRandomKey, signMd5 } from './crypto.ts';
import { calculateWingoPeriod, parseDrawNumber, calculateBetUnits } from './wingo.ts';
import { STRATEGIES } from './strategies.ts';

test('generateRandomKey returns 32 characters matching pattern', () => {
  const key = generateRandomKey();
  assert.equal(key.length, 32);
  assert.equal(key[12], '4');
});

test('signMd5 sorts keys and outputs uppercase 32-char hex md5', () => {
  const payload = {
    random: '9078efc98754430e92e51da59eb2563c',
    language: 0,
    typeId: 30,
    signature: 'TO_BE_REMOVED',
    timestamp: 123456789,
  };
  const signature = signMd5(payload);
  assert.equal(signature.length, 32);
  assert.equal(signature, signature.toUpperCase());
});

test('calculateWingoPeriod computes correct period structure and countdown', () => {
  const date = new Date(1776000000000);
  const period = calculateWingoPeriod(date);
  assert.match(period.periodNumber, /^\d{13,}$/);
  assert.ok(period.remainingSeconds >= 0 && period.remainingSeconds <= 30);
  assert.match(period.formattedCountdown, /^00:\d{2}$/);
});

test('parseDrawNumber classifies 0-4 as small and 5-9 as big', () => {
  assert.equal(parseDrawNumber(0).type, 'small');
  assert.equal(parseDrawNumber(4).type, 'small');
  assert.equal(parseDrawNumber(5).type, 'big');
  assert.equal(parseDrawNumber(9).type, 'big');
  assert.equal(parseDrawNumber(1).colour, 'green');
  assert.equal(parseDrawNumber(2).colour, 'red');
});

test('calculateBetUnits breaks down amount accurately', () => {
  const small = calculateBetUnits(1000);
  assert.equal(small.baseAmount, 10);
  assert.equal(small.betCount, 100);

  const large = calculateBetUnits(20000);
  assert.equal(large.baseAmount, 100);
  assert.equal(large.betCount, 200);
});

test('Custom Sequence strategy executes user-defined sequence accurately', () => {
  const customStrat = STRATEGIES.find((s) => s.id === 'custom')!;
  assert.ok(customStrat);

  const userPattern: ('big' | 'small')[] = ['big', 'big', 'small', 'big', 'small'];

  const step1 = customStrat.getNextBet({ stepCounter: 0, lossIndex: 0, recentDraws: [], customSequence: userPattern });
  assert.equal(step1.target, 'big');
  assert.equal(step1.selectType, 13);
  assert.equal(step1.nextStepCounter, 1);

  const step2 = customStrat.getNextBet({ stepCounter: 1, lossIndex: 0, recentDraws: [], customSequence: userPattern });
  assert.equal(step2.target, 'big');
  assert.equal(step2.selectType, 13);
  assert.equal(step2.nextStepCounter, 2);

  const step3 = customStrat.getNextBet({ stepCounter: 2, lossIndex: 0, recentDraws: [], customSequence: userPattern });
  assert.equal(step3.target, 'small');
  assert.equal(step3.selectType, 14);
  assert.equal(step3.nextStepCounter, 3);

  const step5 = customStrat.getNextBet({ stepCounter: 4, lossIndex: 0, recentDraws: [], customSequence: userPattern });
  assert.equal(step5.target, 'small');
  assert.equal(step5.nextStepCounter, 0); // loops back to start
});

test('Strategy 6 (BSBB) advances correctly across 4 steps', () => {
  const bsbb = STRATEGIES.find((s) => s.id === '6')!;
  assert.ok(bsbb);

  const step1 = bsbb.getNextBet({ stepCounter: 0, lossIndex: 0, recentDraws: [] });
  assert.equal(step1.target, 'big');
  assert.equal(step1.selectType, 13);
  assert.equal(step1.nextStepCounter, 1);
});
