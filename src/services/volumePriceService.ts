import request from '@/utils/request'

export interface StockVolumePriceParams {
  ts_codes: string[];
  trade_date: string;
}

export interface MarketVolumePriceParams {
  trade_date: string;
  anomaly_types?: string[];
  limit?: number;
  sort_by?: string;
}

export interface VolumePriceAnomaly {
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  indicators: Record<string, number>;
}

export interface StockVolumePriceData {
  ts_code: string;
  anomalies: VolumePriceAnomaly[];
  details: {
    basic: {
      close: number;
      vol: number;
      amount: number;
      pct_chg: number;
      volume_ratio: number;
    };
    flow: {
      net_amount: number;
      net_amount_rate: number;
      buy_elg_amount: number;
      buy_lg_amount: number;
    };
    technical: {
      volume_ratio: number;
      mfi_qfq: number;
      rsi_qfq_6: number;
    };
  };
}

export interface MarketAnomalyData {
  ts_code: string;
  stock_name: string;
  industry_name: string;
  anomaly_score: number;
  pct_chg: number;
  volume_ratio: number;
  net_amount_rate: number;
  anomaly_types: string[];
}

export interface StockInfoParams {
  code: string;
  trade_date: string; 
}

export interface StockVolumePriceParamsNew {
  code: string;
  trade_date: string;
}

export interface MarketVolumePriceParamsNew {
  trade_date: string;
}

export interface AnomalyStockParams {
  date: string;
  type: 'volume_up' | 'volume_down' | 'volume_decrease_up' | 'volume_decrease_down';
}

export interface StockInfo {
  code: string;
  name: string;
  currentPrice: number;
  priceChange: number;
  changePercent: number;
  turnoverRate: number;
}

export interface StockVolumePriceDataNew {
  dates: string[];
  klineData: Array<[number, number, number, number]>; // [open, close, low, high]
  volumes: number[];
  volume: number;
  amount: number;
  volumeRatio: number;
  avgVolume5: number;
  avgVolume10: number;
  avgVolume20: number;
}

export interface MarketVolumeData {
  totalVolume: number;
  totalAmount: number;
  volumeRatio: number;
  avgVolume5: number;
  avgVolume10: number;
  avgVolume20: number;
  volumeDistribution: Array<{
    range: string;
    count: number;
  }>;
}

export interface AnomalyStock {
  code: string;
  name: string;
  price: number;
  changePercent: number;
  volume: number;
  amount: number;
  volumeRatio: number;
  turnoverRate: number;
  reason: string;
}

const volumePriceService = {
  // 获取个股量价分析
  getStockVolumePrice: (params: StockVolumePriceParams) =>
    request<StockVolumePriceData[]>('/api/volume-price/stock', {
      method: 'GET',
      params,
    }),

  // 获取市场量价异常
  getMarketAnomalies: (params: MarketVolumePriceParams) =>
    request<MarketAnomalyData[]>('/api/volume-price/market', {
      method: 'GET',
      params,
    }),

  // 获取股票基本信息
  getStockInfo(params: StockInfoParams) {
    return request({
      url: '/api/volume-price/stock/info',
      method: 'get',
      params
    });
  },

  // 获取个股量价数据
  getStockVolumePriceNew(params: StockVolumePriceParamsNew) {
    return request({
      url: '/api/volume-price/stock/volume-price',
      method: 'get',
      params
    });
  },

  // 获取市场量价数据
  getMarketVolumeData(params: MarketVolumePriceParamsNew) {
    return request({
      url: '/api/volume-price/market/volume',
      method: 'get',
      params
    });
  },

  // 获取异常股票列表
  getAnomalyStocks(params: AnomalyStockParams) {
    return request({
      url: '/api/volume-price/market/anomaly',
      method: 'get',
      params
    });
  },

  // 获取异常股票列表
  getVolumeAnomalies: (tradeDate: string, type: string = 'volume_up') => {
    return request({
      url: '/api/volume-price/market/anomaly',
      method: 'get',
      params: { trade_date: tradeDate, type }
    });
  }
};

export default volumePriceService;
