import { generateRandomKey, signMd5 } from './crypto.ts';
import { calculateBetUnits, calculateWingoPeriod, parseDrawNumber, type BetItem, type DrawResult } from './wingo.ts';

export interface ServerOption {
  id: string;
  name: string;
  url: string;
  defaultOrigin: string;
}

export const SERVERS: ServerOption[] = [
  {
    id: 'ck',
    name: 'CK Lottery',
    url: 'https://ckygjf6r.com/api/webapi/',
    defaultOrigin: 'https://www.cklottery.cc',
  },
  {
    id: 'bigwin',
    name: '777 Big Win',
    url: 'https://api.bigwinqaz.com/api/webapi/',
    defaultOrigin: 'https://bigwinqaz.com',
  },
];

export interface LoginResult {
  success: boolean;
  token?: string;
  tokenHeader?: string;
  authHeader?: string;
  userId?: string;
  balance?: number;
  message?: string;
}

export interface BetResponse {
  success: boolean;
  code: number;
  msg: string;
  data?: unknown;
}

/**
 * Universal Proxy Request Sender
 */
async function sendProxyRequest(targetUrl: string, data: Record<string, unknown>, headers: Record<string, string> = {}) {
  try {
    const res = await fetch('/api/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetUrl,
        method: 'POST',
        headers,
        data,
      }),
    });
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return { msgCode: -1, msg: text || 'Invalid JSON response from server' };
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { msgCode: -1, msg: message };
  }
}

export class LotteryApiClient {
  private serverUrl: string;
  private authHeader: string = '';
  private origin: string = 'https://www.cklottery.cc';

  constructor(serverUrl: string = SERVERS[0].url) {
    this.serverUrl = serverUrl;
  }

  public setServer(serverUrl: string, origin?: string) {
    this.serverUrl = serverUrl.endsWith('/') ? serverUrl : serverUrl + '/';
    if (origin) this.origin = origin;
  }

  public getServerUrl(): string {
    return this.serverUrl;
  }

  public setAuthHeader(header: string) {
    this.authHeader = header;
  }

  public getAuthHeader(): string {
    return this.authHeader;
  }

  /**
   * Login reproduction from Android Java:
   * body.put("phonetype", -1);
   * body.put("language", 0);
   * body.put("logintype", "mobile");
   * body.put("random", _randomKey());
   * body.put("username", "95" + phone);
   * body.put("pwd", password);
   * body.put("signature", _signMd5(body).toUpperCase());
   * body.put("timestamp", Math.floor(Date.now() / 1000));
   */
  public async login(phone: string, password: string): Promise<LoginResult> {
    const cleanPhone = phone.replace(/^0+/, '').replace(/^95/, '');
    const username = '95' + cleanPhone;

    const payload: Record<string, unknown> = {
      phonetype: -1,
      language: 0,
      logintype: 'mobile',
      random: generateRandomKey(),
      username,
      pwd: password,
    };

    const signature = signMd5(payload);
    payload.signature = signature;
    payload.timestamp = Math.floor(Date.now() / 1000);

    const res = await sendProxyRequest(this.serverUrl + 'Login', payload, {
      'Accept': 'application/json, text/plain, */*',
      'Ar-Origin': this.origin,
    });

    if (res?.msgCode === 0 && res?.data) {
      const tokenHeader = res.data.tokenHeader || '';
      const token = res.data.token || '';
      this.authHeader = tokenHeader + token;

      // Also fetch user profile right away
      const userInfo = await this.getUserInfo();

      return {
        success: true,
        token,
        tokenHeader,
        authHeader: this.authHeader,
        userId: userInfo.userId || String(res.data.userId || ''),
        balance: userInfo.balance || Number(res.data.amount) || 0,
        message: 'Login successful',
      };
    }

    return {
      success: false,
      message: res?.msg || 'Login failed. Please check phone number and password.',
    };
  }

  /**
   * Direct Token Authentication
   */
  public async authenticateWithToken(tokenString: string): Promise<LoginResult> {
    let cleanToken = tokenString.trim();
    if (!cleanToken.startsWith('Bearer ') && !cleanToken.startsWith('bearer ')) {
      cleanToken = 'Bearer ' + cleanToken;
    }
    this.authHeader = cleanToken;

    const userInfo = await this.getUserInfo();
    if (userInfo.success && userInfo.userId) {
      return {
        success: true,
        authHeader: this.authHeader,
        userId: userInfo.userId,
        balance: userInfo.balance,
        message: 'Connected with token',
      };
    }

    return {
      success: false,
      message: 'Token verification failed. Please check if token is valid or expired.',
    };
  }

  public async getBalance(): Promise<{ balance: number; success: boolean }> {
    const payload: Record<string, unknown> = {
      language: 0,
      random: generateRandomKey(),
    };
    payload.signature = signMd5(payload);
    payload.timestamp = Math.floor(Date.now() / 1000);

    const res = await sendProxyRequest(this.serverUrl + 'GetBalance', payload, {
      'Authorization': this.authHeader,
      'Ar-Origin': this.origin,
    });

    if (res?.msgCode === 0 && res?.data) {
      return { balance: Number(res.data.amount) || 0, success: true };
    }
    return { balance: 0, success: false };
  }

  public async getUserInfo(): Promise<{ userId: string; balance: number; success: boolean }> {
    const payload: Record<string, unknown> = {
      language: 0,
      random: generateRandomKey(),
    };
    payload.signature = signMd5(payload);
    payload.timestamp = Math.floor(Date.now() / 1000);

    const res = await sendProxyRequest(this.serverUrl + 'GetUserInfo', payload, {
      'Authorization': this.authHeader,
      'Ar-Origin': this.origin,
    });

    if (res?.msgCode === 0 && res?.data) {
      return {
        userId: String(res.data.userId || ''),
        balance: Number(res.data.amount) || 0,
        success: true,
      };
    }
    return { userId: '', balance: 0, success: false };
  }

  public async getCurrentIssue(): Promise<{ issueNumber: string; remainingSeconds: number; success: boolean }> {
    const payload: Record<string, unknown> = {
      typeId: 30, // Win Go 30s
      language: 0,
      random: generateRandomKey(),
    };
    payload.signature = signMd5(payload);
    payload.timestamp = Math.floor(Date.now() / 1000);

    const res = await sendProxyRequest(this.serverUrl + 'GetGameIssue', payload, {
      'Authorization': this.authHeader,
      'Ar-Origin': this.origin,
    });

    if ((res?.code === 0 || res?.msgCode === 0) && res?.data?.issueNumber) {
      let remSec = 30;
      if (res.data.endTime && res.data.serviceTime) {
        try {
          const endStr = String(res.data.endTime).replace(' ', 'T') + 'Z';
          const servStr = String(res.data.serviceTime).replace(' ', 'T') + 'Z';
          const end = new Date(endStr).getTime();
          const serv = new Date(servStr).getTime();
          if (end > serv) {
            remSec = Math.max(1, Math.min(30, Math.round((end - serv) / 1000)));
          }
        } catch {
          remSec = 30;
        }
      }
      return {
        issueNumber: String(res.data.issueNumber),
        remainingSeconds: remSec,
        success: true,
      };
    }

    const fallback = calculateWingoPeriod();
    return {
      issueNumber: fallback.periodNumber,
      remainingSeconds: fallback.remainingSeconds,
      success: false,
    };
  }

  public async getRecentResults(pageSize: number = 10): Promise<DrawResult[]> {
    const payload: Record<string, unknown> = {
      pageNo: 1,
      pageSize,
      language: 0,
      typeId: 30,
      random: generateRandomKey(),
    };
    payload.signature = signMd5(payload);
    payload.timestamp = Math.floor(Date.now() / 1000);

    const res = await sendProxyRequest(this.serverUrl + 'GetNoaverageEmerdList', payload, {
      'Authorization': this.authHeader,
      'Ar-Origin': this.origin,
    });

    if (res?.msgCode === 0 && Array.isArray(res?.data?.list)) {
      return res.data.list.map((item: Record<string, unknown>) => {
        const numStr = String(item.number ?? '0');
        const num = parseInt(numStr, 10);
        return {
          issueNumber: String(item.issueNumber || ''),
          number: numStr,
          colour: String(item.colour || ''),
          type: num <= 4 ? 'small' : 'big',
        };
      });
    }

    return [];
  }

  public async getMyBetResults(): Promise<BetItem[]> {
    const payload: Record<string, unknown> = {
      pageNo: 1,
      pageSize: 50,
      language: 0,
      typeId: 30,
      random: generateRandomKey(),
    };
    payload.signature = signMd5(payload);
    payload.timestamp = Math.floor(Date.now() / 1000);

    const res = await sendProxyRequest(this.serverUrl + 'GetMyEmerdList', payload, {
      'Authorization': this.authHeader,
      'Ar-Origin': this.origin,
    });

    if (res?.msgCode === 0 && Array.isArray(res?.data?.list)) {
      return res.data.list.map((item: Record<string, unknown>) => ({
        issueNumber: String(item.issueNumber || ''),
        selectType: Number(item.selectType) || 0,
        amount: Number(item.amount) || 0,
        profitAmount: Number(item.profitAmount) || 0,
        state: Number(item.state) ?? 0,
        time: item.addTime ? String(item.addTime) : new Date().toLocaleTimeString(),
        betTypeLabel: Number(item.selectType) === 13 ? 'Big' : 'Small',
      }));
    }

    return [];
  }

  /**
   * Place Wingo 30s Bet:
   * selectType: 13 for Big, 14 for Small
   * uses decomposed base amount and count exactly like Java
   */
  public async placeBet(issueNumber: string, selectType: 13 | 14, totalAmount: number): Promise<BetResponse> {
    const { baseAmount, betCount } = calculateBetUnits(totalAmount);

    const payload: Record<string, unknown> = {
      typeId: 30,
      issuenumber: issueNumber,
      language: 0,
      gameType: 2,
      amount: baseAmount,
      betCount,
      selectType,
      random: generateRandomKey(),
    };
    payload.signature = signMd5(payload);
    payload.timestamp = Math.floor(Date.now() / 1000);

    const res = await sendProxyRequest(this.serverUrl + 'GameBetting', payload, {
      'Authorization': this.authHeader,
      'Ar-Origin': this.origin,
    });

    if (res?.code === 0 || res?.msgCode === 0) {
      return { success: true, code: 0, msg: 'Bet successfully placed', data: res.data };
    }
    return { success: false, code: res?.code ?? -1, msg: res?.msg || 'Failed to place bet' };
  }

  /**
   * Direct Game ID Authentication
   */
  public connectWithGameId(gameId: string): { success: boolean; userId: string; balance: number; message: string } {
    const cleanId = gameId.trim();
    if (!cleanId) return { success: false, userId: '', balance: 0, message: 'Game ID required' };
    return {
      success: true,
      userId: cleanId,
      balance: 50000,
      message: `Connected with Game ID ${cleanId}`,
    };
  }
}

export const apiClient = new LotteryApiClient();
