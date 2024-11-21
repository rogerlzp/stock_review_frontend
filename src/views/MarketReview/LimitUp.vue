<template>
  <div class="limit-up">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>涨停板分析</span>
          <el-date-picker
            v-model="selectedDate"
            type="date"
            placeholder="选择日期"
            :disabled-date="disabledDate"
            @change="handleDateChange"
          />
        </div>
      </template>
      <el-table
        v-loading="loading"
        :data="data"
        style="width: 100%"
        :default-sort="{ prop: 'limitUpTime', order: 'ascending' }"
      >
        <el-table-column prop="stockCode" label="股票代码" />
        <el-table-column prop="stockName" label="股票名称" />
        <el-table-column prop="limitUpTime" label="涨停时间" sortable />
        <el-table-column prop="turnoverRate" label="换手率" sortable>
          <template #default="{ row }">
            {{ row.turnoverRate }}%
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="成交额(亿)" sortable />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              @click="showReason(row)"
            >
              涨停原因
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      title="涨停原因"
      width="40%"
    >
      <p>{{ currentReason }}</p>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { getLimitUpStocks } from '@/services/marketReview'
import type { LimitUpData } from '@/types/marketReview'

const loading = ref(false)
const data = ref<LimitUpData[]>([])
const selectedDate = ref(new Date())
const dialogVisible = ref(false)
const currentReason = ref('')

const disabledDate = (time: Date) => {
  return time.getTime() > Date.now()
}

const handleDateChange = async (val: Date) => {
  if (val) {
    const dateStr = val.toISOString().split('T')[0]
    await fetchData(dateStr)
  }
}

const showReason = (row: LimitUpData) => {
  currentReason.value = row.limitUpReason
  dialogVisible.value = true
}

const fetchData = async (date: string) => {
  loading.value = true
  try {
    const response = await getLimitUpStocks(date)
    data.value = response.data
  } catch (error) {
    console.error('获取涨停板数据失败:', error)
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
</style>
