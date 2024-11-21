// 指数数据类型
export interface IndexData {
  code: string;
  name: string;
  totalMv: number;      // 总市值（亿元）
  floatMv: number;      // 流通市值（亿元）
  turnoverRate: number; // 换手率
  turnoverRateF: number; // 自由流通换手率
  pe: number;          // 市盈率
  peTtm: number;       // 市盈率TTM
  pb: number;          // 市净率
}

// 市场概览数据类型
export interface MarketOverviewData {
  indices: IndexData[];
  upCount: number;
  downCount: number;
  totalAmount: number;
}

// 板块资金流向数据类型
export interface SectorFlowData {
  tsCode: string;
  name: string;
  close: number;
  pctChange: number;
  netAmount: number;
  netAmountRate: number;
  buyElgAmount: number;
  buyElgAmountRate: number;
  buyLgAmount: number;
  buyLgAmountRate: number;
  buyMdAmount: number;
  buyMdAmountRate: number;
  buySmAmount: number;
  buySmAmountRate: number;
  hotStock: string;
  rank: number;
}

// 龙虎榜数据类型
export interface TopListData {
  tsCode: string;
  name: string;
  close: number;
  change: number;
  turnoverRate: number;
  amount: number;
  reason: string;
  buyAmount: number;
  sellAmount: number;
  buyInst: string[];
  sellInst: string[];
  netRate: number;
  netAmount: number;
  totalTurnover: number;
}

// 概念题材数据类型
export interface ConceptData {
  tsCode: string;
  conceptName: string;
  stockCount: number;
  limitUpCount: number;
  upCount: number;
  leadingStocks: string[];
  hotNum: number;
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
