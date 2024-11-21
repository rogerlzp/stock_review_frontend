<template>
  <div class="sector-detail">
    <el-page-header @back="goBack">
      <template #content>
        <span class="page-title">{{ decodeURIComponent(route.params.name) }} - 成分股分析</span>
      </template>
    </el-page-header>

    <el-card class="stock-list" v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>成分股列表</span>
          <div class="header-actions">
            <el-select v-model="sortBy" placeholder="排序方式" @change="handleSort">
              <el-option label="按涨跌幅" value="change" />
              <el-option label="按成交额" value="amount" />
              <el-option label="按换手率" value="turnover_rate" />
              <el-option label="按量比" value="vol_ratio" />
            </el-select>
          </div>
        </div>
      </template>

      <div class="stock-grid">
        <el-card
          v-for="stock in stockList"
          :key="stock.ts_code"
          class="stock-card"
          shadow="hover"
        >
          <div class="stock-header">
            <div class="stock-title">
              <span class="stock-name">{{ stock.name }}</span>
              <span class="stock-code">{{ stock.ts_code }}</span>
            </div>
            <div class="stock-price">
              <span class="price">{{ formatNumber(stock.close) }}</span>
              <span :class="['change', stock.change >= 0 ? 'up' : 'down']">
                {{ formatNumber(stock.change) }}%
              </span>
            </div>
          </div>

          <el-descriptions :column="2" size="small" border>
            <el-descriptions-item label="成交额">
              {{ formatAmount(stock.amount / 10000) }}万
            </el-descriptions-item>
            <el-descriptions-item label="换手率">
              {{ formatNumber(stock.turnover_rate) }}%
            </el-descriptions-item>
            <el-descriptions-item label="量比">
              {{ formatNumber(stock.vol_ratio) }}
            </el-descriptions-item>
            <el-descriptions-item label="金额比">
              {{ formatNumber(stock.ma_amount_ratio) }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </div>

      <el-empty v-if="!stockList.length && !loading" description="暂无数据" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const sortBy = ref('amount')
const stockList = ref([])

// 返回上一页
const goBack = () => {
  router.back()
}

// 格式化数字
const formatNumber = (value) => {
  if (value === null || value === undefined) return '0.00'
  return Number(value).toFixed(2)
}

// 格式化金额
const formatAmount = (value) => {
  if (value === null || value === undefined) return '0.00'
  return Number(value).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// 处理排序
const handleSort = () => {
  stockList.value.sort((a, b) => {
    const valueA = Number(a[sortBy.value]) || 0
    const valueB = Number(b[sortBy.value]) || 0
    return valueB - valueA  // 降序排序
  })
}

// 获取板块股票数据
const fetchStockList = async () => {
  loading.value = true
  try {
    const { data } = await axios.get(`/api/sector/${route.params.name}/stocks`)
    stockList.value = data
    handleSort() // 初始排序
  } catch (error) {
    console.error('获取板块数据失败:', error)
    ElMessage.error('获取板块数据失败')
    stockList.value = []
  } finally {
    loading.value = false
  }
}

// 监听排序方式变化
watch(sortBy, handleSort)

// 组件挂载时获取数据
onMounted(() => {
  fetchStockList()
})
</script>

<style scoped>
.sector-detail {
  padding: 20px;
}

.page-title {
  font-size: 18px;
  font-weight: bold;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stock-list {
  margin-top: 20px;
}

.stock-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  padding: 8px;
}

.stock-card {
  transition: all 0.3s;
}

.stock-card:hover {
  transform: translateY(-2px);
}

.stock-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.stock-title {
  display: flex;
  flex-direction: column;
}

.stock-name {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.stock-code {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.stock-price {
  text-align: right;
}

.price {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
  display: block;
}

.change {
  font-size: 14px;
  margin-top: 4px;
  display: block;
}

.up {
  color: #f56c6c;
  font-weight: bold;
}

.down {
  color: #67c23a;
  font-weight: bold;
}

:deep(.el-descriptions__cell) {
  padding: 8px !important;
}

:deep(.el-descriptions__label) {
  font-weight: normal;
  color: #606266;
}

:deep(.el-descriptions__content) {
  font-weight: bold;
}
</style>
