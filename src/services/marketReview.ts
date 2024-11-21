import axios from 'axios'
import type { ConceptData } from '@/types/marketReview'

const api = axios.create({
  baseURL: '/api/v1/market-review',
  timeout: 10000
})

export async function getConcepts(tradeDate: string) {
  return api.get<{ data: ConceptData[] }>(`/concepts/${tradeDate}`)
}

export async function getConceptStocks(tradeDate: string, conceptCode: string) {
  return api.get<{ data: any[] }>(`/concept-stocks/${tradeDate}/${conceptCode}`)
}
