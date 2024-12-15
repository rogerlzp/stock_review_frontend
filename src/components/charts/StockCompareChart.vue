<template>
  <div class="stock-compare-charts">
    <div class="chart-container">
      <div ref="relativeChart" class="chart"></div>
      <div ref="volumeChart" class="chart"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'

interface StockDailyData {
  trade_date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
  amount: number
  pct_chg: number
  relative_chg: number
}

interface StockLimitData {
  trade_date: string
  lu_time: string | null
  ld_time: string | null
  status: string | null
}

interface StockData {
  ts_code: string
  name: string
  industry: string
  market: string
  daily: StockDailyData[]
  limit: StockLimitData[]
}

interface StockComparisonData {
  base_stock: StockData
  compare_stocks: StockData[]
}

const props = defineProps<{
  data: StockComparisonData
}>()

const volumeChart = ref<HTMLElement>()
const relativeChart = ref<HTMLElement>()

let charts = {
  volume: null as echarts.ECharts | null,
  relative: null as echarts.ECharts | null,
}

const createCharts = () => {
  if (volumeChart.value) {
    charts.volume = echarts.init(volumeChart.value)
  }
  if (relativeChart.value) {
    charts.relative = echarts.init(relativeChart.value)
  }
}

const updateCharts = () => {
  if (!props.data?.base_stock?.daily) return

  const baseStock = props.data.base_stock
  const compareStock = props.data.compare_stocks[0]

  // 成交量对比图表配置
  const volumeOptions: EChartsOption = {
    title: { text: '成交量对比' },
    tooltip: { 
      trigger: 'axis',
      formatter: function(params: any) {
        const date = params[0].axisValue
        let result = `${date}<br/>`
        params.forEach((param: any) => {
          result += `${param.seriesName}: ${(param.value / 10000).toFixed(2)}万手<br/>`
        })
        return result
      }
    },
    legend: { 
      data: [baseStock.name].concat(compareStock ? [compareStock.name] : []),
      selected: {
        [baseStock.name]: true,
        ...(compareStock ? { [compareStock.name]: true } : {})
      }
    },
    xAxis: { 
      type: 'category',
      data: baseStock.daily.map(item => item.trade_date)
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: baseStock.name,
        type: 'bar',
        data: baseStock.daily.map(item => item.volume)
      },
      ...(compareStock ? [{
        name: compareStock.name,
        type: 'bar',
        data: compareStock.daily.map(item => item.volume)
      }] : [])
    ]
  }

  // 相对涨跌幅图表配置
  const relativeOptions: EChartsOption = {
    title: { text: '相对涨跌幅对比(%)' },
    tooltip: { 
      trigger: 'axis',
      formatter: function(params: any) {
        const date = params[0].axisValue
        let result = `${date}<br/>`
        params.forEach((param: any) => {
          result += `${param.seriesName}: ${param.value.toFixed(2)}%<br/>`
        })
        return result
      }
    },
    legend: { 
      data: [baseStock.name].concat(compareStock ? [compareStock.name] : []),
      selected: {
        [baseStock.name]: true,
        ...(compareStock ? { [compareStock.name]: true } : {})
      }
    },
    xAxis: { 
      type: 'category',
      data: baseStock.daily.map(item => item.trade_date)
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: baseStock.name,
        type: 'line',
        data: baseStock.daily.map(item => item.relative_chg)
      },
      ...(compareStock ? [{
        name: compareStock.name,
        type: 'line',
        data: compareStock.daily.map(item => item.relative_chg)
      }] : [])
    ]
  }

  charts.volume?.setOption(volumeOptions)
  charts.relative?.setOption(relativeOptions)
}

onMounted(() => {
  createCharts()
  updateCharts()
})

watch(() => props.data, () => {
  updateCharts()
}, { deep: true })

onUnmounted(() => {
  charts.volume?.dispose()
  charts.relative?.dispose()
})
</script>

<style scoped>
.stock-compare-charts {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
}

.chart-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.chart {
  width: 100%;
  height: 400px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>
