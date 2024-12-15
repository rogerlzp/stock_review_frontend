export interface TrendAnalysis {
  short_term: 'up' | 'down';
  medium_term: 'up' | 'down';
  long_term: 'up' | 'down';
  ma_cross: {
    golden_cross: boolean;
    death_cross: boolean;
  };
}

export interface MacdSignal {
  trend: 'up' | 'down';
  divergence: number;
  macd: number;
  dif: number;
  dea: number;
}

export interface KdjAnalysis {
  k: number;
  d: number;
  j: number;
  signal: 'overbought' | 'oversold' | 'neutral';
}

export interface RsiAnalysis {
  rsi6: number;
  rsi12: number;
  rsi24: number;
}

export interface VolatilityAnalysis {
  atr: number;
  bias1: number;
  bias2: number;
  bias3: number;
}

export interface PriceData {
  open: number;
  high: number;
  low: number;
  close: number;
  change_pct: number;
}

export interface TechnicalAnalysis {
  trend: TrendAnalysis;
  macd: MacdSignal;
  kdj: KdjAnalysis;
  rsi: RsiAnalysis;
  volatility: VolatilityAnalysis;
  price: PriceData;
}

export interface TechnicalResponse {
  code: number;
  message: string;
  data: {
    ts_code: string;
    period: number;
    start_date: string;
    end_date: string;
    data: DailyTechnicalData[];
  }
}

export interface DailyTechnicalData {
  trade_date: string;
  trend: TrendAnalysis;
  macd: MacdSignal;
  kdj: KdjAnalysis;
  rsi: RsiAnalysis;
  volatility: VolatilityAnalysis;
  price: PriceData;
  volume: VolumeData;
}

export interface VolumeData {
  volume: number;
  amount: number;
  turnover_rate: number;
  turnover_rate_free: number;
}
