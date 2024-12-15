<template>
  <div class="stock-analysis">
    <div class="charts-container">
      <!-- 周内表现统计 -->
      <div ref="weekdayPatternChart" class="chart-item"></div>
      <!-- 周度趋势图 -->
      <div ref="weeklyTrendChart" class="chart-item"></div>
      <!-- 资金流向图 -->
      <div ref="moneyFlowChart" class="chart-item"></div>
      <!-- 汇总统计卡片 -->
      <div class="summary-card">
        <h3>Period Summary</h3>
        <div class="summary-stats">
          <div class="stat-item">
            <span class="label">Total Days:</span>
            <span class="value">{{ periodSummary.total_days }}</span>
          </div>
          <div class="stat-item">
            <span class="label">Win Rate:</span>
            <span class="value">{{ periodSummary.win_rate.toFixed(2) }}%</span>
          </div>
          <div class="stat-item">
            <span class="label">Max Up/Down:</span>
            <span class="value">{{ periodSummary.max_up }}% / {{ periodSummary.max_down }}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'StockAnalysis',
  props: {
    analysisData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      weekdayChart: null,
      weeklyTrendChart: null,
      moneyFlowChart: null
    }
  },
  computed: {
    periodSummary() {
      return this.analysisData.period_summary || {}
    }
  },
  watch: {
    analysisData: {
      handler(newVal) {
        if (newVal) {
          this.initCharts()
        }
      },
      deep: true
    }
  },
  mounted() {
    this.initCharts()
    window.addEventListener('resize', this.handleResize)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
    this.disposeCharts()
  },
  methods: {
    initCharts() {
      this.initWeekdayPatternChart()
      this.initWeeklyTrendChart()
      this.initMoneyFlowChart()
    },
    handleResize() {
      this.weekdayChart?.resize()
      this.weeklyTrendChart?.resize()
      this.moneyFlowChart?.resize()
    },
    disposeCharts() {
      this.weekdayChart?.dispose()
      this.weeklyTrendChart?.dispose()
      this.moneyFlowChart?.dispose()
    },
    initWeekdayPatternChart() {
      if (!this.analysisData.weekly_patterns) return

      const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      const avgChgData = this.analysisData.weekly_patterns.map(p => p.avg_chg)
      const upCountData = this.analysisData.weekly_patterns.map(p => p.up_count)
      const downCountData = this.analysisData.weekly_patterns.map(p => p.down_count)

      const option = {
        title: {
          text: 'Weekday Performance Pattern',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ['Avg Change %', 'Up Days', 'Down Days'],
          top: 30
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: weekdays
        },
        yAxis: [
          {
            type: 'value',
            name: 'Change %',
            position: 'left'
          },
          {
            type: 'value',
            name: 'Days Count',
            position: 'right'
          }
        ],
        series: [
          {
            name: 'Avg Change %',
            type: 'line',
            data: avgChgData,
            yAxisIndex: 0,
            lineStyle: {
              width: 3
            }
          },
          {
            name: 'Up Days',
            type: 'bar',
            stack: 'days',
            data: upCountData,
            yAxisIndex: 1,
            itemStyle: {
              color: '#91cc75'
            }
          },
          {
            name: 'Down Days',
            type: 'bar',
            stack: 'days',
            data: downCountData,
            yAxisIndex: 1,
            itemStyle: {
              color: '#ee6666'
            }
          }
        ]
      }

      this.weekdayChart = echarts.init(this.$refs.weekdayPatternChart)
      this.weekdayChart.setOption(option)
    },
    initWeeklyTrendChart() {
      if (!this.analysisData.weekly_trends) return

      const data = this.analysisData.weekly_trends
      const dates = data.map(item => item.yearweek)
      const avgChgData = data.map(item => item.avg_chg)
      const volumeData = data.map(item => item.total_vol / 10000) // 转换为万手

      const option = {
        title: {
          text: 'Weekly Price & Volume Trend',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          }
        },
        legend: {
          data: ['Avg Change %', 'Volume(10k)'],
          top: 30
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: dates
        },
        yAxis: [
          {
            type: 'value',
            name: 'Change %',
            position: 'left'
          },
          {
            type: 'value',
            name: 'Volume(10k)',
            position: 'right'
          }
        ],
        series: [
          {
            name: 'Avg Change %',
            type: 'line',
            data: avgChgData,
            lineStyle: {
              width: 3
            }
          },
          {
            name: 'Volume(10k)',
            type: 'bar',
            yAxisIndex: 1,
            data: volumeData,
            itemStyle: {
              color: '#80b3ff'
            }
          }
        ]
      }

      this.weeklyTrendChart = echarts.init(this.$refs.weeklyTrendChart)
      this.weeklyTrendChart.setOption(option)
    },
    initMoneyFlowChart() {
      if (!this.analysisData.weekly_trends) return

      const data = this.analysisData.weekly_trends
      const dates = data.map(item => item.yearweek)
      const moneyFlowData = data.map(item => ({
        super_large: item.money_flow.super_large,
        large: item.money_flow.large,
        medium: item.money_flow.medium,
        small: item.money_flow.small
      }))

      const option = {
        title: {
          text: 'Weekly Money Flow',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ['Super Large', 'Large', 'Medium', 'Small'],
          top: 30
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: dates
        },
        yAxis: {
          type: 'value',
          name: 'Amount'
        },
        series: [
          {
            name: 'Super Large',
            type: 'bar',
            stack: 'money_flow',
            data: moneyFlowData.map(item => item.super_large)
          },
          {
            name: 'Large',
            type: 'bar',
            stack: 'money_flow',
            data: moneyFlowData.map(item => item.large)
          },
          {
            name: 'Medium',
            type: 'bar',
            stack: 'money_flow',
            data: moneyFlowData.map(item => item.medium)
          },
          {
            name: 'Small',
            type: 'bar',
            stack: 'money_flow',
            data: moneyFlowData.map(item => item.small)
          }
        ]
      }

      this.moneyFlowChart = echarts.init(this.$refs.moneyFlowChart)
      this.moneyFlowChart.setOption(option)
    }
  }
}
</script>

<style scoped>
.stock-analysis {
  padding: 20px;
}

.charts-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-top: 20px;
}

.chart-item {
  height: 400px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.summary-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-top: 15px;
}

.stat-item {
  text-align: center;
}

.stat-item .label {
  display: block;
  color: #666;
  margin-bottom: 5px;
}

.stat-item .value {
  font-size: 1.2em;
  font-weight: bold;
  color: #333;
}
</style>
