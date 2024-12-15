// 通用响应接口
interface BaseResponse<T> {
  code: number
  message: string
  data: T
}

// 市场概览数据
export interface MarketOverviewData {
  date: string
  shangzheng: {
    close: number
    change: number
    pctChange: number
    volume: number
    amount: number
  }
  shenzheng: {
    close: number
    change: number
    pctChange: number
    volume: number
    amount: number
  }
  chuangye: {
    close: number
    change: number
    pctChange: number
    volume: number
    amount: number
  }
}

export type MarketOverviewResponse = BaseResponse<MarketOverviewData>

// 板块资金流向数据
export interface SectorFlowData {
  rank: number
  name: string
  close: number
  pctChange: number
  netAmount: number
  netAmountRate: number
  buyElgAmount: number
  buyElgAmountRate: number
  buyLgAmount: number
  buyLgAmountRate: number
  buyMdAmount: number
  buyMdAmountRate: number
  buySmAmount: number
  buySmAmountRate: number
  hotStock: string
}

export interface SectorFlowResponseData {
  data: SectorFlowData[]
  total: number
}

export type SectorFlowResponse = BaseResponse<SectorFlowResponseData>

// 龙虎榜数据
export interface TopListData {
  stockCode: string
  stockName: string
  close: number
  pctChange: number
  turnoverRate: number
  amount: number
  buyAmount: number
  sellAmount: number
  netAmount: number
  reason: string
}

export interface TopListResponseData {
  data: TopListData[]
  total: number
}

export type TopListResponse = BaseResponse<TopListResponseData>

// 涨停板数据
export interface LimitUpData {
  stockCode: string
  stockName: string
  close: number
  limitUpType: string
  firstLimitUpTime: string
  lastLimitUpTime: string
  limitUpDays: number
  turnoverRate: number
  amount: number
  circulationMarketValue: number
  reason: string
}

export interface LimitUpResponseData {
  data: LimitUpData[]
  total: number
  statistics: {
    totalCount: number
    firstCount: number
    secondCount: number
    moreCount: number
  }
}

export type LimitUpResponse = BaseResponse<LimitUpResponseData>

// 概念题材数据
export interface ConceptData {
  tsCode: string
  conceptName: string
  stockCount: number
  limitUpCount: number
  upCount: number
  leadingStocks: string[]
  hotNum: number
  description: string
}

export interface ConceptResponseData {
  data: ConceptData[]
}

export type ConceptResponse = BaseResponse<ConceptResponseData>

// 概念成分股数据
export interface ConceptStockData {
  stockCode: string
  stockName: string
  close: number
  pctChange: number
  turnoverRate: number
  amount: number
  circulationMarketValue: number
  concepts: string[]
}

export interface ConceptStockResponseData {
  data: ConceptStockData[]
  total: number
}

export type ConceptStockResponse = BaseResponse<ConceptStockResponseData>

// 市场趋势数据
export interface MarketTrendData {
  dates: string[]
  metrics: {
    [key: string]: number[]
  }
}

export interface MarketTrendResponse {
  data: MarketTrendData
}

export const METRIC_LABELS: Record<string, string> = {
  total_mv: '总市值(亿)',
  float_mv: '流通市值(亿)',
  turnover_rate: '换手率(%)',
  pe: '市盈率',
  pe_ttm: '市盈率(TTM)',
  pb: '市净率',
  net_buy_amount: '北向资金净买入(亿)',
  total_margin: '融资融券余额(亿)'
}
