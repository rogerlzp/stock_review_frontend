<template>
  <div class="market-analysis">
    <el-container>
      <el-header>
        <h2>市场分析</h2>
      </el-header>

      <el-main v-loading="loading">
        <el-row :gutter="20">
          <!-- 市场概览卡片 -->
          <el-col :span="24" :md="8">
            <el-card class="market-overview">
              <template #header>
                <div class="card-header">
                  <span>市场概览</span>
                  <el-tag type="info">{{ currentDate }}</el-tag>
                </div>
              </template>
              <div v-if="marketData.stats" class="market-stats">
                <div class="stat-item">
                  <span>上涨家数：</span>
                  <span class="up">{{ marketData.stats.upCount }}</span>
                </div>
                <div class="stat-item">
                  <span>下跌家数：</span>
                  <span class="down">{{ marketData.stats.downCount }}</span>
                </div>
                <div class="stat-item">
                  <span>成交额：</span>
                  <span class="amount">{{ formatAmount(marketData.stats.turnover) }}亿</span>
                </div>
              </div>
            </el-card>
          </el-col>

          <!-- 行业板块分析 -->
          <el-col :span="24" :md="16">
            <el-card class="sector-analysis">
              <template #header>
                <div class="card-header">
                  <span>行业板块分析</span>
                  <el-tag type="success">实时更新</el-tag>
                </div>
              </template>

              <!-- 使用卡片列表替代表格 -->
              <div v-if="marketData.sectors.length" class="sector-list">
                <el-card
                  v-for="(sector, index) in marketData.sectors"
                  :key="index"
                  class="sector-item"
                  shadow="hover"
                >
                  <div class="sector-header" @click="goToSectorDetail(sector.name)">
                    <h3 class="clickable">{{ sector.name }}</h3>
                    <span class="stock-count">{{ sector.stockCount }}只股票</span>
                  </div>
                  <div class="sector-details">
                    <div class="detail-item">
                      <span>涨跌幅：</span>
                      <span :class="sector.change >= 0 ? 'up' : 'down'">
                        {{ formatNumber(sector.change) }}%
                      </span>
                    </div>
                    <div class="detail-item">
                      <span>上涨占比：</span>
                      <span :class="sector.upRatio >= 50 ? 'up' : 'down'">
                        {{ formatNumber(sector.upRatio) }}%
                      </span>
                    </div>
                    <div class="detail-item">
                      <span>成交额：</span>
                      <span class="amount">{{ formatAmount(sector.turnover) }}亿</span>
                    </div>
                  </div>
                </el-card>
              </div>
              <el-empty v-else description="暂无数据" />
            </el-card>
          </el-col>
        </el-row>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router'
const router = useRouter()

// 使用reactive管理所有数据
const marketData = reactive({
  stats: null,
  sectors: []
})

const loading = ref(false)

// 获取当前日期（使用 computed 以便于自动更新）
const currentDate = computed(() => {
  return new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
})

// 格式化数字（优化小数点处理）
const formatNumber = (value) => {
  if (value === null || value === undefined) return '0.00'
  return Number(value).toFixed(2)
}

// 格式化金额（添加千分位）
const formatAmount = (value) => {
  if (value === null || value === undefined) return '0.00'
  return Number(value).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// 获取市场数据
const fetchMarketData = async () => {
  loading.value = true
  try {
    const { data } = await axios.get('/api/market/analysis')
    console.log('API Response:', data)

    // 更新数据
    marketData.stats = data.marketStats || {}
    marketData.sectors = data.sectorData || []
  } catch (error) {
    console.error('获取数据失败:', error)
    ElMessage.error('获取市场数据失败')
    // 清空数据
    marketData.stats = null
    marketData.sectors = []
  } finally {
    loading.value = false
  }
}

// 启动定时刷新
let timer = null
const startAutoRefresh = () => {
  fetchMarketData()
  timer = setInterval(fetchMarketData, 60000)
}

// 组件挂载时启动刷新
onMounted(() => {
  startAutoRefresh()
})

// 组件卸载时清理定时器
onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})

const goToSectorDetail = (sectorName) => {
  router.push({
    name: 'sector-detail',
    params: { name: encodeURIComponent(sectorName) }
  })
}
</script>

<style scoped>
.market-analysis {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.market-stats {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  font-size: 16px;
  padding: 8px 0;
  border-bottom: 1px solid #ebeef5;
}

.stat-item:last-child {
  border-bottom: none;
}

.sector-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  padding: 8px;
}

.sector-item {
  transition: all 0.3s;
}

.sector-item:hover {
  transform: translateY(-2px);
}

.sector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.sector-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.stock-count {
  font-size: 14px;
  color: #909399;
}

.sector-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.up {
  color: #f56c6c;
  font-weight: bold;
}

.down {
  color: #67c23a;
  font-weight: bold;
}

.amount {
  color: #409eff;
  font-weight: bold;
}

.el-card {
  margin-bottom: 20px;
}

.el-header {
  padding: 0 0 20px 0;
}

h2 {
  margin: 0;
  color: #303133;
}

:deep(.el-card__body) {
  padding: 16px;
}

:deep(.el-empty) {
  padding: 40px 0;
}

.clickable {
  cursor: pointer;
  color: #409eff;
}

.clickable:hover {
  text-decoration: underline;
}
</style>
