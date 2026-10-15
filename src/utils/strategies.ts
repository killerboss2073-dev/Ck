import type { DrawResult } from './wingo.ts';

export interface StrategyDefinition {
  id: string;
  name: string;
  burmeseName: string;
  description: string;
  patternType: 'custom_sequence' | 'fixed_sequence' | 'adaptive_trend' | 'indicator_wait';
  sequence?: ('big' | 'small')[];
  totalSteps?: number;
  getNextBet: (context: StrategyContext) => StrategyDecision;
}

export interface StrategyContext {
  stepCounter: number;
  lossIndex: number;
  recentDraws: DrawResult[];
  lastBetResult?: 'win' | 'loss' | null;
  lastDraw?: DrawResult;
  customSequence?: ('big' | 'small')[];
}

export interface StrategyDecision {
  action: 'bet' | 'wait';
  target?: 'big' | 'small';
  selectType?: 13 | 14; // 13 = Big, 14 = Small
  nextStepCounter: number;
  reason: string;
}

export const STRATEGIES: StrategyDefinition[] = [
  {
    id: 'custom',
    name: 'Custom Sequence (ကိုယ်ပိုင် စိတ်ကြိုက်ပုံစံ)',
    burmeseName: 'စိတ်ကြိုက် Sequence ရေးဆွဲထိုးစနစ်',
    description: 'မိမိစိတ်ကြိုက် ရေးဆွဲထားသော Big/Small အစီအစဉ်အတိုင်း အဆင့်လိုက် စနစ်တကျ ထိုးခြင်း',
    patternType: 'custom_sequence',
    getNextBet: (ctx) => {
      const seq: ('big' | 'small')[] = ctx.customSequence && ctx.customSequence.length > 0 ? ctx.customSequence : ['big', 'small'];
      const currentStep = ctx.stepCounter % seq.length;
      const target: 'big' | 'small' = seq[currentStep];
      const selectType: 13 | 14 = target === 'big' ? 13 : 14;
      return {
        action: 'bet',
        target,
        selectType,
        nextStepCounter: (currentStep + 1) % seq.length,
        reason: `Custom Step ${currentStep + 1}/${seq.length} -> ${target.toUpperCase()} (${selectType})`,
      };
    },
  },
  {
    id: '6',
    name: 'B, S, B, B Bot',
    burmeseName: 'B, S, B, B စတိုင်လ် ဘော့တ်',
    description: '၄ ဆင့် ပတ်လည်စနစ်: Big -> Small -> Big -> Big အလှည့်ကျ စနစ်တကျ ပြေးဆွဲခြင်း',
    patternType: 'fixed_sequence',
    sequence: ['big', 'small', 'big', 'big'],
    totalSteps: 4,
    getNextBet: (ctx) => {
      const pattern: ('big' | 'small')[] = ['big', 'small', 'big', 'big'];
      const currentStep = ctx.stepCounter % 4; // 0, 1, 2, 3
      const target = pattern[currentStep];
      return {
        action: 'bet',
        target,
        selectType: target === 'big' ? 13 : 14,
        nextStepCounter: (currentStep + 1) % 4,
        reason: `BSBB Cycle Step ${currentStep + 1}/4 -> ${target.toUpperCase()}`,
      };
    },
  },
  {
    id: '7',
    name: 'S, B, B, S Bot',
    burmeseName: 'S, B, B, S စတိုင်လ် ဘော့တ်',
    description: '၄ ဆင့် ပတ်လည်စနစ်: Small -> Big -> Big -> Small အလှည့်ကျ စနစ်တကျ ပြေးဆွဲခြင်း',
    patternType: 'fixed_sequence',
    sequence: ['small', 'big', 'big', 'small'],
    totalSteps: 4,
    getNextBet: (ctx) => {
      const pattern: ('big' | 'small')[] = ['small', 'big', 'big', 'small'];
      const currentStep = ctx.stepCounter % 4;
      const target = pattern[currentStep];
      return {
        action: 'bet',
        target,
        selectType: target === 'big' ? 13 : 14,
        nextStepCounter: (currentStep + 1) % 4,
        reason: `SBBS Cycle Step ${currentStep + 1}/4 -> ${target.toUpperCase()}`,
      };
    },
  },
  {
    id: '2',
    name: 'Three Follow Bot',
    burmeseName: 'သုံးခါလိုက် ဘော့တ် (3B - 3S)',
    description: 'Big ၃ ကြိမ် ဆက်ထိုးပြီး Small ၃ ကြိမ် ဆက်ထိုးသော စနစ် (B -> B -> B -> S -> S -> S)',
    patternType: 'fixed_sequence',
    sequence: ['big', 'big', 'big', 'small', 'small', 'small'],
    totalSteps: 6,
    getNextBet: (ctx) => {
      const step = (ctx.stepCounter % 6) + 1; // 1 to 6
      const target: 'big' | 'small' = step <= 3 ? 'big' : 'small';
      const selectType = target === 'big' ? 13 : 14;
      return {
        action: 'bet',
        target,
        selectType,
        nextStepCounter: step === 6 ? 0 : step,
        reason: `Step ${step}/6 of Three Follow sequence (${target.toUpperCase()})`,
      };
    },
  },
  {
    id: '9',
    name: 'S, B Alternate Bot',
    burmeseName: 'S, B အလှည့်ကျ ဘော့တ်',
    description: '၂ ဆင့် အလှည့်ကျစနစ်: Small -> Big တစ်လှည့်စီ မနားတမ်း ထိုးသော စနစ်',
    patternType: 'fixed_sequence',
    sequence: ['small', 'big'],
    totalSteps: 2,
    getNextBet: (ctx) => {
      const pattern: ('big' | 'small')[] = ['small', 'big'];
      const currentStep = ctx.stepCounter % 2;
      const target = pattern[currentStep];
      return {
        action: 'bet',
        target,
        selectType: target === 'big' ? 13 : 14,
        nextStepCounter: (currentStep + 1) % 2,
        reason: `SB Alternate Step ${currentStep + 1}/2 -> ${target.toUpperCase()}`,
      };
    },
  },
  {
    id: '16',
    name: 'B,S,B,B,S,S,B,S,S (9-Step)',
    burmeseName: '၉ ဆင့် အထူး ကွန်ဘို ဘော့တ်',
    description: 'အဆင့် ၉ ဆင့် ရှည်လျားသော အထူးပတ်လည် ပုံစံ (B, S, B, B, S, S, B, S, S)',
    patternType: 'fixed_sequence',
    sequence: ['big', 'small', 'big', 'big', 'small', 'small', 'big', 'small', 'small'],
    totalSteps: 9,
    getNextBet: (ctx) => {
      const pattern: ('big' | 'small')[] = [
        'big', 'small', 'big', 'big', 'small', 'small', 'big', 'small', 'small',
      ];
      const currentStep = ctx.stepCounter % 9;
      const target = pattern[currentStep];
      return {
        action: 'bet',
        target,
        selectType: target === 'big' ? 13 : 14,
        nextStepCounter: (currentStep + 1) % 9,
        reason: `9-Step Combo Step ${currentStep + 1}/9 -> ${target.toUpperCase()}`,
      };
    },
  },
  {
    id: '1',
    name: 'Sniper Wait Bot',
    burmeseName: 'စနိုက်ပါ စောင့်ဆိုင်း ဘော့တ်',
    description: 'စနစ်တကျ အခြေအနေစောင့်ကြည့်ပြီး Big/Small အလှည့်ကျ ကောင်တာထိုးသော နည်းဗျူဟာ (Sniper Counter Entry)',
    patternType: 'indicator_wait',
    getNextBet: (ctx) => {
      if (!ctx.lastDraw) {
        return { action: 'wait', nextStepCounter: ctx.stepCounter, reason: 'Wait for draw result' };
      }
      const lastType = ctx.lastDraw.type;
      if (lastType === 'big') {
        return {
          action: 'bet',
          target: 'small',
          selectType: 14,
          nextStepCounter: ctx.stepCounter + 1,
          reason: 'Counter Big with Small after pattern signal',
        };
      } else {
        return {
          action: 'bet',
          target: 'big',
          selectType: 13,
          nextStepCounter: ctx.stepCounter + 1,
          reason: 'Counter Small with Big after pattern signal',
        };
      }
    },
  },
  {
    id: '3',
    name: 'Sniper APS Bot',
    burmeseName: 'စနိုက်ပါ အဆင့်မြင့် APS ဘော့တ်',
    description: 'အနိုင်ရလဒ်စီးကြောင်း (Trend Streak) ကို တွက်ချက်ကာ အားသာသည့်ဘက်သို့ ပစ်မှတ်ထားထိုးသော နည်းဗျူဟာ',
    patternType: 'adaptive_trend',
    getNextBet: (ctx) => {
      const history = ctx.recentDraws.slice(0, 5);
      if (history.length < 2) {
        return { action: 'bet', target: 'big', selectType: 13, nextStepCounter: ctx.stepCounter + 1, reason: 'Default start with Big' };
      }
      const bigCount = history.filter((d) => d.type === 'big').length;
      const target = bigCount >= 3 ? 'big' : 'small';
      return {
        action: 'bet',
        target,
        selectType: target === 'big' ? 13 : 14,
        nextStepCounter: ctx.stepCounter + 1,
        reason: `APS Streak Analysis: ${bigCount}/5 recent were Big -> Riding trend`,
      };
    },
  },
  {
    id: '4',
    name: 'AI Ppe net Bot',
    burmeseName: 'AI ပတ်လည် ပိုက်ကွန် ဘော့တ်',
    description: 'သမိုင်းကြောင်း ၁၀ ကြိမ်မှ ဖြစ်နိုင်ခြေအချိုးနှင့် ကိန်းဂဏန်း (Parity balance) ကို ချိန်ညှိကာ ခန့်မှန်းသော စနစ်',
    patternType: 'adaptive_trend',
    getNextBet: (ctx) => {
      const history = ctx.recentDraws.slice(0, 10);
      const smallCount = history.filter((d) => d.type === 'small').length;
      const target = smallCount < 5 ? 'small' : 'big';
      return {
        action: 'bet',
        target,
        selectType: target === 'big' ? 13 : 14,
        nextStepCounter: ctx.stepCounter + 1,
        reason: `AI Equilibrium Model: Small ratio ${smallCount}/10 -> Targeting ${target.toUpperCase()}`,
      };
    },
  },
  {
    id: '5',
    name: 'Sniper wwa Bot',
    burmeseName: 'စနိုက်ပါ WWA ဘော့တ်',
    description: 'Wait-Wait-Action ကာလသတ်မှတ်ချက်ဖြင့် အချိန်မှန် အတိအကျ ဝင်ထိုးသော နည်းဗျူဟာ',
    patternType: 'indicator_wait',
    getNextBet: (ctx) => {
      const step = ctx.stepCounter % 3;
      if (step === 0 || step === 1) {
        return {
          action: 'wait',
          nextStepCounter: step + 1,
          reason: `WWA cooldown cycle (Phase ${step + 1}/3) - Observing`,
        };
      }
      const target = ctx.lastDraw?.type === 'big' ? 'small' : 'big';
      return {
        action: 'bet',
        target,
        selectType: target === 'big' ? 13 : 14,
        nextStepCounter: 0,
        reason: `WWA Strike Phase: Bet opposite of last draw (${target.toUpperCase()})`,
      };
    },
  },
];
