<template>
  <div class="sector-flow">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>板块资金流向</span>
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
        :default-sort="{ prop: 'netFlow', order: 'descending' }"
      >
        <el-table-column prop="sectorName" label="板块名称" />
        <el-table-column prop="inflow" label="流入金额(亿)" sortable>
          <template #default="{ row }">
            <span class="up">{{ row.inflow }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="outflow" label="流出金额(亿)" sortable>
          <template #default="{ row }">
            <span class="down">{{ row.outflow }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="netFlow" label="净流入(亿)" sortable>
          <template #default="{ row }">
            <span :class="row.netFlow >= 0 ? 'up' : 'down'">{{ row.netFlow }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              @click="showStockList(row)"
            >
              成分股
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      title="成分股列表"
      width="30%"
    >
      <el-table :data="currentStockList" height="400">
        <el-table-column prop="code" label="股票代码" />
        <el-table-column prop="name" label="股票名称" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { getSectorFlow } from '@/services/marketReview'
import type { SectorFlowData } from '@/types/marketReview'

const loading = ref(false)
const data = ref<SectorFlowData[]>([])
const selectedDate = ref(new Date())
const dialogVisible = ref(false)
const currentStockList = ref<{ code: string; name: string }[]>([])

const disabledDate = (time: Date) => {
  return time.getTime() > Date.now()
}

const handleDateChange = async (val: Date) => {
  if (val) {
    const dateStr = val.toISOString().split('T')[0]
    await fetchData(dateStr)
  }
}

const showStockList = (row: SectorFlowData) => {
  currentStockList.value = row.stockList.map(stock => {
    const [code, name] = stock.split('|')
    return { code, name }
  })
  dialogVisible.value = true
}

const fetchData = async (date: string) => {
  loading.value = true
  try {
    const response = await getSectorFlow(date)
    data.value = response.data
  } catch (error) {
    console.error('获取板块资金流向数据失败:', error)
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
