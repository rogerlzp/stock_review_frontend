<template>
  <div class="market-trend">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>市场趋势</span>
          <div class="controls">
            <el-select v-model="selectedIndex" placeholder="选择指数" style="width: 150px">
              <el-option
                v-for="index in indices"
                :key="index.code"
                :label="index.name"
                :value="index.code"
              />
            </el-select>
            <el-select
              v-model="selectedMetrics"
              multiple
              collapse-tags
              collapse-tags-tooltip
              placeholder="选择指标"
              style="width: 200px"
            >
              <el-option
                v-for="(label, value) in METRIC_LABELS"
                :key="value"
                :label="label"
                :value="value"
              />
            </el-select>
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :disabled-date="disabledDate"
              format="YYYY-MM-DD"
              value-format="YYYYMMDD"
              @change="handleDateChange"
            />
          </div>
        </div>
      </template>

      <div class="chart-container" v-loading="loading">
        <div ref="chartRef" style="width: 100%; height: 400px"></div>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import { getMarketTrend } from '@/services/marketReview'
import { METRIC_LABELS } from '@/types/marketReview'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'

const loading = ref(false)
const chartRef = ref<HTMLElement>()
let chart: echarts.ECharts | null = null

const indices = [
  { code: '000001.SH', name: '上证指数' },
  { code: '399001.SZ', name: '深证成指' },
  { code: '000016.SH', name: '上证50' },
  { code: '000905.SH', name: '中证500' },
  { code: '399005.SZ', name: '中小板指' },
  { code: '399006.SZ', name: '创业板指' },
]

const selectedIndex = ref('000001.SH')
const selectedMetrics = ref(['total_mv', 'turnover_rate'])
const dateRange = ref<[string, string]>(['', ''])

const disabledDate = (time: Date) => {
  return time.getTime() > Date.now()
}

const handleDateChange = async () => {
  if (dateRange.value[0] && dateRange.value[1]) {
    await fetchData()
  }
}

const initChart = () => {
  if (chartRef.value) {
    chart = echarts.init(chartRef.value)
  }
}

const updateChart = (dates: string[], metrics: Record<string, number[]>) => {
  if (!chart) return

  const series = Object.entries(metrics).map(([key, values]) => ({
    name: METRIC_LABELS[key],
    type: 'line',
    data: values,
    yAxisIndex: key.includes('rate') || key.includes('pe') || key.includes('pb') ? 1 : 0
  }))

  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: series.map(s => s.name)
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: false
    },
    yAxis: [
      {
        type: 'value',
        name: '金额',
        position: 'left',
        axisLabel: {
          formatter: '{value}'
        }
      },
      {
        type: 'value',
        name: '比率',
        position: 'right',
        axisLabel: {
          formatter: '{value}'
        }
      }
    ],
    series
  }

  chart.setOption(option)
}

const fetchData = async () => {
  if (!selectedIndex.value || !dateRange.value[0] || !dateRange.value[1]) return

  loading.value = true
  try {
    const { data } = await getMarketTrend({
      index_code: selectedIndex.value,
      start_date: dateRange.value[0],
      end_date: dateRange.value[1],
      metrics: selectedMetrics.value
    })
    updateChart(data.dates, data.metrics)
  } catch (error) {
    console.error('Failed to fetch market trend:', error)
  } finally {
    loading.value = false
  }
}

// 监听选项变化
watch([selectedIndex, selectedMetrics], () => {
  if (dateRange.value[0] && dateRange.value[1]) {
    fetchData()
  }
})

// 初始化
onMounted(() => {
  initChart()
  // 设置默认日期范围为近30天
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 30)
  dateRange.value = [
    start.toISOString().split('T')[0].replace(/-/g, ''),
    end.toISOString().split('T')[0].replace(/-/g, '')
  ]
})

// 监听窗口大小变化
window.addEventListener('resize', () => {
  chart?.resize()
})
</script>

<style scoped>
.market-trend {
  margin: 20px 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.controls {
  display: flex;
  gap: 16px;
}

.chart-container {
  margin-top: 20px;
}
</style>
