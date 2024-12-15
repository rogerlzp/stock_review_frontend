import request from '@/utils/request'
import type { StockComparisonData, StockSearchResult } from '@/types/stockCompare'

export const stockCompareService = {
  searchStocks: async (query: string): Promise<StockSearchResult[]> => {
    return request.get<StockSearchResult[]>(
      `/api/stock/search`,
      {
        params: { query }
      }
    )
  },

  getStockComparisonData: async (
    tsCode: string,
    compareCode: string | null,
    startDate: string,
    endDate: string
  ): Promise<StockComparisonData> => {
    return request.post<StockComparisonData>(
      `/api/market/stock/compare`,
      {
        ts_code1: tsCode,
        ts_code2: compareCode || tsCode,  // 如果没有对比股票，就用自己
        start_date: startDate,
        end_date: endDate
      }
    )
  }
}
