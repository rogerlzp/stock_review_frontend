import { routes } from '@/router'

interface MenuItem {
  path: string
  title: string
  icon?: string
  children?: MenuItem[]
}

export const menuItems: MenuItem[] = [
  {
    path: '/market-review',
    title: '市场复盘',
    icon: 'DataLine',
    children: [
      {
        path: '/market-review/overview',
        title: '市场概览'
      },
      {
        path: '/market-review/sector-flow',
        title: '板块资金流向'
      },
      {
        path: '/market-review/top-list',
        title: '龙虎榜数据'
      },
      {
        path: '/market-review/concepts',
        title: '概念题材分析'
      },
      {
        path: '/market-review/limit-up',
        title: '涨停板分析'
      },
      {
        path: '/market-review/technical',
        title: '技术分析'
      }
    ]
  }
]
