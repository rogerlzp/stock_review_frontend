<template>
  <div class="stock-compare-page">
    <div class="search-section">
      <el-form :inline="true" class="form-inline">
        <el-form-item label="股票代码1">
          <el-input
            v-model="stock1Code"
            placeholder="请输入股票代码"
            @change="handleCompare"
          />
        </el-form-item>
        <el-form-item label="股票代码2">
          <el-input
            v-model="stock2Code"
            placeholder="请输入股票代码"
            @change="handleCompare"
          />
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYYMMDD"
            @change="handleCompare"
          />
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
      <el-empty description="请输入股票代码并选择日期范围" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import StockCompareChart from '@/components/charts/StockCompareChart.vue'
import { stockCompareService } from '@/services/stockCompareService'
import type { StockComparisonData } from '@/types/stockCompare'

const stock1Code = ref('')
const stock2Code = ref('')
const dateRange = ref<[string, string] | null>(null)
const comparisonData = ref<StockComparisonData | null>(null)
const loading = ref(false)
const error = ref('')

const handleCompare = async () => {
  if (!stock1Code.value || !stock2Code.value || !dateRange.value || !dateRange.value[0] || !dateRange.value[1]) {
    ElMessage.warning('请输入完整的查询条件')
    return
  }

  loading.value = true
  error.value = ''

  try {
    const data = await stockCompareService.getStockComparisonData(
      stock1Code.value,
      stock2Code.value,
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

// 监听输入变化
watch([stock1Code, stock2Code, dateRange], () => {
  comparisonData.value = null
  error.value = ''
})
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
</style>
