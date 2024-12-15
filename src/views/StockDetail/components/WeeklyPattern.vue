<template>
  <div class="weekly-pattern" v-loading="loading">
    <!-- 汇总统计 -->
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="pattern-summary">
          <template #header>
            <div class="card-header">
              <span>周度规律分析</span>
            </div>
          </template>
          
          <el-row :gutter="20" class="summary-stats">
            <el-col :span="6">
              <el-statistic 
                title="分析周期" 
                :value="data?.period_summary?.total_days"
                :value-style="{ color: '#409EFF' }"
                suffix="个交易日"
              />
            </el-col>
            <el-col :span="6">
              <el-statistic 
                title="胜率" 
                :value="(data?.period_summary?.win_rate || 0)"
                :precision="2"
                :value-style="{ color: data?.period_summary?.win_rate >= 50 ? '#67C23A' : '#F56C6C' }"
                suffix="%"
              />
            </el-col>
            <el-col :span="6">
              <el-statistic 
                title="最大涨幅" 
                :value="data?.period_summary?.max_up"
                :precision="2"
                suffix="%"
                value-style="color: #67C23A"
              />
            </el-col>
            <el-col :span="6">
              <el-statistic 
                title="最大跌幅" 
                :value="data?.period_summary?.max_down"
                :precision="2"
                suffix="%"
                value-style="color: #F56C6C"
              />
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <!-- 星期几分布统计 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>交易日特征</span>
            </div>
          </template>
          
          <el-table :data="weekdayStats" border style="width: 100%">
            <el-table-column prop="weekday" label="星期" width="100">
              <template #default="{ row }">
                星期{{ ['一', '二', '三', '四', '五'][row.weekday - 1] }}
              </template>
            </el-table-column>
            <el-table-column prop="win_rate" label="胜率" width="120">
              <template #default="{ row }">
                <span :style="{ color: row.win_rate >= 50 ? '#67C23A' : '#F56C6C' }">
                  {{ row.win_rate.toFixed(2) }}%
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="avg_chg" label="平均涨跌幅" width="120">
              <template #default="{ row }">
                <span :style="{ color: row.avg_chg >= 0 ? '#67C23A' : '#F56C6C' }">
                  {{ row.avg_chg.toFixed(2) }}%
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="trading_count" label="交易次数" width="100" />
            <el-table-column prop="up_count" label="上涨次数" width="100" />
            <el-table-column prop="down_count" label="下跌次数" width="100" />
            <el-table-column prop="avg_amount" label="平均成交额">
              <template #default="{ row }">
                {{ (row.avg_amount / 10000).toFixed(2) }}万
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 周度趋势图 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>周度趋势</span>
              <el-radio-group v-model="chartMetric" size="small" class="metric-switch">
                <el-radio-button label="price">价格趋势</el-radio-button>
                <el-radio-button label="volume">成交量</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="chartRef" class="trend-chart"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})

// Debug: Log when props data changes
watch(() => props.data, (newData) => {
  console.log('WeeklyPattern: props.data changed:', {
    hasPeriodSummary: !!newData?.period_summary,
    hasWeeklyPatterns: !!newData?.weekly_patterns,
    hasWeeklyTrends: !!newData?.weekly_trends,
    rawData: newData
  })
}, { immediate: true, deep: true })

const loading = ref(false)
const chartRef = ref(null)
const chart = ref(null)
const chartMetric = ref('price')

// 计算星期几的统计数据
const weekdayStats = computed(() => {
  console.log('WeeklyPattern: Computing weekdayStats from:', props.data?.weekly_patterns)
  if (!props.data?.weekly_patterns) return []
  
  const stats = props.data.weekly_patterns.map(pattern => {
    const winRate = (pattern.up_count / pattern.trading_count * 100)
    console.log(`WeeklyPattern: Weekday ${pattern.weekday} stats:`, {
      trading_count: pattern.trading_count,
      up_count: pattern.up_count,
      win_rate: winRate
    })
    
    return {
      weekday: pattern.weekday,
      win_rate: winRate,
      avg_chg: pattern.avg_chg,
      avg_amount: pattern.avg_amount,
      trading_count: pattern.trading_count,
      up_count: pattern.up_count,
      down_count: pattern.down_count,
      avg_vol: pattern.avg_vol
    }
  })
  
  console.log('WeeklyPattern: Computed weekdayStats:', stats)
  return stats
})

// 计算周度趋势数据
const weeklyTrendData = computed(() => {
  console.log('WeeklyPattern: Computing weeklyTrendData from:', props.data?.weekly_trends)
  if (!props.data?.weekly_trends) return []
  
  const trends = props.data.weekly_trends.map(trend => ({
    yearweek: trend.yearweek,
    avg_chg: trend.avg_chg,
    total_vol: trend.total_vol,
    total_amount: trend.total_amount,
    daily_stats: trend.daily_stats
  }))
  
  console.log('WeeklyPattern: Computed weeklyTrendData:', trends)
  return trends
})

function updateTrendChart() {
  console.log('WeeklyPattern: Updating trend chart', {
    hasChart: !!chart.value,
    hasData: !!props.data?.weekly_trends,
    chartMetric: chartMetric.value
  })
  
  if (!chart.value || !props.data?.weekly_trends) {
    console.warn('WeeklyPattern: Cannot update chart - missing chart instance or data')
    return
  }

  const weeks = weeklyTrendData.value.map(trend => trend.yearweek)
  const changes = weeklyTrendData.value.map(trend => trend.avg_chg)
  const volumes = weeklyTrendData.value.map(trend => trend.total_vol / 10000)

  console.log('WeeklyPattern: Chart data prepared:', {
    weeks,
    changes,
    volumes
  })

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      },
      formatter: function(params) {
        const week = params[0].name
        const data = weeklyTrendData.value.find(d => d.yearweek === week)
        let html = `<div style="font-size: 14px; font-weight: bold">${week}</div>`
        
        params.forEach(param => {
          const color = param.value >= 0 ? '#67C23A' : '#F56C6C'
          const value = param.seriesName === '周度涨跌幅' 
            ? param.value.toFixed(2) + '%'
            : param.value.toFixed(2) + '万'
          
          html += `<div>
            <span style="display:inline-block;width:10px;height:10px;background:${param.color};margin-right:5px;"></span>
            <span>${param.seriesName}: </span>
            <span style="color:${color};font-weight:bold">${value}</span>
          </div>`
        })

        if (data?.daily_stats) {
          html += '<div style="margin-top: 5px; border-top: 1px solid #eee; padding-top: 5px">'
          html += '<div style="font-weight: bold">日线数据:</div>'
          data.daily_stats.forEach(day => {
            const color = day.pct_chg >= 0 ? '#67C23A' : '#F56C6C'
            html += `<div>
              ${day.date} 星期${['一','二','三','四','五'][day.weekday-1]}: 
              <span style="color:${color}">${day.pct_chg.toFixed(2)}%</span>
            </div>`
          })
          html += '</div>'
        }

        return html
      }
    },
    legend: {
      data: ['周度涨跌幅', '周成交量']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: weeks,
      axisLabel: {
        formatter: (value) => {
          return 'W' + value.split('-')[1]
        }
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '涨跌幅(%)',
        axisLabel: {
          formatter: '{value}%'
        }
      },
      {
        type: 'value',
        name: '成交量(万手)',
        axisLabel: {
          formatter: '{value}万'
        }
      }
    ],
    series: [
      {
        name: '周度涨跌幅',
        type: 'line',
        data: changes,
        itemStyle: {
          color: function(params) {
            return params.value >= 0 ? '#67C23A' : '#F56C6C'
          }
        }
      },
      {
        name: '周成交量',
        type: 'bar',
        yAxisIndex: 1,
        data: volumes,
        itemStyle: {
          color: '#409EFF'
        }
      }
    ]
  }

  try {
    chart.value.setOption(option)
    console.log('WeeklyPattern: Chart updated successfully')
  } catch (error) {
    console.error('WeeklyPattern: Error updating chart:', error)
  }
}

function initChart() {
  console.log('WeeklyPattern: Initializing chart', {
    hasChartRef: !!chartRef.value
  })
  
  if (!chartRef.value) {
    console.warn('WeeklyPattern: Cannot initialize chart - missing chart reference')
    return
  }
  
  try {
    chart.value = echarts.init(chartRef.value)
    console.log('WeeklyPattern: Chart initialized successfully')
    updateTrendChart()
  } catch (error) {
    console.error('WeeklyPattern: Error initializing chart:', error)
  }
}

// 监听数据变化
watch(() => props.data, () => {
  console.log('WeeklyPattern: Data changed, updating chart')
  updateTrendChart()
}, { deep: true })

// 监听图表类型变化
watch(chartMetric, () => {
  console.log('WeeklyPattern: Chart metric changed to:', chartMetric.value)
  updateTrendChart()
})

onMounted(() => {
  console.log('WeeklyPattern: Component mounted')
  initChart()
})

onUnmounted(() => {
  console.log('WeeklyPattern: Component unmounting')
  if (chart.value) {
    chart.value.dispose()
    chart.value = null
    console.log('WeeklyPattern: Chart disposed')
  }
})
</script>

<style scoped>
.weekly-pattern {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metric-switch {
  margin-left: auto;
}

.trend-chart {
  width: 100%;
  height: 400px;
  margin: 20px 0;
}

.summary-stats {
  margin-bottom: 20px;
}
</style>
