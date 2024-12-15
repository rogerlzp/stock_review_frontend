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
      <el-tabs v-model="activeTab" class="detail-tabs" style="margin-top: 20px;">
        <el-tab-pane label="基本信息" name="basic">
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
        </el-tab-pane>

        <el-tab-pane label="成交量分析" name="volume">
          <div ref="volumeChartRef" style="width: 100%; height: 400px;"></div>
        </el-tab-pane>

        <el-tab-pane label="周度规律" name="weekly">
          <div class="date-range-picker">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              unlink-panels
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :shortcuts="dateShortcuts"
              value-format="YYYYMMDD"
              @change="handleDateRangeChange"
            />
          </div>
          
          <weekly-pattern
            v-if="weeklyPatternData"
            :data="weeklyPatternData"
            :loading="loading"
          />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import * as echarts from 'echarts'
import WeeklyPattern from './components/WeeklyPattern.vue'
import { ElMessage } from 'element-plus'
import { stockCompareService } from '@/services/stockCompareService'
import type { WeeklyPatternData } from '@/services/stockCompareService'

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

// 新增的数据
const activeTab = ref('basic')
const loading = ref(false)
const dateRange = ref<[string, string]>(['', ''])
const weeklyPatternData = ref<WeeklyPatternData | null>(null)

// 日期快捷选项
const dateShortcuts = [
  {
    text: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  },
  {
    text: '最近三个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    }
  },
  {
    text: '最近半年',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 180)
      return [start, end]
    }
  }
]

// 初始化日期范围为最近一个月
onMounted(() => {
  const end = new Date()
  const start = new Date()
  start.setMonth(start.getMonth() - 1)
  
  dateRange.value = [
    start.toISOString().slice(0, 10).replace(/-/g, ''),
    end.toISOString().slice(0, 10).replace(/-/g, '')
  ]
  
  // 如果当前是周度规律标签页，则加载数据
  if (activeTab.value === 'weekly') {
    fetchWeeklyPattern()
  }
  
  fetchStockDetail()
  if (stockInfo.value.limitTimes > 1) {
    fetchLimitHistory()
  }
  initVolumeChart()
  fetchVolumeData()
})

// 获取周度规律数据
const fetchWeeklyPattern = async () => {
  if (!dateRange.value || !dateRange.value[0] || !dateRange.value[1]) {
    console.warn('WeeklyPattern: Date range is not set')
    return
  }
  
  try {
    loading.value = true
    console.log('WeeklyPattern: Fetching data with params:', {
      stockCode: stockCode.value,
      startDate: dateRange.value[0],
      endDate: dateRange.value[1]
    })
    
    const response = await stockCompareService.getWeeklyPattern(
      stockCode.value,
      dateRange.value[0],
      dateRange.value[1]
    )
    
    console.log('WeeklyPattern: Raw API response:', response)
    
    // 检查响应数据的结构
    if (response && typeof response === 'object') {
      // 如果响应中包含 data 字段，使用它
      const data = 'data' in response ? response.data : response
      console.log('WeeklyPattern: Processed data:', data)
      weeklyPatternData.value = data
    } else {
      console.error('WeeklyPattern: Invalid response format:', response)
      ElMessage.error('数据格式错误')
      weeklyPatternData.value = null
    }
  } catch (error) {
    ElMessage.error('获取周度规律数据失败')
    console.error('WeeklyPattern: Error fetching data:', error)
    weeklyPatternData.value = null
  } finally {
    loading.value = false
  }
}

// 处理日期范围变化
const handleDateRangeChange = async (val: [string, string]) => {
  console.log('WeeklyPattern: Date range changed:', val)
  if (val && val[0] && val[1]) {
    dateRange.value = val
    await fetchWeeklyPattern()
  }
}

// 监听标签页变化
watch(activeTab, async (newTab) => {
  console.log('WeeklyPattern: Tab changed to:', newTab)
  if (newTab === 'weekly' && !weeklyPatternData.value && dateRange.value[0] && dateRange.value[1]) {
    await fetchWeeklyPattern()
  }
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
