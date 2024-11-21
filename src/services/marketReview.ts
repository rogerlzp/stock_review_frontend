import axios from 'axios'
import type { MarketOverviewData, SectorFlowData, TopListData, ConceptData, LimitUpData } from '@/types/marketReview'

const api = axios.create({
  baseURL: '/api/v1'
})

export async function getMarketOverview(tradeDate: string) {
  return api.get<{ data: MarketOverviewData }>(`/market-review/market-overview/${tradeDate}`)
}

export async function getSectorFlow(tradeDate: string) {
  return api.get<{ data: SectorFlowData[] }>(`/market-review/sector-flow/${tradeDate}`)
}

export async function getTopList(tradeDate: string) {
  return api.get<{ data: TopListData[] }>(`/market-review/top-list/${tradeDate}`)
}

export async function getConcepts(tradeDate: string) {
  return api.get<{ data: ConceptData[] }>(`/market-review/concepts/${tradeDate}`)
}

export async function getLimitUpStocks(tradeDate: string) {
  return api.get<{ data: LimitUpData[] }>(`/market-review/limit-up-stocks/${tradeDate}`)
}
