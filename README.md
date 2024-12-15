# Stock Analysis Frontend

基于 Vue 3 的股票市场分析前端系统。

## 功能特性

- 市场概览
  - 指数行情
  - 市场资金
  - 涨跌统计
- 板块资金流向
  - 行业板块
  - 概念板块
  - 资金排行
- 龙虎榜数据
  - 每日龙虎榜
  - 机构交易
  - 营业部排名
- 概念题材分析
  - 热门概念
  - 概念股票
  - 概念资金
- 涨停板分析
  - 涨停原因
  - 涨停统计
  - 连板分析
- 市场趋势分析
  - 指数趋势分析
    - 支持多指数选择（上证指数、深证成指、上证50等）
    - 多指标对比（总市值、换手率、市盈率等）
    - 自定义时间范围
    - 北向资金和融资融券数据整合

## 技术栈

- Vue 3 - 渐进式 JavaScript 框架
- TypeScript - JavaScript 的超集
- Element Plus - Vue 3 的组件库
- Vue Router - 官方路由管理器
- Pinia - Vue 的状态管理库
- Axios - HTTP 客户端
- Vite - 现代前端构建工具
- SASS - CSS 预处理器

## 项目结构

```
src/
├── assets/       # 静态资源文件
├── components/   # 通用组件
├── constants/    # 常量定义
├── router/       # 路由配置
├── services/     # API 服务
├── stores/       # Pinia 状态管理
├── types/        # TypeScript 类型定义
├── utils/        # 工具函数
└── views/        # 页面组件
```

## 开发环境设置

1. 安装依赖：
```bash
# 使用 yarn（推荐）
yarn install

# 或使用 npm
npm install
```

2. 配置环境变量：
复制 `.env.ts` 到项目根目录并配置相应的环境变量：
```typescript
export default {
  API_BASE_URL: 'http://localhost:8000',  // 后端API地址
  // 其他配置...
}
```

3. 启动开发服务器：
```bash
# 使用 yarn
yarn dev

# 或使用 npm
npm run dev
```

4. 构建生产版本：
```bash
# 使用 yarn
yarn build

# 或使用 npm
npm run build
```

## 代码规范

- 使用 ESLint 进行代码检查
- 使用 Prettier 进行代码格式化

运行代码检查：
```bash
yarn lint
```

自动修复代码格式：
```bash
yarn lint:fix
```

## 开发指南

1. 组件开发
   - 使用 TypeScript 编写组件
   - 遵循 Vue 3 组合式 API 风格
   - 组件名使用 PascalCase 命名

2. 状态管理
   - 使用 Pinia 进行状态管理
   - 按功能模块划分 store

3. API 调用
   - 使用 services 目录下的服务类
   - 统一处理错误和加载状态

## 浏览器支持

- Chrome >= 87
- Firefox >= 78
- Safari >= 14
- Edge >= 88

## 开发服务器

开发服务器默认运行在：
- URL: http://localhost:5173/
- 代理配置：API 请求代理到 http://localhost:8000

## 路由说明

### 市场分析模块 (/market-review)

- `/market-review/overview` - 市场概览
  - 展示指数行情、市场资金、涨跌统计等整体市场信息
- `/market-review/volume-price` - 量价分析
  - 展示市场成交量和价格走势分析
- `/market-review/sector-flow` - 板块资金流向
  - 展示行业板块和概念板块的资金流向情况
- `/market-review/top-list` - 龙虎榜
  - 展示每日龙虎榜数据和机构交易情况
- `/market-review/concepts` - 概念题材
  - 展示热门概念和相关股票分析
- `/market-review/limit-up` - 涨停分析
  - 展示涨停板统计、连板分析等信息
- `/market-review/technical` - 技术分析
  - 展示市场技术指标分析
- `/market-review/stock/:code` - 股票详情
  - 展示个股详细信息，包括：
    - 基本交易数据（开盘价、最高价、最低价等）
    - 涨停信息（涨停时间、原因、连板情况等）
    - 成交量分析（30日成交量走势）
    - 连板历史（针对连板股票）

### API 接口

所有接口都以 `/api/v1` 为前缀，主要包括：

#### 市场分析接口
- GET `/api/v1/market/overview` - 获取市场概览数据
- GET `/api/v1/market/sector-flow` - 获取板块资金流向
- GET `/api/v1/market/top-list` - 获取龙虎榜数据
- GET `/api/v1/market/limit-up` - 获取涨停板数据
- GET `/api/v1/market/technical` - 获取技术指标数据
- GET `/api/v1/market/concepts` - 获取概念题材数据
- GET `/api/v1/market/daily-review` - 获取每日复盘数据

#### 股票详情接口
- GET `/api/v1/stock/detail/{ts_code}` - 获取股票详细信息
- GET `/api/v1/stock/limit-history/{ts_code}` - 获取连板历史数据
- GET `/api/v1/stock/volume-analysis/{ts_code}` - 获取成交量分析数据

所有接口都支持 `trade_date` 参数（格式：YYYYMMDD）来指定查询日期。

## API 接口文档

### 量价分析接口

#### 市场量价分析
- 获取市场量价数据
  ```
  GET /api/volume-price/market/volume
  参数：
  - date: string (YYYY-MM-DD)
  ```

- 获取市场异常股票
  ```
  GET /api/volume-price/market/anomaly
  参数：
  - date: string (YYYY-MM-DD)
  - type: string (volume_up | volume_down | volume_decrease_up | volume_decrease_down)
  ```

- 获取市场量价异常
  ```
  GET /api/volume-price/market
  参数：
  - trade_date: string (YYYY-MM-DD)
  - anomaly_types?: string[]
  - limit?: number
  - sort_by?: string
  ```

#### 个股量价分析
- 获取股票基本信息
  ```
  GET /api/volume-price/stock/info
  参数：
  - code: string
  - date: string (YYYY-MM-DD)
  ```

- 获取个股量价数据
  ```
  GET /api/volume-price/stock/volume-price
  参数：
  - code: string
  - date: string (YYYY-MM-DD)
  ```

- 获取个股量价分析
  ```
  GET /api/volume-price/stock
  参数：
  - ts_codes: string[]
  - trade_date: string (YYYY-MM-DD)
  ```
