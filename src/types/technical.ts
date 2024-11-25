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
  data: TechnicalAnalysis;
}
