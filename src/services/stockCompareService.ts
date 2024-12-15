import request from '@/utils/request'
import type { StockComparisonData, StockSearchResult } from '@/types/stockCompare'

export interface WeeklyPatternData {
  period_summary: {
    total_days: number;
    up_days: number;
    down_days: number;
    avg_daily_vol: number;
    avg_daily_amount: number;
    max_up: number;
    max_down: number;
    win_rate: number;
  };
  weekly_patterns: Array<{
    weekday: number;
    trading_count: number;
    up_count: number;
    down_count: number;
    avg_chg: number;
    max_up: number;
    max_down: number;
    avg_vol: number;
    avg_amount: number;
    avg_net_mf: number;
  }>;
  weekly_trends: Array<{
    yearweek: string;
    avg_chg: number;
    total_vol: number;
    total_amount: number;
    net_mf_amount: number;
    daily_stats: Array<{
      date: string;
      weekday: number;
      pct_chg: number;
      amount: number;
    }>;
  }>;
}

export const stockCompareService = {
  searchStocks: async (query: string): Promise<StockSearchResult[]> => {
    return request.get<StockSearchResult[]>(
      `/api/stock/search`,
      {
        params: { query }
      }
    )
  },

  compareStocks: async (params: {
    baseStock: string;
    compareStocks: string[];
    startDate: string;
    endDate: string;
  }): Promise<StockComparisonData> => {
    return request.post<StockComparisonData>(
      `/api/market/stock/compare`,
      params
    )
  },

  getWeeklyPattern: async (
    tsCode: string,
    startDate?: string,
    endDate?: string
  ): Promise<WeeklyPatternData> => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    return request.get<WeeklyPatternData>(
      `/api/market/stock/weekly-pattern/${tsCode}?${params.toString()}`
    )
  }
}
