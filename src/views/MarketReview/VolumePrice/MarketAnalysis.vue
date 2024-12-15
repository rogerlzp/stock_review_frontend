<template>
  <div class="market-volume-price">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>市场量价异常</span>
          <el-date-picker
            v-model="selectedDate"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            :disabled-date="disabledDate"
            @change="handleDateChange"
            :clearable="false"
            :editable="false"
          />
        </div>
      </template>

      <!-- 市场整体量价指标 -->
      <el-descriptions :column="3" border>
        <el-descriptions-item label="市场成交量">
          {{ formatVolume(marketData.totalVolume) }}
        </el-descriptions-item>
        <el-descriptions-item label="市场成交额">
          {{ formatAmount(marketData.totalAmount) }}
        </el-descriptions-item>
        <el-descriptions-item label="市场量比">
          {{ marketData.volumeRatio?.toFixed(2) }}
        </el-descriptions-item>
        <el-descriptions-item label="5日均量">
          {{ formatVolume(marketData.avgVolume5) }}
        </el-descriptions-item>
        <el-descriptions-item label="10日均量">
          {{ formatVolume(marketData.avgVolume10) }}
        </el-descriptions-item>
        <el-descriptions-item label="20日均量">
          {{ formatVolume(marketData.avgVolume20) }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 量价异常股票列表 -->
      <el-card class="inner-card">
        <template #header>
          <div class="card-header">
            <span>量价异常股票</span>
            <el-select v-model="filterType" placeholder="筛选条件" style="width: 200px">
              <el-option label="放量上涨" value="volume_up" />
              <el-option label="放量下跌" value="volume_down" />
              <el-option label="缩量上涨" value="volume_decrease_up" />
              <el-option label="缩量下跌" value="volume_decrease_down" />
            </el-select>
          </div>
        </template>

        <el-table v-loading="loading" :data="tableData" style="width: 100%">
          <el-table-column prop="code" label="代码" width="100" />
          <el-table-column prop="name" label="名称" width="120" />
          <el-table-column prop="close" label="收盘价" width="100">
            <template #default="{ row }">
              <span :class="getColorClass(row.changePercent)">{{ row.close }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="changePercent" label="涨跌幅" width="100">
            <template #default="{ row }">
              <span :class="getColorClass(row.changePercent)">
                {{ row.changePercent.toFixed(2) }}%
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="volume" label="成交量" width="120">
            <template #default="{ row }">
              {{ formatVolume(row.volume) }}
            </template>
          </el-table-column>
          <el-table-column prop="amount" label="成交额" width="120">
            <template #default="{ row }">
              {{ formatAmount(row.amount) }}
            </template>
          </el-table-column>
          <el-table-column prop="volumeRatio" label="量比" width="100">
            <template #default="{ row }">
              {{ row.volumeRatio.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="turnoverRate" label="换手率" width="100">
            <template #default="{ row }">
              {{ row.turnoverRate.toFixed(2) }}%
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 成交量分布图 -->
      <el-card class="inner-card">
        <template #header>
          <div class="card-header">
            <span>成交量分布</span>
          </div>
        </template>
        <div ref="volumeDistChart" style="width: 100%; height: 400px"></div>
      </el-card>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'
import { formatNumber } from '@/utils/format'
import volumePriceService from '@/services/volumePriceService'
import type { MarketVolumeData, AnomalyStock } from '@/services/volumePriceService'

// 格式化成交量
const formatVolume = (value: number) => {
  if (!value) return '0'
  if (value >= 100000000) {
    return formatNumber(value / 100000000) + '亿手'
  }
  if (value >= 10000) {
    return formatNumber(value / 10000) + '万手'
  }
  return formatNumber(value) + '手'
}

// 格式化成交额
const formatAmount = (value: number) => {
  if (!value) return '0'
  if (value >= 100000000) {
    return formatNumber(value / 100000000) + '亿'
  }
  if (value >= 10000) {
    return formatNumber(value / 10000) + '万'
  }
  return formatNumber(value)
}

const selectedDate = ref(new Date().toISOString().split('T')[0])
const filterType = ref('volume_up')
const loading = ref(false)
const marketData = ref<MarketVolumeData>({
  totalVolume: 0,
  totalAmount: 0,
  volumeRatio: 0,
  avgVolume5: 0,
  avgVolume10: 0,
  avgVolume20: 0,
  volumeDistribution: []
})
const tableData = ref<AnomalyStock[]>([])
const volumeDistChart = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

const disabledDate = (time: Date) => {
  return time > new Date()
}

const getColorClass = (value: number) => {
  if (value > 0) return 'text-red'
  if (value < 0) return 'text-green'
  return ''
}

const handleDateChange = async () => {
  await fetchData()
  await fetchAnomalyStocks()
}

// 监听筛选条件变化
watch(filterType, async () => {
  await fetchAnomalyStocks()
})

const fetchAnomalyStocks = async () => {
  try {
    loading.value = true
    const response = await volumePriceService.getAnomalyStocks({
      trade_date: selectedDate.value,
      type: filterType.value || 'volume_up'
    })
    tableData.value = response.data
    updateChart()
  } catch (error) {
    console.error('获取异常股票列表失败:', error)
  } finally {
    loading.value = false
  }
}

const fetchData = async () => {
  try {
    const response = await volumePriceService.getMarketVolumeData({
      trade_date: selectedDate.value
    })
    marketData.value = response.data
    updateChart()
  } catch (error) {
    console.error('获取市场量价数据失败:', error)
  }
}

const updateChart = () => {
  if (!chart || !marketData.value.volumeDistribution?.length) return

  const option = {
    title: {
      text: '市场成交量分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: marketData.value.volumeDistribution.map(item => item.range),
      axisLabel: {
        interval: 0,
        rotate: 30
      }
    },
    yAxis: {
      type: 'value',
      name: '股票数量'
    },
    series: [
      {
        name: '股票数量',
        type: 'bar',
        data: marketData.value.volumeDistribution.map(item => item.count),
        itemStyle: {
          color: '#1890ff'
        }
      }
    ]
  }

  chart.setOption(option)
}

onMounted(async () => {
  if (volumeDistChart.value) {
    chart = echarts.init(volumeDistChart.value)
    window.addEventListener('resize', () => chart?.resize())
  }
  await fetchData()
  await fetchAnomalyStocks()
})
</script>

<style scoped>
.market-volume-price {
  padding: 20px;
}

.box-card {
  margin-bottom: 20px;
}

.inner-card {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.text-red {
  color: #ff4d4f;
}

.text-green {
  color: #52c41a;
}
</style>
