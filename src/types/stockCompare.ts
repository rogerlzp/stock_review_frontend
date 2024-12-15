// 股票对比相关的类型定义

export interface StockPriceData {
  close: number[]
  high: number[]
  low: number[]
  open: number[]
}

export interface StockLimitInfo {
  dates: string[]
  turnover_ratio: number[]
  fd_amount: number[]
  limit_status: string[]
}

export interface StockData {
  dates: string[]
  prices: StockPriceData
  volumes: number[]
  amounts: number[]
  pct_chg: number[]
  limit_info: StockLimitInfo
}

export interface StockCorrelation {
  price: number
  volume: number
  turnover: number
}

export interface StockSearchResult {
  ts_code: string
  name: string
  industry?: string
  market?: string
}

export interface StockComparisonData {
  stock1: {
    ts_code: string
    name: string
    daily: Array<{
      trade_date: string
      open: number
      high: number
      low: number
      close: number
      volume: number
      amount: number
      relative_chg: number
    }>
    limit: Array<{
      trade_date: string
      lu_time: string | null
      ld_time: string | null
      status: string | null
    }>
  }
  stock2: {
    ts_code: string
    name: string
    daily: Array<{
      trade_date: string
      open: number
      high: number
      low: number
      close: number
      volume: number
      amount: number
      relative_chg: number
    }>
    limit: Array<{
      trade_date: string
      lu_time: string | null
      ld_time: string | null
      status: string | null
    }>
  }
}

export interface StockDetailData {
  basic: {
    ts_code: string
    name: string
    industry: string | null
    market: string | null
  }
  daily: Array<{
    trade_date: string
    open: number
    high: number
    low: number
    close: number
    pre_close: number
    volume: number
    amount: number
    pct_chg: number
    turnover_rate: number
  }>
  technical: Array<{
    trade_date: string
    ma5: number | null
    ma10: number | null
    ma20: number | null
    ma60: number | null
    vol_ma5: number | null
    vol_ma10: number | null
    vol_ma20: number | null
    macd_dif: number | null
    macd_dea: number | null
    macd: number | null
    kdj_k: number | null
    kdj_d: number | null
    kdj_j: number | null
    rsi_6: number | null
    rsi_12: number | null
    rsi_24: number | null
  }>
  limit: Array<{
    trade_date: string
    lu_time: string | null
    ld_time: string | null
    status: string | null
  }>
}

// API 请求参数类型
export interface StockCompareParams {
  start_date: string
  end_date: string
}

// API 响应类型
export type StockCompareResponse = StockComparisonData;
