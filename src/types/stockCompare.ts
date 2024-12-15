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

export interface StockComparisonData {
  stock1: StockData
  stock2: StockData
  correlation: StockCorrelation
}

// API 请求参数类型
export interface StockCompareParams {
  start_date: string
  end_date: string
}

// API 响应类型
export type StockCompareResponse = StockComparisonData;
