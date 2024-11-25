import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/market-review/overview',
    children: [
      {
        path: 'market-review',
        name: 'MarketReview',
        component: () => import('@/views/MarketReview/index.vue'),
        meta: {
          title: '市场复盘',
          icon: 'el-icon-data-line'
        },
        children: [
          {
            path: 'overview',
            name: 'Overview',
            component: () => import('@/views/MarketReview/Overview.vue'),
            meta: {
              title: '市场概览'
            }
          },
          {
            path: 'sector-flow',
            name: 'SectorFlow',
            component: () => import('@/views/MarketReview/SectorFlow.vue'),
            meta: {
              title: '板块资金流向'
            }
          },
          {
            path: 'top-list',
            name: 'TopList',
            component: () => import('@/views/MarketReview/TopList.vue'),
            meta: {
              title: '龙虎榜数据'
            }
          },
          {
            path: 'concepts',
            name: 'Concepts',
            component: () => import('@/views/MarketReview/Concepts.vue'),
            meta: {
              title: '概念题材分析'
            }
          },
          {
            path: 'limit-up',
            name: 'LimitUp',
            component: () => import('@/views/MarketReview/LimitUp.vue'),
            meta: {
              title: '涨停板分析'
            }
          },
          {
            path: 'technical',
            name: 'Technical',
            component: () => import('@/views/TechnicalAnalysis/index.vue'),
            meta: {
              title: '技术分析'
            }
          }
        ]
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
