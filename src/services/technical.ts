import request from '@/utils/request'
import type { TechnicalResponse } from '@/types/technical'

// 获取技术指标分析
export const getTechnicalIndicators = (ts_code: string, trade_date: string) => {
  return request.get<TechnicalResponse>('/api/technical/indicators', {
    params: {
      ts_code,
      trade_date
    }
  })
}
