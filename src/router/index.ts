import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/market-review/overview'
  },
  {
    path: '/market-review',
    name: 'MarketReview',
    redirect: '/market-review/overview',
    children: [
      {
        path: 'overview',
        name: 'MarketOverview',
        component: () => import('@/views/MarketReview/Overview.vue'),
        meta: {
          title: '市场概览'
        }
      },
      {
        path: 'volume-price',
        name: 'VolumePrice',
        component: () => import('@/views/MarketReview/VolumePrice/MarketAnalysis.vue'),
        meta: {
          title: '量价分析'
        }
      },
      {
        path: 'sector-flow',
        name: 'SectorFlow',
        component: () => import('@/views/MarketReview/SectorFlow.vue'),
        meta: {
          title: '板块资金流'
        }
      },
      {
        path: 'top-list',
        name: 'TopList',
        component: () => import('@/views/MarketReview/TopList.vue'),
        meta: {
          title: '龙虎榜'
        }
      },
      {
        path: 'concepts',
        name: 'Concepts',
        component: () => import('@/views/MarketReview/Concepts.vue'),
        meta: {
          title: '概念题材'
        }
      },
      {
        path: 'limit-up',
        name: 'LimitUp',
        component: () => import('@/views/MarketReview/LimitUp.vue'),
        meta: {
          title: '涨停分析'
        }
      },
      {
        path: 'technical',
        name: 'Technical',
        component: () => import('@/views/MarketReview/Technical/index.vue'),
        meta: {
          title: '技术分析'
        }
      },
      {
        path: 'stock/:code',
        name: 'StockDetail',
        component: () => import('@/views/StockDetail/index.vue'),
        meta: {
          title: '股票详情'
        }
      },
      {
        path: 'stock-compare',
        name: 'StockCompare',
        component: () => import('../views/MarketReview/StockCompare.vue'),
        meta: {
          title: '股票对比分析'
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
