<template>
  <div class="macd-chart">
    <div ref="chartRef" class="chart-container"></div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'

const props = defineProps<{
  macdData: {
    dates: string[]
    dif: number[]
    dea: number[]
    macd: number[]
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
      data: ['DIF', 'DEA', 'MACD']
    },
    grid: {
      left: '3%',
      right: '3%',
      bottom: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: props.macdData.dates,
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
        }
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
        name: 'DIF',
        type: 'line',
        data: props.macdData.dif,
        smooth: true,
        lineStyle: {
          width: 1
        }
      },
      {
        name: 'DEA',
        type: 'line',
        data: props.macdData.dea,
        smooth: true,
        lineStyle: {
          width: 1
        }
      },
      {
        name: 'MACD',
        type: 'bar',
        data: props.macdData.macd,
        itemStyle: {
          color: (params: any) => {
            return params.data >= 0 ? '#ef5350' : '#26a69a'
          }
        }
      }
    ]
  }

  chart.setOption(option)
}

watch(() => props.macdData, () => {
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
.macd-chart {
  width: 100%;
  height: 100%;
}

.chart-container {
  width: 100%;
  height: 400px;
}
</style>
