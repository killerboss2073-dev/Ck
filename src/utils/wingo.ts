export interface DrawResult {
  issueNumber: string;
  number: string;
  colour: string; // 'g' (green), 'r' (red), 'v' (violet) or combo like 'gv', 'rv'
  type: 'small' | 'big';
  timestamp?: number;
}

export interface BetItem {
  issueNumber: string;
  selectType: number; // 13 = Big, 14 = Small
  amount: number;
  profitAmount: number;
  state: number; // 1 = Win, 0 = Loss, 2 = Pending
  time?: string;
  betTypeLabel?: string;
}

/**
 * Calculates the current Wingo 30-Second period number and remaining seconds
 * Matches the Java calendar logic with UTC+5:30 / Kolkata timezone as in AutobetActivity
 */
export function calculateWingoPeriod(date: Date = new Date()): {
  periodNumber: string;
  remainingSeconds: number;
  formattedCountdown: string;
  totalPeriods: number;
} {
  // Convert to Asia/Kolkata / Myanmar time (+5:30 or server baseline)
  // Timezone offset for Asia/Kolkata is UTC + 5.5 hours (+330 minutes)
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const targetTime = new Date(utc + 3600000 * 5.5);

  const hours = targetTime.getHours();
  const minutes = targetTime.getMinutes();
  const seconds = targetTime.getSeconds();

  // 120 periods per hour (2 per minute for 30s intervals)
  const totalPeriods = hours * 120 + minutes * 2 + (seconds >= 30 ? 1 : 0) + 1;
  const remainingSeconds = 30 - (seconds % 30);

  const yyyy = targetTime.getFullYear().toString();
  const mm = (targetTime.getMonth() + 1).toString().padStart(2, '0');
  const dd = targetTime.getDate().toString().padStart(2, '0');
  const dateStr = `${yyyy}${mm}${dd}`;

  // Formatted as yyyyMMdd + (10000 + totalPeriods)
  const periodNumber = `${dateStr}${(10000 + totalPeriods).toString().padStart(5, '0')}`;
  const formattedCountdown = `00:${remainingSeconds.toString().padStart(2, '0')}`;

  return {
    periodNumber,
    remainingSeconds,
    formattedCountdown,
    totalPeriods,
  };
}

/**
 * Determines color and Big/Small classification for a lottery draw number (0-9)
 */
export function parseDrawNumber(num: number): {
  number: number;
  type: 'small' | 'big';
  colour: 'green' | 'red' | 'violet' | 'green-violet' | 'red-violet';
  colorCode: string;
} {
  const type: 'small' | 'big' = num <= 4 ? 'small' : 'big';

  let colour: 'green' | 'red' | 'violet' | 'green-violet' | 'red-violet' = 'red';
  let colorCode = '#ef4444'; // Red

  if (num === 0) {
    colour = 'red-violet';
    colorCode = '#ec4899';
  } else if (num === 5) {
    colour = 'green-violet';
    colorCode = '#8b5cf6';
  } else if ([1, 3, 7, 9].includes(num)) {
    colour = 'green';
    colorCode = '#10b981'; // Green
  } else {
    colour = 'red';
    colorCode = '#ef4444'; // Red
  }

  return {
    number: num,
    type,
    colour,
    colorCode,
  };
}

/**
 * Decomposes a total bet amount into base unit and bet count,
 * exactly reproducing Java AutobetActivity:
 * amount = amt < 10000 ? 10 : Math.pow(10, Math.floor(Math.log10(amt)) - 2)
 * betCount = amt / amount
 */
export function calculateBetUnits(totalAmt: number): { baseAmount: number; betCount: number } {
  if (totalAmt <= 0) return { baseAmount: 10, betCount: 1 };
  const baseAmount = totalAmt < 10000 ? 10 : Math.pow(10, Math.floor(Math.log10(totalAmt)) - 2);
  const betCount = Math.max(1, Math.floor(totalAmt / baseAmount));
  return { baseAmount, betCount };
}
