<template>
  <div class="kdj-chart">
    <div ref="chartRef" class="chart-container"></div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'

const props = defineProps<{
  kdjData: {
    dates: string[]
    k: number[]
    d: number[]
    j: number[]
  }
}>()

const chartRef = ref<HTMLElement>()
let chart: echarts.ECharts | null = null

const initChart = () => {
  if (!chartRef.value) return
  
  // 等待 DOM 更新完成
  nextTick(() => {
    // 确保容器有宽高
    if (chartRef.value.offsetWidth === 0 || chartRef.value.offsetHeight === 0) {
      console.warn('Chart container has no size')
      return
    }
    
    chart = echarts.init(chartRef.value)
    updateChart()
  })
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
      data: ['K', 'D', 'J']
    },
    grid: {
      left: '3%',
      right: '3%',
      bottom: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: props.kdjData.dates,
      scale: true,
      boundaryGap: false,
      axisLine: { onZero: false },
      splitLine: { show: false }
    },
    yAxis: [
      {
        type: 'value',
        scale: true,
        splitArea: {
          show: true
        },
        max: 100,
        min: 0
      }
    ],
    dataZoom: [
      {
        type: 'inside',
        start: 50,
        end: 100
      },
      {
        show: true,
        type: 'slider',
        bottom: '0',
        start: 50,
        end: 100
      }
    ],
    series: [
      {
        name: 'K',
        type: 'line',
        data: props.kdjData.k,
        smooth: true,
        lineStyle: {
          width: 1,
          color: '#fdd835'
        }
      },
      {
        name: 'D',
        type: 'line',
        data: props.kdjData.d,
        smooth: true,
        lineStyle: {
          width: 1,
          color: '#ef5350'
        }
      },
      {
        name: 'J',
        type: 'line',
        data: props.kdjData.j,
        smooth: true,
        lineStyle: {
          width: 1,
          color: '#26a69a'
        }
      }
    ],
    visualMap: {
      show: false,
      pieces: [
        {
          gt: 80,
          lte: 100,
          color: 'rgba(255,0,0,0.1)'
        },
        {
          gt: 0,
          lte: 20,
          color: 'rgba(0,255,0,0.1)'
        }
      ]
    }
  }

  chart.setOption(option)
}

watch(() => props.kdjData, () => {
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
.kdj-chart {
  width: 100%;
  height: 100%;
}

.chart-container {
  width: 100%;
  height: 400px;
}
</style>
