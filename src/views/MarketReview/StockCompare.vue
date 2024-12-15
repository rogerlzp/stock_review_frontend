<template>
  <div class="stock-compare-page">
    <div class="search-section">
      <el-form :inline="true" class="form-inline">
        <el-form-item label="基准股票">
          <el-autocomplete
            v-model="baseStockCode"
            :fetch-suggestions="querySearch"
            placeholder="请输入股票代码或名称"
            @select="handleBaseStockSelect"
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
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYYMMDD"
            @change="handleDateChange"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleViewMetrics" :disabled="!canViewMetrics">查看指标</el-button>
          <el-button type="success" @click="showCompareDialog" :disabled="!canCompare">添加对比</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div v-if="loading" class="loading-section">
      <el-skeleton :rows="10" animated />
    </div>

    <div v-else-if="error" class="error-section">
      <el-alert
        :title="error"
        type="error"
        show-icon
      />
    </div>

    <div v-else-if="comparisonData" class="comparison-section">
      <StockCompareChart :data="comparisonData" />
    </div>

    <div v-else class="empty-section">
      <el-empty description="请选择基准股票和日期范围" />
    </div>

    <!-- 添加对比股票的弹窗 -->
    <el-dialog
      v-model="compareDialogVisible"
      title="添加对比股票"
      width="30%"
    >
      <el-form>
        <el-form-item label="对比股票">
          <el-autocomplete
            v-model="compareStockCode"
            :fetch-suggestions="querySearch"
            placeholder="请输入股票代码或名称"
            @select="handleCompareStockSelect"
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
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="compareDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleCompare" :disabled="!canDoCompare">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { debounce } from 'lodash-es'
import StockCompareChart from '@/components/charts/StockCompareChart.vue'
import { stockCompareService } from '@/services/stockCompareService'
import type { StockComparisonData, StockSearchResult } from '@/types/stockCompare'

const baseStockCode = ref('')
const compareStockCode = ref('')
const selectedBaseStock = ref<StockSearchResult | null>(null)
const selectedCompareStock = ref<StockSearchResult | null>(null)
const dateRange = ref<[string, string] | null>(null)
const comparisonData = ref<StockComparisonData | null>(null)
const loading = ref(false)
const error = ref('')
const compareDialogVisible = ref(false)

const canViewMetrics = computed(() => {
  return selectedBaseStock.value?.ts_code && dateRange.value?.[0] && dateRange.value?.[1]
})

const canCompare = computed(() => {
  return selectedBaseStock.value?.ts_code && dateRange.value?.[0] && dateRange.value?.[1]
})

const canDoCompare = computed(() => {
  return selectedCompareStock.value?.ts_code
})

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
    cb([])
  }
}, 300)

const handleBaseStockSelect = (item: StockSearchResult) => {
  selectedBaseStock.value = item
  baseStockCode.value = item.ts_code
  comparisonData.value = null
}

const handleCompareStockSelect = (item: StockSearchResult) => {
  selectedCompareStock.value = item
  compareStockCode.value = item.ts_code
}

const handleDateChange = () => {
  comparisonData.value = null
}

const showCompareDialog = () => {
  compareDialogVisible.value = true
  compareStockCode.value = ''
  selectedCompareStock.value = null
}

const handleViewMetrics = async () => {
  if (!selectedBaseStock.value?.ts_code || !dateRange.value?.[0] || !dateRange.value?.[1]) {
    return
  }

  loading.value = true
  error.value = ''

  try {
    const data = await stockCompareService.getStockComparisonData(
      selectedBaseStock.value.ts_code,
      null,
      dateRange.value[0],
      dateRange.value[1]
    )
    comparisonData.value = data
  } catch (err) {
    error.value = '获取数据失败，请稍后重试'
    ElMessage.error('获取数据失败，请稍后重试')
    console.error('Error fetching stock detail data:', err)
  } finally {
    loading.value = false
  }
}

const handleCompare = async () => {
  if (!selectedBaseStock.value?.ts_code || !selectedCompareStock.value?.ts_code || !dateRange.value?.[0] || !dateRange.value?.[1]) {
    return
  }

  loading.value = true
  error.value = ''
  compareDialogVisible.value = false

  try {
    const data = await stockCompareService.getStockComparisonData(
      selectedBaseStock.value.ts_code,
      selectedCompareStock.value.ts_code,
      dateRange.value[0],
      dateRange.value[1]
    )
    comparisonData.value = data
  } catch (err) {
    error.value = '获取数据失败，请稍后重试'
    ElMessage.error('获取数据失败，请稍后重试')
    console.error('Error fetching comparison data:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.stock-compare-page {
  padding: 20px;
}

.search-section {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.comparison-section {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.loading-section,
.error-section,
.empty-section {
  margin-top: 20px;
  padding: 40px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  text-align: center;
}

.form-inline {
  display: flex;
  align-items: center;
  gap: 20px;
}

.suggestion-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.suggestion-item .code {
  color: #999;
  font-size: 0.9em;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
