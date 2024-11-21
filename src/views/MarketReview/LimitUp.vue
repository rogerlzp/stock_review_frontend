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
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="handleDateChange"
            :clearable="false"
            :editable="false"
          />
        </div>
      </template>
      <el-table
        v-loading="loading"
        :data="tableData"
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

      <!-- 添加分页器 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalItems"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
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
import { ref, computed, onMounted } from 'vue'
import { getLimitUpStocks } from '@/services/marketReview'
import type { LimitUpData } from '@/types/marketReview'

const loading = ref(false)
const data = ref<LimitUpData[]>([])
const selectedDate = ref(new Date())
const currentPage = ref(1)
const pageSize = ref(10)
const dialogVisible = ref(false)
const currentReason = ref('')

// 计算总条目数
const totalItems = computed(() => data.value.length)

// 计算当前页的数据
const tableData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return data.value.slice(start, end)
})

const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
}

const disabledDate = (time: Date) => {
  return time.getTime() > Date.now()
}

const handleDateChange = async (val: string) => {
  console.log('Date selected:', val)
  if (val) {
    await fetchData(val)
  }
}

const formatAmount = (value: number) => {
  return (value / 100000000).toFixed(2)  // 转换为亿元
}

const showReason = (row: LimitUpData) => {
  currentReason.value = row.limitUpReason
  dialogVisible.value = true
}

const fetchData = async (date: string) => {
  loading.value = true
  try {
    console.log('Fetching limit up data for date:', date)
    const response = await getLimitUpStocks(date)
    data.value = response.data.data.map(item => ({
      ...item,
      amount: Number(formatAmount(item.amount))
    }))
    console.log('Processed data:', data.value)
  } catch (error) {
    console.error('获取涨停板数据失败:', error)
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

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
