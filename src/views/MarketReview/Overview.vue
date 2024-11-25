<template>
  <div class="overview">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>市场概览</span>
          <el-date-picker
            v-model="selectedDate"
            type="date"
            placeholder="选择日期"
            :disabled-date="disabledDate"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="handleDateChange"
            :clearable="false"
            :editable="false"
          />
        </div>
      </template>

      <!-- 指数数据表格 -->
      <el-table
        v-loading="loading"
        :data="data?.indices || []"
        style="width: 100%"
      >
        <el-table-column prop="name" label="指数名称" />
        <el-table-column prop="totalMv" label="总市值(亿)" sortable>
          <template #default="{ row }">
            {{ formatNumber(row.totalMv) }}
          </template>
        </el-table-column>
        <el-table-column prop="floatMv" label="流通市值(亿)" sortable>
          <template #default="{ row }">
            {{ formatNumber(row.floatMv) }}
          </template>
        </el-table-column>
        <el-table-column prop="turnoverRate" label="换手率" sortable>
          <template #default="{ row }">
            {{ row.turnoverRate.toFixed(2) }}%
          </template>
        </el-table-column>
        <el-table-column prop="turnoverRateF" label="自由流通换手率" sortable>
          <template #default="{ row }">
            {{ row.turnoverRateF.toFixed(2) }}%
          </template>
        </el-table-column>
        <el-table-column prop="pe" label="市盈率" sortable>
          <template #default="{ row }">
            {{ row.pe.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="peTtm" label="市盈率(TTM)" sortable>
          <template #default="{ row }">
            {{ row.peTtm.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="pb" label="市净率" sortable>
          <template #default="{ row }">
            {{ row.pb.toFixed(2) }}
          </template>
        </el-table-column>
      </el-table>

      <!-- 市场统计 -->
      <el-descriptions border class="market-stats" :column="3">
        <el-descriptions-item label="上涨家数">
          <span class="up">{{ data?.upCount || 0 }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="下跌家数">
          <span class="down">{{ data?.downCount || 0 }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="成交总额">
          {{ formatNumber(data?.totalAmount || 0) }}亿
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { getMarketOverview } from '@/services/marketReview'
import type { MarketOverviewData } from '@/types/marketReview'
import { formatNumber } from '@/utils/format'

const loading = ref(false)
const data = ref<MarketOverviewData | null>(null)
const selectedDate = ref(new Date())

const disabledDate = (time: Date) => {
  return time.getTime() > Date.now()
}

const handleDateChange = async (val: string) => {
  console.log('Date selected:', val)
  if (val) {
    await fetchData(val)
  }
}

const fetchData = async (date: string) => {
  loading.value = true
  try {
    console.log('Fetching market overview data for date:', date)
    const response = await getMarketOverview(date)
    data.value = response.data
    console.log('Processed data:', data.value)
  } catch (error) {
    console.error('获取市场概览数据失败:', error)
  }
  loading.value = false
}

onMounted(() => {
  const today = new Date()
  selectedDate.value = today
  const dateStr = today.toISOString().split('T')[0]
  fetchData(dateStr)
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.market-stats {
  margin-top: 20px;
}

.up {
  color: #f56c6c;
}

.down {
  color: #67c23a;
}
</style>
