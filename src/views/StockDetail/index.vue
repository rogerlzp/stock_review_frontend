<template>
  <div class="stock-detail">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <h2 class="title">{{ stockCode }} - {{ stockName }}</h2>
          <div class="date-info">{{ selectedDate }}</div>
        </div>
      </template>

      <!-- 基本交易信息 -->
      <el-descriptions title="交易信息" :column="3" border>
        <el-descriptions-item label="开盘价">{{ formatNumber(stockInfo.openPrice) }}</el-descriptions-item>
        <el-descriptions-item label="最高价">{{ formatNumber(stockInfo.highPrice) }}</el-descriptions-item>
        <el-descriptions-item label="最低价">{{ formatNumber(stockInfo.lowPrice) }}</el-descriptions-item>
        <el-descriptions-item label="收盘价">{{ formatNumber(stockInfo.closePrice) }}</el-descriptions-item>
        <el-descriptions-item label="成交量">{{ formatAmount(stockInfo.volume) }}</el-descriptions-item>
        <el-descriptions-item label="成交额">{{ formatAmount(stockInfo.amount) }}</el-descriptions-item>
      </el-descriptions>

      <!-- 涨停信息 -->
      <el-descriptions title="涨停信息" :column="3" border style="margin-top: 20px;">
        <el-descriptions-item label="涨停时间">{{ stockInfo.limitUpTime }}</el-descriptions-item>
        <el-descriptions-item label="涨停状态">
          <el-tag :type="stockInfo.status === '涨停' ? 'success' : 'danger'">
            {{ stockInfo.status }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="连板数">
          <el-tag :type="getLimitTimesType(stockInfo.limitTimes)" v-if="stockInfo.limitTimes">
            {{ stockInfo.limitTimes }}连板
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="涨停原因">{{ stockInfo.limitUpReason }}</el-descriptions-item>
        <el-descriptions-item label="封单金额">{{ formatAmount(stockInfo.bidAmount) }}</el-descriptions-item>
        <el-descriptions-item label="封单比例">{{ formatNumber(stockInfo.bidTurnover) }}%</el-descriptions-item>
      </el-descriptions>

      <!-- 连板历史 -->
      <div v-if="stockInfo.limitTimes > 1" class="limit-history" style="margin-top: 20px;">
        <h3>连板历史</h3>
        <el-table :data="limitHistory" style="width: 100%" border>
          <el-table-column prop="date" label="日期" width="120" />
          <el-table-column prop="volume" label="成交量">
            <template #default="{ row }">
              {{ formatAmount(row.volume) }}
            </template>
          </el-table-column>
          <el-table-column prop="amount" label="成交额">
            <template #default="{ row }">
              {{ formatAmount(row.amount) }}
            </template>
          </el-table-column>
          <el-table-column prop="turnoverRate" label="换手率">
            <template #default="{ row }">
              {{ formatNumber(row.turnoverRate) }}%
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 30日成交量分析 -->
      <div class="volume-analysis" style="margin-top: 20px;">
        <h3>30日成交量分析</h3>
        <div ref="volumeChartRef" style="width: 100%; height: 400px;"></div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import * as echarts from 'echarts'

const route = useRoute()
const stockCode = ref(route.params.code as string)
const selectedDate = ref(route.params.date as string)
const stockName = ref('')
const stockInfo = ref<any>({})
const limitHistory = ref([])
const volumeChartRef = ref()
let volumeChart: echarts.ECharts | null = null

// 格式化数字
const formatNumber = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '-'
  return value.toFixed(2)
}

// 格式化金额（以万为单位）
const formatAmount = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '-'
  return (value / 10000).toFixed(2) + '万'
}

// 获取连板标签类型
const getLimitTimesType = (limitTimes: number): 'success' | 'warning' | 'danger' | '' => {
  if (limitTimes >= 4) return 'danger'
  if (limitTimes === 3) return 'warning'
  if (limitTimes === 2) return 'success'
  return ''
}

// 获取股票详情数据
const fetchStockDetail = async () => {
  try {
    const response = await axios.get(`/api/market/stock/${stockCode.value}`, {
      params: {
        date: selectedDate.value
      }
    })
    stockInfo.value = response.data
    stockName.value = response.data.stockName
  } catch (error) {
    console.error('获取股票详情失败:', error)
  }
}

// 获取连板历史数据
const fetchLimitHistory = async () => {
  try {
    const response = await axios.get(`/api/market/stock/${stockCode.value}/limit-history`, {
      params: {
        date: selectedDate.value
      }
    })
    limitHistory.value = response.data
  } catch (error) {
    console.error('获取连板历史失败:', error)
  }
}

// 初始化成交量图表
const initVolumeChart = () => {
  if (volumeChartRef.value) {
    volumeChart = echarts.init(volumeChartRef.value)
  }
}

// 获取并显示成交量数据
const fetchVolumeData = async () => {
  try {
    const response = await axios.get(`/api/market/stock/${stockCode.value}/volume-analysis`, {
      params: {
        date: selectedDate.value
      }
    })
    
    const data = response.data
    const option = {
      title: {
        text: '30日成交量走势'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        }
      },
      xAxis: {
        type: 'category',
        data: data.dates
      },
      yAxis: [
        {
          type: 'value',
          name: '成交量',
          axisLabel: {
            formatter: (value: number) => formatAmount(value)
          }
        },
        {
          type: 'value',
          name: '股价',
          axisLabel: {
            formatter: '{value} 元'
          }
        }
      ],
      series: [
        {
          name: '成交量',
          type: 'bar',
          data: data.volumes
        },
        {
          name: '收盘价',
          type: 'line',
          yAxisIndex: 1,
          data: data.prices
        }
      ]
    }
    
    volumeChart?.setOption(option)
  } catch (error) {
    console.error('获取成交量数据失败:', error)
  }
}

// 监听窗口大小变化
window.addEventListener('resize', () => {
  volumeChart?.resize()
})

onMounted(async () => {
  await fetchStockDetail()
  if (stockInfo.value.limitTimes > 1) {
    await fetchLimitHistory()
  }
  initVolumeChart()
  await fetchVolumeData()
})
</script>

<style scoped>
.stock-detail {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  margin: 0;
  font-size: 20px;
}

.date-info {
  font-size: 16px;
  color: #666;
}

.limit-history, .volume-analysis {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
}

h3 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 500;
}
</style>
