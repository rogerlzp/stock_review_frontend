import { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/market-overview'
  },
  {
    path: '/market-overview',
    name: 'MarketOverview',
    component: () => import('@/views/MarketOverview/index.vue'),
    meta: {
      title: '市场概览'
    }
  },
  {
    path: '/sector-flow',
    name: 'SectorFlow',
    component: () => import('@/views/SectorFlow/index.vue'),
    meta: {
      title: '板块资金流'
    }
  },
  {
    path: '/top-list',
    name: 'TopList',
    component: () => import('@/views/TopList/index.vue'),
    meta: {
      title: '龙虎榜'
    }
  },
  {
    path: '/concept',
    name: 'Concept',
    component: () => import('@/views/Concept/index.vue'),
    meta: {
      title: '概念题材'
    }
  },
  {
    path: '/limit-up',
    name: 'LimitUp',
    component: () => import('@/views/LimitUp/index.vue'),
    meta: {
      title: '涨停分析'
    }
  },
  {
    path: '/technical-analysis',
    name: 'TechnicalAnalysis',
    component: () => import('@/views/TechnicalAnalysis/index.vue'),
    meta: {
      title: '技术分析'
    }
  }
]

export default routes
