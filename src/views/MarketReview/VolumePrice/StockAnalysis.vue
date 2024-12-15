<template>
  <div class="stock-volume-price">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>个股量价分析</span>
          <div class="header-controls">
            <el-input
              v-model="stockCode"
              placeholder="请输入股票代码"
              clearable
              @keyup.enter="handleSearch"
              style="width: 200px; margin-right: 16px;"
            />
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
        </div>
      </template>

      <!-- 个股基本信息 -->
      <el-descriptions :column="4" border v-if="stockInfo">
        <el-descriptions-item label="股票名称">{{ stockInfo.name }}</el-descriptions-item>
        <el-descriptions-item label="最新价">
          <span :class="getColorClass(stockInfo.pctChange)">
            {{ stockInfo.close?.toFixed(2) }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="涨跌幅">
          <span :class="getColorClass(stockInfo.pctChange)">
            {{ stockInfo.pctChange?.toFixed(2) }}%
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="换手率">{{ stockInfo.turnoverRate?.toFixed(2) }}%</el-descriptions-item>
      </el-descriptions>

      <!-- 量价指标 -->
      <el-card class="inner-card" v-if="volumePriceData">
        <template #header>
          <div class="card-header">
            <span>量价指标</span>
          </div>
        </template>
        <el-descriptions :column="3" border>
          <el-descriptions-item label="成交量">
            {{ formatVolume(volumePriceData.volume) }}
          </el-descriptions-item>
          <el-descriptions-item label="成交额">
            {{ formatAmount(volumePriceData.amount) }}
          </el-descriptions-item>
          <el-descriptions-item label="量比">
            {{ volumePriceData.volumeRatio?.toFixed(2) }}
          </el-descriptions-item>
          <el-descriptions-item label="5日均量">
            {{ formatVolume(volumePriceData.avgVolume5) }}
          </el-descriptions-item>
          <el-descriptions-item label="10日均量">
            {{ formatVolume(volumePriceData.avgVolume10) }}
          </el-descriptions-item>
          <el-descriptions-item label="20日均量">
            {{ formatVolume(volumePriceData.avgVolume20) }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- K线图 -->
      <el-card class="inner-card">
        <template #header>
          <div class="card-header">
            <span>K线图</span>
          </div>
        </template>
        <div ref="klineChart" style="width: 100%; height: 500px"></div>
      </el-card>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import { formatNumber } from '@/utils/format'
import volumePriceService from '@/services/volumePriceService'
import type { StockInfo, StockVolumePriceDataNew } from '@/services/volumePriceService'

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

const stockCode = ref('')
const selectedDate = ref(new Date().toISOString().split('T')[0])
const stockInfo = ref<StockInfo | null>(null)
const volumePriceData = ref<StockVolumePriceDataNew | null>(null)
const klineChart = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null
const loading = ref(false)

const disabledDate = (time: Date) => {
  return time > new Date()
}

const getColorClass = (value: number) => {
  if (value > 0) return 'text-red'
  if (value < 0) return 'text-green'
  return ''
}

const handleSearch = async () => {
  if (!stockCode.value) {
    return
  }
  await fetchData()
}

const handleDateChange = async () => {
  if (!stockCode.value) {
    return
  }
  await fetchData()
}

const fetchData = async () => {
  if (!stockCode.value) return

  try {
    loading.value = true
    // 获取股票基本信息
    const stockInfoResponse = await volumePriceService.getStockInfo({
      code: stockCode.value,
      trade_date: selectedDate.value
    })
    stockInfo.value = stockInfoResponse.data

    // 获取量价数据
    const volumePriceResponse = await volumePriceService.getStockVolumePriceNew({
      code: stockCode.value,
      trade_date: selectedDate.value
    })
    volumePriceData.value = volumePriceResponse.data

    // 更新图表
    updateChart()
  } catch (error) {
    console.error('获取股票数据失败:', error)
  } finally {
    loading.value = false
  }
}

const updateChart = () => {
  if (!chart || !volumePriceData.value) return

  const option = {
    title: {
      text: `${stockInfo.value?.name}(${stockCode.value})`,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      },
      formatter: function (params: any) {
        const item = params[0]
        if (!item) return ''
        
        const date = volumePriceData.value!.dates[item.dataIndex]
        const klineData = volumePriceData.value!.klineData[item.dataIndex]
        const volume = volumePriceData.value!.volumes[item.dataIndex]
        
        return `
          日期：${date}<br/>
          开盘：${klineData[0]}<br/>
          收盘：${klineData[1]}<br/>
          最低：${klineData[2]}<br/>
          最高：${klineData[3]}<br/>
          成交量：${formatVolume(volume)}<br/>
        `
      }
    },
    grid: [
      {
        left: '10%',
        right: '8%',
        height: '60%'
      },
      {
        left: '10%',
        right: '8%',
        top: '75%',
        height: '20%'
      }
    ],
    xAxis: [
      {
        type: 'category',
        data: volumePriceData.value.dates,
        scale: true,
        boundaryGap: false,
        axisLine: { onZero: false },
        splitLine: { show: false },
        splitNumber: 20
      },
      {
        type: 'category',
        gridIndex: 1,
        data: volumePriceData.value.dates,
        scale: true,
        boundaryGap: false,
        axisLine: { onZero: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        splitNumber: 20
      }
    ],
    yAxis: [
      {
        scale: true,
        splitArea: {
          show: true
        }
      },
      {
        scale: true,
        gridIndex: 1,
        splitNumber: 2,
        axisLabel: { show: false },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false }
      }
    ],
    dataZoom: [
      {
        type: 'inside',
        xAxisIndex: [0, 1],
        start: 0,
        end: 100
      },
      {
        show: true,
        xAxisIndex: [0, 1],
        type: 'slider',
        top: '95%',
        start: 0,
        end: 100
      }
    ],
    series: [
      {
        name: 'K线',
        type: 'candlestick',
        data: volumePriceData.value.klineData,
        itemStyle: {
          color: '#ff4d4f',
          color0: '#52c41a',
          borderColor: '#ff4d4f',
          borderColor0: '#52c41a'
        }
      },
      {
        name: '成交量',
        type: 'bar',
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: volumePriceData.value.volumes.map((volume, index) => ({
          value: volume,
          itemStyle: {
            color: volumePriceData.value!.klineData[index][1] >= volumePriceData.value!.klineData[index][0] ? '#ff4d4f' : '#52c41a'
          }
        }))
      }
    ]
  }

  chart.setOption(option)
}

onMounted(() => {
  if (klineChart.value) {
    chart = echarts.init(klineChart.value)
    window.addEventListener('resize', () => chart?.resize())
  }
})
</script>

<style scoped>
.stock-volume-price {
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

.header-controls {
  display: flex;
  align-items: center;
}

.text-red {
  color: #ff4d4f;
}

.text-green {
  color: #52c41a;
}
</style>
