export default [
  {
    path: '/',
    redirect: '/market-review',
  },
  {
    path: '/market-review',
    name: '市场复盘',
    icon: 'LineChartOutlined',
    component: './MarketReview',
    routes: [
      {
        path: '/market-review',
        redirect: '/market-review/overview',
      },
      {
        path: '/market-review/overview',
        name: '市场概览',
        component: './MarketReview/Overview',
      },
      {
        path: '/market-review/sector-flow',
        name: '板块资金流向',
        component: './MarketReview/SectorFlow',
      },
      {
        path: '/market-review/top-list',
        name: '龙虎榜数据',
        component: './MarketReview/TopList',
      },
      {
        path: '/market-review/concepts',
        name: '概念题材分析',
        component: './MarketReview/Concepts',
      },
      {
        path: '/market-review/limit-up',
        name: '涨停板分析',
        component: './MarketReview/LimitUp',
      },
    ],
  },
];
