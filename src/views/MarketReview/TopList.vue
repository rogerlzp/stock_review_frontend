<template>
  <div class="top-list">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>龙虎榜数据</span>
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
      >
        <el-table-column prop="stockCode" label="股票代码" />
        <el-table-column prop="stockName" label="股票名称" />
        <el-table-column prop="price" label="价格" />
        <el-table-column prop="change" label="涨跌幅">
          <template #default="{ row }">
            <span :class="row.change >= 0 ? 'up' : 'down'">
              {{ row.change }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="成交额(亿)" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              @click="showTraderList(row)"
            >
              交易明细
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      title="交易明细"
      width="50%"
    >
      <el-descriptions title="买入榜" :column="1" border>
        <el-descriptions-item
          v-for="(buyer, index) in currentTraders.buyList"
          :key="`buy-${index}`"
          :label="`买入第${index + 1}名`"
        >
          {{ buyer }}
        </el-descriptions-item>
      </el-descriptions>
      <el-divider />
      <el-descriptions title="卖出榜" :column="1" border>
        <el-descriptions-item
          v-for="(seller, index) in currentTraders.sellList"
          :key="`sell-${index}`"
          :label="`卖出第${index + 1}名`"
        >
          {{ seller }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { getTopList } from '@/services/marketReview'
import type { TopListData } from '@/types/marketReview'

const loading = ref(false)
const data = ref<TopListData[]>([])
const selectedDate = ref(new Date())
const dialogVisible = ref(false)
const currentTraders = ref<{ buyList: string[], sellList: string[] }>({
  buyList: [],
  sellList: []
})

const disabledDate = (time: Date) => {
  return time.getTime() > Date.now()
}

const handleDateChange = async (val: Date) => {
  if (val) {
    const dateStr = val.toISOString().split('T')[0]
    await fetchData(dateStr)
  }
}

const showTraderList = (row: TopListData) => {
  currentTraders.value = {
    buyList: row.buyList,
    sellList: row.sellList
  }
  dialogVisible.value = true
}

const fetchData = async (date: string) => {
  loading.value = true
  try {
    const response = await getTopList(date)
    data.value = response.data
  } catch (error) {
    console.error('获取龙虎榜数据失败:', error)
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
