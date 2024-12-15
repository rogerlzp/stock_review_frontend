<template>
  <div class="stock-compare-charts">
    <div class="chart-container">
      <div ref="priceChart" class="chart"></div>
      <div ref="volumeChart" class="chart"></div>
      <div ref="turnoverChart" class="chart"></div>
      <div ref="brarChart" class="chart"></div>
      <div ref="psyChart" class="chart"></div>
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
  turnover_rate: number | null
  volume_ratio: number | null
  brar_ar: number | null
  brar_br: number | null
  psy: number | null
  psyma: number | null
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

const priceChart = ref<HTMLElement>()
const volumeChart = ref<HTMLElement>()
const turnoverChart = ref<HTMLElement>()
const brarChart = ref<HTMLElement>()
const psyChart = ref<HTMLElement>()

let charts = {
  price: null as echarts.ECharts | null,
  volume: null as echarts.ECharts | null,
  turnover: null as echarts.ECharts | null,
  brar: null as echarts.ECharts | null,
  psy: null as echarts.ECharts | null,
}

const createCharts = () => {
  if (priceChart.value) charts.price = echarts.init(priceChart.value)
  if (volumeChart.value) charts.volume = echarts.init(volumeChart.value)
  if (turnoverChart.value) charts.turnover = echarts.init(turnoverChart.value)
  if (brarChart.value) charts.brar = echarts.init(brarChart.value)
  if (psyChart.value) charts.psy = echarts.init(psyChart.value)
}

const updateCharts = () => {
  if (!props.data?.base_stock?.daily) return

  const baseStock = props.data.base_stock
  const compareStock = props.data.compare_stocks[0]
  const dates = baseStock.daily.map(item => item.trade_date)

  // 价格走势图
  const priceOptions: EChartsOption = {
    title: { text: '价格走势对比' },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' }
    },
    legend: {
      data: [baseStock.name].concat(compareStock ? [compareStock.name] : [])
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: false
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: baseStock.name,
        type: 'line',
        data: baseStock.daily.map(item => item.close),
        smooth: true
      },
      ...(compareStock ? [{
        name: compareStock.name,
        type: 'line',
        data: compareStock.daily.map(item => item.close),
        smooth: true
      }] : [])
    ]
  }

  // 成交量对比图
  const volumeOptions: EChartsOption = {
    title: { text: '成交量对比' },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const date = params[0].axisValue
        let result = `${date}<br/>`
        params.forEach((param: any) => {
          result += `${param.seriesName}: ${(param.value / 10000).toFixed(2)}万手<br/>`
        })
        return result
      }
    },
    legend: {
      data: [baseStock.name].concat(compareStock ? [compareStock.name] : [])
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: dates },
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

  // 换手率和量比图
  const turnoverOptions: EChartsOption = {
    title: { text: '换手率和量比' },
    tooltip: { trigger: 'axis' },
    legend: {
      data: ['换手率', '量比'].concat(compareStock ? ['对比股换手率', '对比股量比'] : [])
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: dates },
    yAxis: [
      { name: '换手率(%)', type: 'value' },
      { name: '量比', type: 'value' }
    ],
    series: [
      {
        name: '换手率',
        type: 'line',
        yAxisIndex: 0,
        data: baseStock.daily.map(item => item.turnover_rate)
      },
      {
        name: '量比',
        type: 'line',
        yAxisIndex: 1,
        data: baseStock.daily.map(item => item.volume_ratio)
      },
      ...(compareStock ? [
        {
          name: '对比股换手率',
          type: 'line',
          yAxisIndex: 0,
          data: compareStock.daily.map(item => item.turnover_rate)
        },
        {
          name: '对比股量比',
          type: 'line',
          yAxisIndex: 1,
          data: compareStock.daily.map(item => item.volume_ratio)
        }
      ] : [])
    ]
  }

  // BRAR指标图
  const brarOptions: EChartsOption = {
    title: { text: 'BRAR指标对比' },
    tooltip: { trigger: 'axis' },
    legend: {
      data: ['AR指标', 'BR指标'].concat(compareStock ? ['对比股AR', '对比股BR'] : [])
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: dates },
    yAxis: { type: 'value' },
    series: [
      {
        name: 'AR指标',
        type: 'line',
        data: baseStock.daily.map(item => item.brar_ar)
      },
      {
        name: 'BR指标',
        type: 'line',
        data: baseStock.daily.map(item => item.brar_br)
      },
      ...(compareStock ? [
        {
          name: '对比股AR',
          type: 'line',
          data: compareStock.daily.map(item => item.brar_ar)
        },
        {
          name: '对比股BR',
          type: 'line',
          data: compareStock.daily.map(item => item.brar_br)
        }
      ] : [])
    ]
  }

  // PSY指标图
  const psyOptions: EChartsOption = {
    title: { text: 'PSY心理线指标' },
    tooltip: { trigger: 'axis' },
    legend: {
      data: ['PSY', 'PSYMA'].concat(compareStock ? ['对比股PSY', '对比股PSYMA'] : [])
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: dates },
    yAxis: { type: 'value' },
    series: [
      {
        name: 'PSY',
        type: 'line',
        data: baseStock.daily.map(item => item.psy)
      },
      {
        name: 'PSYMA',
        type: 'line',
        data: baseStock.daily.map(item => item.psyma)
      },
      ...(compareStock ? [
        {
          name: '对比股PSY',
          type: 'line',
          data: compareStock.daily.map(item => item.psy)
        },
        {
          name: '对比股PSYMA',
          type: 'line',
          data: compareStock.daily.map(item => item.psyma)
        }
      ] : [])
    ]
  }

  charts.price?.setOption(priceOptions)
  charts.volume?.setOption(volumeOptions)
  charts.turnover?.setOption(turnoverOptions)
  charts.brar?.setOption(brarOptions)
  charts.psy?.setOption(psyOptions)
}

onMounted(() => {
  createCharts()
  updateCharts()
})

watch(() => props.data, () => {
  updateCharts()
}, { deep: true })

onUnmounted(() => {
  Object.values(charts).forEach(chart => chart?.dispose())
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
