import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'root',
    redirect: '/market-review'
  },
  {
    path: '/market-review',
    name: '市场复盘',
    component: () => import('@/views/MarketReview/index.vue'),
    redirect: '/market-review/overview',
    children: [
      {
        path: 'overview',
        name: '市场概览',
        component: () => import('@/views/MarketReview/Overview.vue')
      },
      {
        path: 'sector-flow',
        name: '板块资金流向',
        component: () => import('@/views/MarketReview/SectorFlow.vue')
      },
      {
        path: 'top-list',
        name: '龙虎榜数据',
        component: () => import('@/views/MarketReview/TopList.vue')
      },
      {
        path: 'concepts',
        name: '概念题材分析',
        component: () => import('@/views/MarketReview/Concepts.vue')
      },
      {
        path: 'limit-up',
        name: '涨停板分析',
        component: () => import('@/views/MarketReview/LimitUp.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
