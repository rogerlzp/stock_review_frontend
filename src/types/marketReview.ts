// 市场概览数据类型
export interface MarketOverviewData {
  tradeDate: string;
  shangzhengIndex: number;
  shangzhengChange: number;
  totalAmount: number;
  upCount: number;
  downCount: number;
}

// 板块资金流向数据类型
export interface SectorFlowData {
  sectorName: string;
  inflow: number;
  outflow: number;
  netFlow: number;
  stockList: string[];
}

// 龙虎榜数据类型
export interface TopListData {
  stockCode: string;
  stockName: string;
  price: number;
  change: number;
  amount: number;
  buyList: string[];
  sellList: string[];
}

// 概念题材数据类型
export interface ConceptData {
  conceptName: string;
  stockCount: number;
  avgChange: number;
  leadingStocks: string[];
  description: string;
}

// 涨停板数据类型
export interface LimitUpData {
  stockCode: string;
  stockName: string;
  limitUpTime: string;
  limitUpReason: string;
  turnoverRate: number;
  amount: number;
}
