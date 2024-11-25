<template>
  <div ref="chartRef" class="trend-chart"></div>
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
  }
}>()

const chartRef = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

const initChart = () => {
  if (!chartRef.value) return
  
  // 确保容器有宽高
  chartRef.value.style.width = '100%'
  chartRef.value.style.height = '400px'
  
  // 初始化图表
  chart = echarts.init(chartRef.value)
  
  // 设置图表选项
  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['价格', 'MA5', 'MA10', 'MA20']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: props.priceData.dates,
      boundaryGap: false
    },
    yAxis: {
      type: 'value',
      scale: true
    },
    series: [
      {
        name: '价格',
        type: 'line',
        data: props.priceData.prices,
        itemStyle: {
          color: '#409EFF'
        }
      },
      {
        name: 'MA5',
        type: 'line',
        data: props.priceData.ma5,
        itemStyle: {
          color: '#67C23A'
        }
      },
      {
        name: 'MA10',
        type: 'line',
        data: props.priceData.ma10,
        itemStyle: {
          color: '#E6A23C'
        }
      },
      {
        name: 'MA20',
        type: 'line',
        data: props.priceData.ma20,
        itemStyle: {
          color: '#F56C6C'
        }
      }
    ]
  }
  
  chart.setOption(option)
}

// 监听数据变化
watch(() => props.priceData, () => {
  if (chart) {
    chart.setOption({
      xAxis: {
        data: props.priceData.dates
      },
      series: [
        {
          data: props.priceData.prices
        },
        {
          data: props.priceData.ma5
        },
        {
          data: props.priceData.ma10
        },
        {
          data: props.priceData.ma20
        }
      ]
    })
  }
}, { deep: true })

// 监听窗口大小变化
const handleResize = () => {
  if (chart) {
    chart.resize()
  }
}

onMounted(() => {
  // 等待下一个 tick，确保 DOM 已经渲染
  nextTick(() => {
    initChart()
    window.addEventListener('resize', handleResize)
  })
})

onUnmounted(() => {
  if (chart) {
    chart.dispose()
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.trend-chart {
  width: 100%;
  height: 400px;
}
</style>
