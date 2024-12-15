<template>
  <div class="stock-analysis-page">
    <div class="search-section">
      <el-form :inline="true" class="form-inline">
        <el-form-item label="选择股票">
          <el-autocomplete
            v-model="stockCode"
            :fetch-suggestions="querySearch"
            placeholder="请输入股票代码或名称"
            @select="handleStockSelect"
            :trigger-on-focus="false"
          >
            <template #default="{ item }">
              <div class="suggestion-item">
                <span>{{ item.name }}</span>
                <span class="code">{{ item.ts_code }}</span>
              </div>
            </template>
          </el-autocomplete>
        </el-form-item>
        <el-form-item>
          <el-button 
            type="primary" 
            @click="handleViewDetail" 
            :disabled="!selectedStock?.ts_code"
          >
            查看详情
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <div v-if="loading" class="loading-section">
      <el-skeleton :rows="5" animated />
    </div>

    <div v-else-if="error" class="error-section">
      <el-alert
        :title="error"
        type="error"
        show-icon
      />
    </div>

    <div v-else-if="selectedStock" class="stock-info-section">
      <el-descriptions title="股票信息" :column="3" border>
        <el-descriptions-item label="股票代码">
          {{ selectedStock.ts_code }}
        </el-descriptions-item>
        <el-descriptions-item label="股票名称">
          {{ selectedStock.name }}
        </el-descriptions-item>
        <el-descriptions-item label="所属行业">
          {{ selectedStock.industry }}
        </el-descriptions-item>
        <el-descriptions-item label="市场">
          {{ selectedStock.market }}
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <div v-else class="empty-section">
      <el-empty description="请输入股票代码或名称进行搜索" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { debounce } from 'lodash-es'
import { stockCompareService } from '@/services/stockCompareService'
import type { StockSearchResult } from '@/types/stockCompare'

const router = useRouter()
const stockCode = ref('')
const selectedStock = ref<StockSearchResult | null>(null)
const loading = ref(false)
const error = ref('')

// 搜索建议（使用防抖）
const querySearch = debounce(async (
  query: string,
  cb: (results: StockSearchResult[]) => void
) => {
  if (query.length < 2) {
    cb([])
    return
  }

  try {
    const results = await stockCompareService.searchStocks(query)
    cb(results)
  } catch (err) {
    console.error('搜索股票失败:', err)
    ElMessage.error('搜索股票失败')
    cb([])
  }
}, 300)

// 处理股票选择
const handleStockSelect = (item: StockSearchResult) => {
  selectedStock.value = item
  stockCode.value = item.ts_code
}

// 查看股票详情
const handleViewDetail = () => {
  if (!selectedStock.value?.ts_code) return
  router.push(`/market-review/stock/${selectedStock.value.ts_code}`)
}
</script>

<style scoped>
.stock-analysis-page {
  padding: 20px;
}

.search-section {
  margin-bottom: 20px;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.code {
  color: #666;
  font-size: 0.9em;
}

.stock-info-section {
  margin-top: 20px;
}

.loading-section,
.error-section,
.empty-section {
  margin-top: 40px;
  display: flex;
  justify-content: center;
}

:deep(.el-form-item) {
  margin-bottom: 18px;
  margin-right: 18px;
}

:deep(.el-autocomplete) {
  width: 300px;
}
</style>
