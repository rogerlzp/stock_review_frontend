// 涨停板统计
export interface LimitStat {
  limit_times: number;
  count: number;
}

// 行业分布
export interface IndustryDistribution {
  industry: string;
  limit_up_count: number;
  stock_names: string;
}

// 最强涨停股
export interface StrongestStock {
  ts_code: string;
  name: string;
  industry: string;
  fd_amount: number;
  limit_times: number;
  turnover_ratio: number;
  up_stat: string;
}

// 异动股
export interface AbnormalStock {
  ts_code: string;
  name: string;
  industry: string;
  amount: number;
  turnover_ratio: number;
  pct_chg: number;
  amount_ratio: number;
  turnover_ratio_change: number;
}

// 强势股
export interface StrongStock {
  ts_code: string;
  name: string;
  industry: string;
  up_days: number;
  total_gain: number;
  trend: string;
}

// 连板趋势
export interface BoardTrend {
  trade_date: string;
  first_board: number;
  second_board: number;
  third_plus_board: number;
  broken_board: number;
}

// 板块联动
export interface SectorLinkage {
  industry: string;
  stock_count: number;
  limit_up_count: number;
  avg_change: number;
  limit_up_stocks: string;
  limit_up_ratio: number;
}

// API响应数据结构
export interface LimitAnalysisResponse {
  limit_stats: LimitStat[];
  industry_distribution: IndustryDistribution[];
  strongest_stocks: StrongestStock[];
  fastest_stocks: StrongestStock[];
  last_stocks: StrongestStock[];
  broken_stocks: StrongestStock[];
  abnormal_stocks: AbnormalStock[];
  strong_stocks: StrongStock[];
  board_trend: BoardTrend[];
  sector_linkage: SectorLinkage[];
}