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
