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
            @change="handleDateChange"
          />
        </div>
      </template>
      <el-skeleton :loading="loading" animated>
        <template #template>
          <div style="padding: 14px">
            <el-skeleton-item variant="text" style="width: 100%" />
            <el-skeleton-item variant="text" style="width: 100%" />
            <el-skeleton-item variant="text" style="width: 100%" />
          </div>
        </template>
        <template #default>
          <el-descriptions border>
            <el-descriptions-item label="上证指数">
              {{ data?.shangzhengIndex }}
            </el-descriptions-item>
            <el-descriptions-item label="涨跌幅">
              <span :class="data?.shangzhengChange >= 0 ? 'up' : 'down'">
                {{ data?.shangzhengChange }}%
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="成交额">
              {{ data?.totalAmount }}亿
            </el-descriptions-item>
            <el-descriptions-item label="上涨家数">
              <span class="up">{{ data?.upCount }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="下跌家数">
              <span class="down">{{ data?.downCount }}</span>
            </el-descriptions-item>
          </el-descriptions>
        </template>
      </el-skeleton>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { getMarketOverview } from '@/services/marketReview'
import type { MarketOverviewData } from '@/types/marketReview'

const loading = ref(false)
const data = ref<MarketOverviewData | null>(null)
const selectedDate = ref(new Date())

const disabledDate = (time: Date) => {
  return time.getTime() > Date.now()
}

const handleDateChange = async (val: Date) => {
  if (val) {
    const dateStr = val.toISOString().split('T')[0]
    await fetchData(dateStr)
  }
}

const fetchData = async (date: string) => {
  loading.value = true
  try {
    const response = await getMarketOverview(date)
    data.value = response.data
  } catch (error) {
    console.error('获取市场概览数据失败:', error)
  }
  loading.value = false
}

onMounted(() => {
  const today = new Date().toISOString().split('T')[0]
  fetchData(today)
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.up {
  color: #f56c6c;
}

.down {
  color: #67c23a;
}
</style>
