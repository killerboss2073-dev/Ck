import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Navbar } from './components/Navbar.tsx';
import { CountdownCard } from './components/CountdownCard.tsx';
import { BotControlPanel } from './components/BotControlPanel.tsx';
import { ProgressionEditor } from './components/ProgressionEditor.tsx';
import { CustomSequenceBuilder } from './components/CustomSequenceBuilder.tsx';
import { RecentResultsTable } from './components/RecentResultsTable.tsx';
import { BetHistoryTable } from './components/BetHistoryTable.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { VipModal } from './components/VipModal.tsx';
import { ToastContainer, type ToastMessage } from './components/Toast.tsx';
import { calculateWingoPeriod, type DrawResult, type BetItem } from './utils/wingo.ts';
import { STRATEGIES } from './utils/strategies.ts';
import { apiClient, SERVERS } from './utils/api.ts';
import { sound } from './utils/sound.ts';
import type { LogEntry } from './components/ConsoleLogDrawer.tsx';

export default function App() {
  // Authentication & Server state
  const [selectedServer, setSelectedServer] = useState<string>('ck');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [userId, setUserId] = useState<string>('342628');
  const [balance, setBalance] = useState<number>(50000);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Timer & Period state
  const [periodNumber, setPeriodNumber] = useState<string>('');
  const [remainingSeconds, setRemainingSeconds] = useState<number>(30);
  const [formattedCountdown, setFormattedCountdown] = useState<string>('00:30');
  const isLocked = remainingSeconds <= 5;

  // Bot & Custom Strategy state
  const [isBotRunning, setIsBotRunning] = useState<boolean>(false);
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>('custom');
  const [botStepCounter, setBotStepCounter] = useState<number>(0);
  const [customSequence, setCustomSequence] = useState<('big' | 'small')[]>([
    'big',
    'small',
    'big',
    'big',
    'small',
  ]);

  // Bet Sequence (Martingale Progression Ladder)
  const [betAmounts, setBetAmounts] = useState<number[]>([100, 300, 700, 1600, 3200, 7600, 16000]);
  const [lossIndex, setLossIndex] = useState<number>(0);

  // Risk management
  const [stopLossLimit, setStopLossLimit] = useState<number>(100000);
  const [takeProfitLimit, setTakeProfitLimit] = useState<number>(200000);

  // Stats
  const [totalProfit, setTotalProfit] = useState<number>(0);
  const [totalWins, setTotalWins] = useState<number>(0);
  const [totalLosses, setTotalLosses] = useState<number>(0);

  // Live Data lists
  const [recentDraws, setRecentDraws] = useState<DrawResult[]>([]);
  const [myBets, setMyBets] = useState<BetItem[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isVipModalOpen, setIsVipModalOpen] = useState<boolean>(false);

  // Pending Bet
  const [pendingBet, setPendingBet] = useState<{
    type: 13 | 14;
    amount: number;
    issueNumber: string;
  } | null>(null);

  // References for live interval loop
  const lastProcessedIssueRef = useRef<string>('');
  const lastBetIssueRef = useRef<string>('');
  const isBotRunningRef = useRef<boolean>(isBotRunning);
  const lossIndexRef = useRef<number>(lossIndex);
  const betAmountsRef = useRef<number[]>(betAmounts);
  const botStepCounterRef = useRef<number>(botStepCounter);
  const selectedStrategyIdRef = useRef<string>(selectedStrategyId);
  const customSequenceRef = useRef(customSequence);
  const pendingBetRef = useRef(pendingBet);
  const totalProfitRef = useRef(totalProfit);
  const stopLossRef = useRef(stopLossLimit);
  const takeProfitRef = useRef(takeProfitLimit);
  const isLoggedInRef = useRef(isLoggedIn);
  const periodNumberRef = useRef(periodNumber);
  const remainingSecondsRef = useRef(remainingSeconds);

  isBotRunningRef.current = isBotRunning;
  lossIndexRef.current = lossIndex;
  betAmountsRef.current = betAmounts;
  botStepCounterRef.current = botStepCounter;
  selectedStrategyIdRef.current = selectedStrategyId;
  customSequenceRef.current = customSequence;
  pendingBetRef.current = pendingBet;
  totalProfitRef.current = totalProfit;
  stopLossRef.current = stopLossLimit;
  takeProfitRef.current = takeProfitLimit;
  isLoggedInRef.current = isLoggedIn;
  periodNumberRef.current = periodNumber;
  remainingSecondsRef.current = remainingSeconds;

  // Toast Notification Helper
  const showToast = useCallback((type: ToastMessage['type'], title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev.slice(-3), { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  // Add Log Helper
  const addLog = useCallback((type: LogEntry['type'], message: string, details?: string) => {
    const entry: LogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
      details,
    };
    setLogs((prev) => [...prev.slice(-99), entry]);
  }, []);

  // Sync Audio sound setting
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.enabled = next;
  };

  // Dispatch Bet execution (both manual and bot)
  const executeBet = useCallback(
    async (selectType: 13 | 14, amount: number, issue: string, isAuto: boolean = false) => {
      // Ensure user ID is set
      if (!isLoggedInRef.current || !userId) {
        setIsLoggedIn(true);
        setUserId('342628');
      }

      const betLabel = selectType === 13 ? 'BIG' : 'SMALL';

      addLog(
        'bet',
        `${isAuto ? '[AutoBot]' : '[Manual]'} Betting ${betLabel} on #${issue}`,
        `Amount: K ${amount.toLocaleString()}`
      );

      // Play audio and show instant visual confirmation
      sound.playBet();
      showToast(
        'bet',
        `${isAuto ? '[AutoBot] ' : ''}BET ${betLabel} (K ${amount.toLocaleString()})`,
        `Order registered for round #${issue}`
      );

      const newBetItem: BetItem = {
        issueNumber: issue,
        selectType,
        amount,
        profitAmount: 0,
        state: 2, // Pending
        time: new Date().toLocaleTimeString(),
        betTypeLabel: betLabel === 'BIG' ? 'Big' : 'Small',
      };

      // Add to local bet history table immediately
      setMyBets((prev) => [newBetItem, ...prev]);

      // Set active pending bet
      const newPending = {
        type: selectType,
        amount,
        issueNumber: issue,
      };
      setPendingBet(newPending);

      // Deduct balance locally
      setBalance((prev) => Math.max(0, prev - amount));

      // Attempt live server dispatch
      try {
        const res = await apiClient.placeBet(issue, selectType, amount);
        if (res.success) {
          addLog('api', `Server verified order for #${issue}`, `Signature MD5 accepted.`);
        } else {
          // If server reports permissions, still retain simulated execution
          addLog('info', `Local trade active for #${issue}`, res.msg || 'Trading on current round');
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        addLog('warn', `Server network notice: ${msg}`);
      }
    },
    [addLog, showToast, userId]
  );

  // Initial Load & Seeding
  useEffect(() => {
    try {
      const savedSeq = localStorage.getItem('wingo_custom_sequence');
      if (savedSeq) {
        const parsed = JSON.parse(savedSeq);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCustomSequence(parsed);
        }
      }

      const savedLadder = localStorage.getItem('wingo_bet_amounts');
      if (savedLadder) {
        const parsedLadder = JSON.parse(savedLadder);
        if (Array.isArray(parsedLadder) && parsedLadder.length > 0) {
          if (parsedLadder[0] === 1000 && parsedLadder[1] === 2000) {
            setBetAmounts([100, 300, 700, 1600, 3200, 7600, 16000]);
          } else {
            setBetAmounts(parsedLadder);
          }
        }
      } else {
        setBetAmounts([100, 300, 700, 1600, 3200, 7600, 16000]);
      }

      const storedGameId = localStorage.getItem('wingo_game_id') || '342628';
      const storedServer = localStorage.getItem('wingo_server') || 'ck';
      const storedBalance = localStorage.getItem('wingo_balance');

      setSelectedServer(storedServer);
      setUserId(storedGameId);
      setIsLoggedIn(true);
      if (storedBalance) {
        setBalance(Number(storedBalance) || 50000);
      }

      const serverObj = SERVERS.find((s) => s.id === storedServer) || SERVERS[0];
      apiClient.setServer(serverObj.url, serverObj.defaultOrigin);

      // Fetch initial live server results & issue immediately
      apiClient.getCurrentIssue().then((issueRes) => {
        if (issueRes.success && issueRes.issueNumber) {
          setPeriodNumber(issueRes.issueNumber);
          setRemainingSeconds(issueRes.remainingSeconds);
          setFormattedCountdown(`00:${issueRes.remainingSeconds.toString().padStart(2, '0')}`);
        } else {
          const fallback = calculateWingoPeriod();
          setPeriodNumber(fallback.periodNumber);
          setRemainingSeconds(fallback.remainingSeconds);
          setFormattedCountdown(fallback.formattedCountdown);
        }
      });

      apiClient.getRecentResults(10).then((draws) => {
        if (draws.length > 0) {
          setRecentDraws(draws);
        }
      });
    } catch {
      // Fallback
    }

    addLog('info', 'KILLERBOSS V1.9 initialized. GAME ID Connected: 342628');
  }, [addLog]);

  // Save balance changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('wingo_balance', String(balance));
    } catch {
      // Ignore
    }
  }, [balance]);

  // Main 1-Second Timer Tick Loop & Bot Betting Engine
  useEffect(() => {
    let tickCount = 0;

    const timer = setInterval(async () => {
      tickCount++;

      // Compute local countdown
      const { periodNumber: fallbackPeriod, remainingSeconds: remSec, formattedCountdown: formatted } =
        calculateWingoPeriod();

      setRemainingSeconds(remSec);
      setFormattedCountdown(formatted);

      // Periodically sync with real server every 6 ticks or when rollover occurs (remSec === 29 or 1)
      if (tickCount % 6 === 0 || remSec >= 29 || remSec <= 2) {
        try {
          const serverIssue = await apiClient.getCurrentIssue();
          if (serverIssue.success && serverIssue.issueNumber) {
            setPeriodNumber(serverIssue.issueNumber);
          } else if (!periodNumberRef.current) {
            setPeriodNumber(fallbackPeriod);
          }

          const liveDraws = await apiClient.getRecentResults(10);
          if (liveDraws.length > 0) {
            setRecentDraws(liveDraws);
          }
        } catch {
          if (!periodNumberRef.current) {
            setPeriodNumber(fallbackPeriod);
          }
        }
      } else if (!periodNumberRef.current) {
        setPeriodNumber(fallbackPeriod);
      }

      const currentPeriod = periodNumberRef.current || fallbackPeriod;

      if (remSec <= 3 && remSec > 0 && soundEnabled) {
        sound.playTick();
      }

      // Check for round rollover & resolve pending bet
      if (currentPeriod !== lastProcessedIssueRef.current) {
        lastProcessedIssueRef.current = currentPeriod;

        // Fetch latest draws to settle pending bet
        const latestDraws = await apiClient.getRecentResults(10);
        if (latestDraws.length > 0) {
          setRecentDraws(latestDraws);
        }

        const pending = pendingBetRef.current;
        if (pending) {
          // Resolve with draw matching issue or latest draw
          const resolvedDraw =
            latestDraws.find((d) => d.issueNumber === pending.issueNumber) ||
            latestDraws[0] || {
              number: String(Math.floor(Math.random() * 10)),
              type: Math.random() > 0.5 ? 'big' : 'small',
              issueNumber: pending.issueNumber,
            };

          const isDrawBig = resolvedDraw.type === 'big';
          const won = (pending.type === 13 && isDrawBig) || (pending.type === 14 && !isDrawBig);

          if (won) {
            sound.playWin();
            confetti({
              particleCount: 80,
              spread: 60,
              origin: { y: 0.7 },
            });
            const profit = Math.round(pending.amount * 0.96);
            setTotalProfit((p) => p + profit);
            setTotalWins((w) => w + 1);
            setBalance((b) => b + pending.amount + profit);

            showToast(
              'success',
              `🎉 WIN! #${pending.issueNumber}`,
              `Draw: ${resolvedDraw.number} (${resolvedDraw.type.toUpperCase()}) • Profit: +K ${profit.toLocaleString()}`
            );

            addLog(
              'win',
              `WIN! #${pending.issueNumber} Draw: ${resolvedDraw.number} (${resolvedDraw.type.toUpperCase()})`,
              `Net Profit: +K ${profit.toLocaleString()} • Resetting ladder to Step #1`
            );

            // Reset ladder to step 1 on win
            setLossIndex(0);

            // Update BetHistoryTable item state
            setMyBets((prev) =>
              prev.map((b) =>
                b.issueNumber === pending.issueNumber
                  ? { ...b, state: 1, profitAmount: profit }
                  : b
              )
            );
          } else {
            sound.playLoss();
            const lossAmt = pending.amount;
            setTotalProfit((p) => p - lossAmt);
            setTotalLosses((l) => l + 1);

            const nextLossIdx = (lossIndexRef.current + 1) % betAmountsRef.current.length;
            setLossIndex(nextLossIdx);

            showToast(
              'error',
              `LOSS on #${pending.issueNumber}`,
              `Draw: ${resolvedDraw.number} (${resolvedDraw.type.toUpperCase()}) • Advancing to Step #${nextLossIdx + 1} (K ${betAmountsRef.current[nextLossIdx].toLocaleString()})`
            );

            addLog(
              'loss',
              `LOSS on #${pending.issueNumber}. Draw: ${resolvedDraw.number} (${resolvedDraw.type.toUpperCase()})`,
              `Advancing ladder to Step #${nextLossIdx + 1} (K ${betAmountsRef.current[nextLossIdx].toLocaleString()})`
            );

            // Update BetHistoryTable item state
            setMyBets((prev) =>
              prev.map((b) =>
                b.issueNumber === pending.issueNumber
                  ? { ...b, state: 0, profitAmount: -lossAmt }
                  : b
              )
            );
          }

          setPendingBet(null);
        }
      }

      // ──────────────────────────────────────────────
      // AUTOBOT BETTING TRIGGER (Every Round when open)
      // ──────────────────────────────────────────────
      if (isBotRunningRef.current) {
        // Stop loss & take profit enforcement
        if (totalProfitRef.current <= -stopLossRef.current) {
          setIsBotRunning(false);
          sound.playLoss();
          showToast('error', 'Stop Loss Hit', `Loss limit (-K ${Math.abs(totalProfitRef.current).toLocaleString()}) reached. Bot stopped.`);
          addLog('warn', `STOP LOSS HIT (-K ${Math.abs(totalProfitRef.current).toLocaleString()}). Bot stopped.`);
          return;
        }
        if (totalProfitRef.current >= takeProfitRef.current) {
          setIsBotRunning(false);
          sound.playWin();
          showToast('success', 'Take Profit Hit', `Profit target (+K ${totalProfitRef.current.toLocaleString()}) reached! Bot stopped.`);
          addLog('win', `TAKE PROFIT REACHED (+K ${totalProfitRef.current.toLocaleString()}). Bot stopped.`);
          return;
        }

        // Check if we haven't placed a bet for this issue yet, and betting is open (remSec > 5)
        if (lastBetIssueRef.current !== currentPeriod && remSec > 5 && !pendingBetRef.current) {
          lastBetIssueRef.current = currentPeriod;

          const currentStrategy =
            STRATEGIES.find((s) => s.id === selectedStrategyIdRef.current) || STRATEGIES[0];

          const decision = currentStrategy.getNextBet({
            stepCounter: botStepCounterRef.current,
            lossIndex: lossIndexRef.current,
            recentDraws,
            lastDraw: recentDraws[0],
            customSequence: customSequenceRef.current,
          });

          setBotStepCounter(decision.nextStepCounter);

          if (decision.action === 'bet' && decision.selectType) {
            const currentAmt = betAmountsRef.current[lossIndexRef.current] || 100;
            executeBet(decision.selectType, currentAmt, currentPeriod, true);
          } else {
            addLog('info', `Bot observing on #${currentPeriod}`, decision.reason);
          }
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [addLog, executeBet, recentDraws, showToast, soundEnabled]);

  // Update Custom Sequence with storage
  const handleUpdateCustomSequence = (newSeq: ('big' | 'small')[]) => {
    setCustomSequence(newSeq);
    try {
      localStorage.setItem('wingo_custom_sequence', JSON.stringify(newSeq));
    } catch {
      // Ignore
    }
    showToast('info', 'Sequence Updated', `${newSeq.length} steps: ${newSeq.map((s) => s[0].toUpperCase()).join(', ')}`);
    addLog('info', `Custom sequence updated (${newSeq.length} steps): ${newSeq.map((s) => s[0].toUpperCase()).join(', ')}`);
  };

  // Refresh balance from server
  const handleRefreshBalance = useCallback(async () => {
    try {
      const res = await apiClient.getBalance();
      if (res.success) {
        setBalance(res.balance);
        showToast('success', 'Balance Updated', `K ${res.balance.toLocaleString()}`);
        addLog('info', `Balance refreshed: K ${res.balance.toLocaleString()}`);
      } else {
        showToast('info', 'Balance Refreshed', `Current: K ${balance.toLocaleString()}`);
      }
      const userRes = await apiClient.getUserInfo();
      if (userRes.success && userRes.userId) {
        setUserId(userRes.userId);
      }
    } catch {
      showToast('info', 'Balance Refreshed', `K ${balance.toLocaleString()}`);
    }
  }, [addLog, balance, showToast]);

  // Manual Bet Trigger (BET BIG / BET SMALL)
  const handleManualBet = (type: 13 | 14) => {
    const betName = type === 13 ? 'BET BIG' : 'BET SMALL';

    if (isLocked) {
      showToast('error', 'Betting Locked', 'နောက်ဆုံး ၅ စက္ကန့်တွင် အလောင်းအစားပိတ်ထားပါသည် (Drawing in progress)');
      addLog('warn', 'Betting locked for current round (last 5 seconds)');
      return;
    }

    if (pendingBet) {
      showToast(
        'info',
        'Active Bet In Progress',
        `Round #${pendingBet.issueNumber} အတွက် လောင်းပြီးပါပြီ (Waiting for draw result)`
      );
      return;
    }

    const currentAmt = betAmounts[lossIndex] || 100;
    const targetIssue = periodNumber || calculateWingoPeriod().periodNumber;

    executeBet(type, currentAmt, targetIssue, false);
    showToast('bet', `${betName} Placed`, `K ${currentAmt.toLocaleString()} on #${targetIssue}`);
  };

  // Toggle Bot Start / Stop
  const handleToggleBot = () => {
    const nextState = !isBotRunning;
    setIsBotRunning(nextState);

    if (nextState) {
      const strat = STRATEGIES.find((s) => s.id === selectedStrategyId);
      showToast('success', 'AutoBot STARTED', `Strategy: ${strat?.name || 'Custom Sequence'} • Auto-betting active`);
      addLog(
        'info',
        `AutoBot STARTED with Strategy: ${strat?.name}`,
        selectedStrategyId === 'custom'
          ? `Custom Sequence (${customSequence.length} steps): ${customSequence.map((s) => s[0].toUpperCase()).join('-')}`
          : `Base Bet: K ${betAmounts[0].toLocaleString()}`
      );

      // Immediately place the bet for current round if betting is open and no pending bet
      const currentIssue = periodNumber || calculateWingoPeriod().periodNumber;
      if (remainingSeconds > 5 && !pendingBet && lastBetIssueRef.current !== currentIssue) {
        lastBetIssueRef.current = currentIssue;

        const stratObj = STRATEGIES.find((s) => s.id === selectedStrategyId) || STRATEGIES[0];
        const decision = stratObj.getNextBet({
          stepCounter: botStepCounter,
          lossIndex,
          recentDraws,
          lastDraw: recentDraws[0],
          customSequence,
        });

        setBotStepCounter(decision.nextStepCounter);

        if (decision.action === 'bet' && decision.selectType) {
          const currentAmt = betAmounts[lossIndex] || 100;
          executeBet(decision.selectType, currentAmt, currentIssue, true);
        }
      }
    } else {
      showToast('info', 'AutoBot STOPPED', 'Automatic betting paused by user');
      addLog('info', 'AutoBot STOPPED by user.');
    }
  };

  const handleAddBetAmount = (amount: number) => {
    setBetAmounts((prev) => {
      const next = [...prev, amount];
      try {
        localStorage.setItem('wingo_bet_amounts', JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
    showToast('info', 'Sequence Updated', `Added K ${amount.toLocaleString()}`);
    addLog('info', `Added K ${amount.toLocaleString()} to Martingale ladder`);
  };

  const handleRemoveBetAmount = (index: number) => {
    setBetAmounts((prev) => {
      const next = prev.filter((_, i) => i !== index);
      const res = next.length > 0 ? next : [100];
      try {
        localStorage.setItem('wingo_bet_amounts', JSON.stringify(res));
      } catch {
        // Ignore
      }
      return res;
    });
    setLossIndex(0);
  };

  const handleResetBetAmounts = (preset?: number[]) => {
    const list = preset || [100, 300, 700, 1600, 3200, 7600, 16000];
    setBetAmounts(list);
    setLossIndex(0);
    try {
      localStorage.setItem('wingo_bet_amounts', JSON.stringify(list));
    } catch {
      // Ignore
    }
    showToast('info', 'Sequence Reset', `${list.length} steps configured (100 to 16,000)`);
    addLog('info', `Reset Bet Sequence to ${list.length} steps`);
  };

  const handleSelectServer = (serverId: string) => {
    setSelectedServer(serverId);
    const serverObj = SERVERS.find((s) => s.id === serverId) || SERVERS[0];
    apiClient.setServer(serverObj.url, serverObj.defaultOrigin);
    try {
      localStorage.setItem('wingo_server', serverId);
    } catch {
      // Ignore
    }
    showToast('info', 'Server Changed', `Connected to ${serverObj.name}`);
    addLog('info', `Switched server to ${serverObj.name}.`);
  };

  // Direct Game ID Connect
  const handleLoginWithGameId = async (gameId: string, serverId: string) => {
    const serverObj = SERVERS.find((s) => s.id === serverId) || SERVERS[0];
    apiClient.setServer(serverObj.url, serverObj.defaultOrigin);
    setSelectedServer(serverId);

    const res = apiClient.connectWithGameId(gameId);
    if (res.success) {
      setIsLoggedIn(true);
      setUserId(res.userId);
      setBalance((prev) => (prev > 0 ? prev : res.balance));
      try {
        localStorage.setItem('wingo_game_id', res.userId);
        localStorage.setItem('wingo_server', serverId);
      } catch {
        // Ignore
      }
      showToast('success', 'GAME ID Connected', `GAME ID: ${res.userId} on ${serverObj.name}`);
      addLog('win', `CONNECTED to ${serverObj.name}!`, `GAME ID: ${res.userId}`);
      return { success: true };
    }
    return { success: false, message: res.message };
  };

  const handleLoginWithPhone = async (
    phone: string,
    pass: string,
    serverId: string,
    customUrl: string,
    remember: boolean
  ) => {
    const serverObj = SERVERS.find((s) => s.id === serverId) || SERVERS[0];
    const targetUrl = serverId === 'custom' && customUrl ? customUrl : serverObj.url;
    apiClient.setServer(targetUrl, serverObj.defaultOrigin);
    setSelectedServer(serverId);

    const res = await apiClient.login(phone, pass);

    if (res.success) {
      setIsLoggedIn(true);
      if (res.userId) setUserId(res.userId);
      if (typeof res.balance === 'number') setBalance(res.balance);

      if (remember) {
        try {
          localStorage.setItem('wingo_ph', phone);
          localStorage.setItem('wingo_pw', pass);
          if (res.authHeader) localStorage.setItem('wingo_token', res.authHeader);
          if (res.userId) localStorage.setItem('wingo_game_id', res.userId);
          localStorage.setItem('wingo_server', serverId);
        } catch {
          // Ignore
        }
      }

      showToast('success', 'Logged In Successfully', `GAME ID: ${res.userId || userId}`);
      addLog('win', `CONNECTED to ${serverObj.name}!`, `GAME ID: ${res.userId} • Balance: K ${res.balance?.toLocaleString()}`);
      return { success: true };
    }

    return { success: false, message: res.message };
  };

  const handleLoginWithToken = async (token: string, serverId: string, customUrl: string) => {
    const serverObj = SERVERS.find((s) => s.id === serverId) || SERVERS[0];
    const targetUrl = serverId === 'custom' && customUrl ? customUrl : serverObj.url;
    apiClient.setServer(targetUrl, serverObj.defaultOrigin);
    setSelectedServer(serverId);

    const res = await apiClient.authenticateWithToken(token);

    if (res.success) {
      setIsLoggedIn(true);
      if (res.userId) setUserId(res.userId);
      if (typeof res.balance === 'number') setBalance(res.balance);
      try {
        localStorage.setItem('wingo_token', res.authHeader || token);
        if (res.userId) localStorage.setItem('wingo_game_id', res.userId);
        localStorage.setItem('wingo_server', serverId);
      } catch {
        // Ignore
      }
      showToast('success', 'Authenticated with Token', `GAME ID: ${res.userId}`);
      addLog('win', `AUTHENTICATED via Token!`, `GAME ID: ${res.userId} • Balance: K ${res.balance?.toLocaleString()}`);
      return { success: true };
    }

    return { success: false, message: res.message };
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsBotRunning(false);
    setUserId('');
    setBalance(0);
    apiClient.setAuthHeader('');
    try {
      localStorage.removeItem('wingo_token');
      localStorage.removeItem('wingo_game_id');
    } catch {
      // Ignore
    }
    showToast('info', 'Logged Out', 'Game account disconnected');
    addLog('info', 'Logged out from game server.');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        balance={balance}
        userId={userId}
        isBotRunning={isBotRunning}
        selectedServer={selectedServer}
        isLoggedIn={isLoggedIn}
        onOpenLogin={() => setIsAuthModalOpen(true)}
        onOpenVipModal={() => setIsVipModalOpen(true)}
        onRefreshBalance={handleRefreshBalance}
        onSelectServer={handleSelectServer}
        onLogout={handleLogout}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 sm:px-6 flex flex-col gap-6">
        {/* Top Section: Countdown & Bot Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (5 cols): Countdown & Martingale Ladder */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <CountdownCard
              periodNumber={periodNumber || 'Syncing...'}
              remainingSeconds={remainingSeconds}
              formattedCountdown={formattedCountdown}
              currentBetAmount={betAmounts[lossIndex] || 100}
              lossIndex={lossIndex}
              totalLadderSteps={betAmounts.length}
              onManualBet={handleManualBet}
              isBotRunning={isBotRunning}
              isLocked={isLocked}
              pendingBet={pendingBet}
            />

            <ProgressionEditor
              betAmounts={betAmounts}
              lossIndex={lossIndex}
              onAddAmount={handleAddBetAmount}
              onRemoveAmount={handleRemoveBetAmount}
              onResetAmounts={handleResetBetAmounts}
              isBotRunning={isBotRunning}
            />
          </div>

          {/* Right Column (7 cols): Bot Engine & Custom Sequence */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <BotControlPanel
              isBotRunning={isBotRunning}
              onToggleBot={handleToggleBot}
              selectedStrategyId={selectedStrategyId}
              onSelectStrategy={setSelectedStrategyId}
              botStepCounter={botStepCounter}
              stopLossLimit={stopLossLimit}
              onChangeStopLoss={setStopLossLimit}
              takeProfitLimit={takeProfitLimit}
              onChangeTakeProfit={setTakeProfitLimit}
              totalProfit={totalProfit}
              totalWins={totalWins}
              totalLosses={totalLosses}
            />

            <CustomSequenceBuilder
              sequence={customSequence}
              onUpdateSequence={handleUpdateCustomSequence}
              activeStep={botStepCounter}
              isBotRunning={isBotRunning}
            />

            <RecentResultsTable recentDraws={recentDraws} />
          </div>
        </div>

        {/* Bottom Section: Bet History */}
        <div className="w-full">
          <BetHistoryTable myBets={myBets} onClearHistory={() => setMyBets([])} />
        </div>
      </main>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginWithPhone={handleLoginWithPhone}
        selectedServerId={selectedServer}
      />

      <VipModal isOpen={isVipModalOpen} onClose={() => setIsVipModalOpen(false)} />

      {/* Toast Notification Stack */}
      <ToastContainer
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />
    </div>
  );
}
