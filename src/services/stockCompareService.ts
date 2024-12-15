import request from '@/utils/request'
import type { StockComparisonData } from '@/types/stockCompare'

export const stockCompareService = {
  getStockComparisonData: async (
    tsCode: string,
    compareCode: string,
    startDate: string,
    endDate: string
  ): Promise<StockComparisonData> => {
    return request.post<StockComparisonData>(
      `/api/market/stock/compare`,
      {
        ts_code1: tsCode,
        ts_code2: compareCode,
        start_date: startDate,
        end_date: endDate
      }
    )
  }
}
