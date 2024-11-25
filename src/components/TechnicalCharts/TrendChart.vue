<template>
  <div class="trend-chart">
    <div ref="chartRef" class="chart-container"></div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'

const props = defineProps<{
  priceData: {
    dates: string[]
    prices: number[]
    ma5: number[]
    ma10: number[]
    ma20: number[]
    ma30: number[]
    volume: number[]
  }
}>()

const chartRef = ref<HTMLElement>()
let chart: echarts.ECharts | null = null

const initChart = () => {
  if (!chartRef.value) return
  
  chart = echarts.init(chartRef.value)
  updateChart()
}

const updateChart = () => {
  if (!chart) return

  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['价格', 'MA5', 'MA10', 'MA20', 'MA30', '成交量']
    },
    grid: [
      {
        left: '3%',
        right: '3%',
        height: '60%'
      },
      {
        left: '3%',
        right: '3%',
        top: '75%',
        height: '20%'
      }
    ],
    xAxis: [
      {
        type: 'category',
        data: props.priceData.dates,
        scale: true,
        boundaryGap: false,
        axisLine: { onZero: false },
        splitLine: { show: false },
        min: 'dataMin',
        max: 'dataMax'
      },
      {
        type: 'category',
        gridIndex: 1,
        data: props.priceData.dates,
        scale: true,
        boundaryGap: false,
        axisLine: { onZero: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        min: 'dataMin',
        max: 'dataMax'
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
        start: 50,
        end: 100
      },
      {
        show: true,
        xAxisIndex: [0, 1],
        type: 'slider',
        bottom: '0',
        start: 50,
        end: 100
      }
    ],
    series: [
      {
        name: '价格',
        type: 'line',
        data: props.priceData.prices,
        smooth: true,
        lineStyle: {
          width: 2
        }
      },
      {
        name: 'MA5',
        type: 'line',
        data: props.priceData.ma5,
        smooth: true,
        lineStyle: {
          width: 1
        }
      },
      {
        name: 'MA10',
        type: 'line',
        data: props.priceData.ma10,
        smooth: true,
        lineStyle: {
          width: 1
        }
      },
      {
        name: 'MA20',
        type: 'line',
        data: props.priceData.ma20,
        smooth: true,
        lineStyle: {
          width: 1
        }
      },
      {
        name: 'MA30',
        type: 'line',
        data: props.priceData.ma30,
        smooth: true,
        lineStyle: {
          width: 1
        }
      },
      {
        name: '成交量',
        type: 'bar',
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: props.priceData.volume
      }
    ]
  }

  chart.setOption(option)
}

watch(() => props.priceData, () => {
  updateChart()
}, { deep: true })

onMounted(() => {
  initChart()
  window.addEventListener('resize', () => {
    chart?.resize()
  })
})
</script>

<style scoped>
.trend-chart {
  width: 100%;
  height: 100%;
}

.chart-container {
  width: 100%;
  height: 600px;
}
</style>
