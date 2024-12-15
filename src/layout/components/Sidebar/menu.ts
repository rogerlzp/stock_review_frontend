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
        title: '市场概览',
        icon: 'TrendCharts'
      },
      {
        path: '/market-review/volume-price',
        title: '量价分析',
        icon: 'Histogram'
      },
      {
        path: '/market-review/sector-flow',
        title: '板块资金流',
        icon: 'Money'
      },
      {
        path: '/market-review/top-list',
        title: '龙虎榜',
        icon: 'List'
      },
      {
        path: '/market-review/concepts',
        title: '概念题材',
        icon: 'Collection'
      },
      {
        path: '/market-review/limit-up',
        title: '涨停分析',
        icon: 'ArrowUp'
      },
      {
        path: '/market-review/technical',
        title: '技术分析',
        icon: 'TrendCharts'
      },
      {
        path: '/market-review/stock-compare',
        title: '股票对比',
        icon: 'Document'
      }
    ]
  }
]

export const menu = [
  {
    path: '/market-review/overview',
    name: 'MarketOverview',
    meta: {
      title: '市场概览',
      icon: 'overview'
    }
  },
  {
    path: '/market-review/volume-price',
    name: 'VolumePrice',
    meta: {
      title: '量价分析',
      icon: 'volume'
    }
  },
  {
    path: '/market-review/sector-flow',
    name: 'SectorFlow',
    meta: {
      title: '板块资金流',
      icon: 'flow'
    }
  },
  {
    path: '/market-review/top-list',
    name: 'TopList',
    meta: {
      title: '龙虎榜',
      icon: 'top'
    }
  },
  {
    path: '/market-review/concepts',
    name: 'Concepts',
    meta: {
      title: '概念题材',
      icon: 'concept'
    }
  },
  {
    path: '/market-review/limit-up',
    name: 'LimitUp',
    meta: {
      title: '涨停分析',
      icon: 'limit'
    }
  },
  {
    path: '/market-review/technical',
    name: 'Technical',
    meta: {
      title: '技术分析',
      icon: 'technical'
    }
  }
]
