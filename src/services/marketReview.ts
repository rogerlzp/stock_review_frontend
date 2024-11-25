import type {
  ConceptResponse,
  ConceptStockResponse,
  LimitUpResponse,
  MarketOverviewResponse,
  SectorFlowResponse,
  TopListResponse,
} from '@/types/marketReview'
import request from '@/utils/request'

// 市场概览
export const getMarketOverview = (trade_date: string) => {
  return request.get<MarketOverviewResponse>('/api/market-review/market-overview', {
    params: { trade_date },
  })
}

// 板块资金流向
export const getSectorFlow = (trade_date: string) => {
  return request.get<SectorFlowResponse>('/api/market-review/sector-flow', {
    params: { trade_date },
  })
}

// 龙虎榜数据
export const getTopList = (trade_date: string) => {
  return request.get<TopListResponse>('/api/market-review/top-list', { params: { trade_date } })
}

// 涨停板分析
export const getLimitUpStocks = (trade_date: string) => {
  return request.get<LimitUpResponse>('/api/market-review/limit-up', { params: { trade_date } })
}

// 概念题材分析
export const getConcepts = (trade_date: string) => {
  return request.get<ConceptResponse>('/api/market-review/concepts', {
    params: { trade_date }
  })
}

// 概念成分股
export const getConceptStocks = (date: string, code: string) => {
  return request.get<ConceptStockResponse>('/api/market-review/concept-stocks', {
    params: {
      date,
      code
    }
  })
}
