&lt;template>
  &lt;div class="abnormal-analysis">
    &lt;el-row :gutter="20">
      &lt;!-- 异动股分析 -->
      &lt;el-col :span="12">
        &lt;el-card class="box-card" shadow="hover">
          &lt;template #header>
            &lt;div class="card-header">
              &lt;span>异动股分析&lt;/span>
              &lt;el-tooltip content="成交额放大3倍或换手率超15%的股票" placement="top">
                &lt;el-icon>&lt;InfoFilled />&lt;/el-icon>
              &lt;/el-tooltip>
            &lt;/div>
          &lt;/template>
          &lt;el-table 
            :data="abnormalStocks" 
            style="width: 100%"
            :row-class-name="tableRowClassName"
          >
            &lt;el-table-column prop="name" label="名称" width="100">
              &lt;template #default="scope">
                &lt;span :class="getNameClass(scope.row)">{{ scope.row.name }}&lt;/span>
              &lt;/template>
            &lt;/el-table-column>
            &lt;el-table-column prop="industry" label="行业" width="100" />
            &lt;el-table-column prop="amount_ratio" label="量比" width="90">
              &lt;template #default="scope">
                &lt;span :class="getAmountRatioClass(scope.row.amount_ratio)">
                  {{ formatRatio(scope.row.amount_ratio) }}
                &lt;/span>
              &lt;/template>
            &lt;/el-table-column>
            &lt;el-table-column prop="turnover_ratio" label="换手率" width="90">
              &lt;template #default="scope">
                &lt;span :class="getTurnoverClass(scope.row.turnover_ratio)">
                  {{ formatPercent(scope.row.turnover_ratio) }}
                &lt;/span>
              &lt;/template>
            &lt;/el-table-column>
            &lt;el-table-column prop="pct_chg" label="涨跌幅" width="90">
              &lt;template #default="scope">
                &lt;span :class="getPctChgClass(scope.row.pct_chg)">
                  {{ formatPercent(scope.row.pct_chg) }}
                &lt;/span>
              &lt;/template>
            &lt;/el-table-column>
          &lt;/el-table>
        &lt;/el-card>
      &lt;/el-col>

      &lt;!-- 强势股跟踪 -->
      &lt;el-col :span="12">
        &lt;el-card class="box-card" shadow="hover">
          &lt;template #header>
            &lt;div class="card-header">
              &lt;span>强势股跟踪&lt;/span>
              &lt;el-tooltip content="连续3天以上涨幅超5%或涨停的股票" placement="top">
                &lt;el-icon>&lt;InfoFilled />&lt;/el-icon>
              &lt;/el-tooltip>
            &lt;/div>
          &lt;/template>
          &lt;el-table :data="strongStocks" style="width: 100%">
            &lt;el-table-column prop="name" label="名称" width="100" />
            &lt;el-table-column prop="industry" label="行业" width="100" />
            &lt;el-table-column prop="up_days" label="连续天数" width="90" />
            &lt;el-table-column prop="total_gain" label="累计涨幅" width="90">
              &lt;template #default="scope">
                &lt;span :class="getPctChgClass(scope.row.total_gain)">
                  {{ formatPercent(scope.row.total_gain) }}
                &lt;/span>
              &lt;/template>
            &lt;/el-table-column>
            &lt;el-table-column prop="trend" label="走势">
              &lt;template #default="scope">
                &lt;el-tooltip :content="scope.row.trend" placement="top">
                  &lt;div class="trend-cell">{{ scope.row.trend }}&lt;/div>
                &lt;/el-tooltip>
              &lt;/template>
            &lt;/el-table-column>
          &lt;/el-table>
        &lt;/el-card>
      &lt;/el-col>
    &lt;/el-row>

    &lt;el-row :gutter="20" class="mt-4">
      &lt;!-- 连板趋势图 -->
      &lt;el-col :span="12">
        &lt;el-card class="box-card" shadow="hover">
          &lt;template #header>
            &lt;div class="card-header">
              &lt;span>连板趋势分析（近10个交易日）&lt;/span>
            &lt;/div>
          &lt;/template>
          &lt;div class="chart-container">
            &lt;v-chart :option="boardTrendOption" autoresize />
          &lt;/div>
        &lt;/el-card>
      &lt;/el-col>

      &lt;!-- 板块联动分析 -->
      &lt;el-col :span="12">
        &lt;el-card class="box-card" shadow="hover">
          &lt;template #header>
            &lt;div class="card-header">
              &lt;span>板块联动分析&lt;/span>
            &lt;/div>
          &lt;/template>
          &lt;el-table :data="sectorLinkage" style="width: 100%">
            &lt;el-table-column prop="industry" label="行业" />
            &lt;el-table-column prop="limit_up_ratio" label="涨停比例">
              &lt;template #default="scope">
                &lt;el-progress 
                  :percentage="scope.row.limit_up_ratio" 
                  :color="getProgressColor(scope.row.limit_up_ratio)"
                />
              &lt;/template>
            &lt;/el-table-column>
            &lt;el-table-column prop="avg_change" label="平均涨幅">
              &lt;template #default="scope">
                &lt;span :class="getPctChgClass(scope.row.avg_change)">
                  {{ formatPercent(scope.row.avg_change) }}
                &lt;/span>
              &lt;/template>
            &lt;/el-table-column>
            &lt;el-table-column prop="limit_up_stocks" label="涨停股">
              &lt;template #default="scope">
                &lt;el-tooltip :content="scope.row.limit_up_stocks" placement="top">
                  &lt;div class="ellipsis">{{ scope.row.limit_up_stocks }}&lt;/div>
                &lt;/el-tooltip>
              &lt;/template>
            &lt;/el-table-column>
          &lt;/el-table>
        &lt;/el-card>
      &lt;/el-col>
    &lt;/el-row>
  &lt;/div>
&lt;/template>

&lt;script setup lang="ts">
import { ref, computed, PropType } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { InfoFilled } from '@element-plus/icons-vue'
import type { AbnormalStock, StrongStock, BoardTrend, SectorLinkage } from '@/types/market'

use([
  CanvasRenderer,
  LineChart,
  BarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent
])

const props = defineProps({
  abnormalStocks: {
    type: Array as PropType&lt;AbnormalStock[]>,
    default: () => []
  },
  strongStocks: {
    type: Array as PropType&lt;StrongStock[]>,
    default: () => []
  },
  boardTrend: {
    type: Array as PropType&lt;BoardTrend[]>,
    default: () => []
  },
  sectorLinkage: {
    type: Array as PropType&lt;SectorLinkage[]>,
    default: () => []
  }
})

// 连板趋势图配置
const boardTrendOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      crossStyle: {
        color: '#999'
      }
    }
  },
  legend: {
    data: ['首板', '二板', '三板及以上', '炸板']
  },
  xAxis: {
    type: 'category',
    data: props.boardTrend.map(item => item.trade_date),
    axisPointer: {
      type: 'shadow'
    }
  },
  yAxis: {
    type: 'value',
    name: '数量',
    min: 0,
    splitLine: {
      show: false
    }
  },
  series: [
    {
      name: '首板',
      type: 'bar',
      stack: 'total',
      data: props.boardTrend.map(item => item.first_board),
      itemStyle: { color: '#91cc75' }
    },
    {
      name: '二板',
      type: 'bar',
      stack: 'total',
      data: props.boardTrend.map(item => item.second_board),
      itemStyle: { color: '#fac858' }
    },
    {
      name: '三板及以上',
      type: 'bar',
      stack: 'total',
      data: props.boardTrend.map(item => item.third_plus_board),
      itemStyle: { color: '#ee6666' }
    },
    {
      name: '炸板',
      type: 'line',
      data: props.boardTrend.map(item => item.broken_board),
      itemStyle: { color: '#73c0de' }
    }
  ]
}))

// 格式化函数
const formatRatio = (value: number) => {
  if (!value) return '0'
  return value.toFixed(2) + '倍'
}

const formatPercent = (value: number) => {
  if (!value) return '0%'
  return value.toFixed(2) + '%'
}

// 样式类函数
const getAmountRatioClass = (ratio: number) => {
  if (ratio > 5) return 'text-danger'
  if (ratio > 3) return 'text-warning'
  return ''
}

const getTurnoverClass = (ratio: number) => {
  if (ratio > 20) return 'text-danger'
  if (ratio > 15) return 'text-warning'
  return ''
}

const getPctChgClass = (pct: number) => {
  if (pct > 7) return 'text-danger'
  if (pct > 3) return 'text-warning'
  if (pct < -7) return 'text-success'
  if (pct < -3) return 'text-info'
  return ''
}

const getNameClass = (row: AbnormalStock) => {
  if (row.amount_ratio > 5 && row.turnover_ratio > 20) return 'text-danger font-bold'
  return ''
}

const getProgressColor = (ratio: number) => {
  if (ratio > 30) return '#F56C6C'
  if (ratio > 20) return '#E6A23C'
  return '#67C23A'
}

const tableRowClassName = ({ row }: { row: AbnormalStock }) => {
  if (row.amount_ratio > 5 && row.turnover_ratio > 20) return 'warning-row'
  return ''
}
&lt;/script>

&lt;style scoped>
.abnormal-analysis {
  margin: 20px 0;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mt-4 {
  margin-top: 16px;
}

.chart-container {
  height: 300px;
}

.trend-cell {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.text-danger {
  color: #F56C6C;
}

.text-warning {
  color: #E6A23C;
}

.text-success {
  color: #67C23A;
}

.text-info {
  color: #909399;
}

.font-bold {
  font-weight: bold;
}

:deep(.warning-row) {
  background: #fdf6ec;
}

:deep(.el-progress) {
  margin-right: 20px;
}

:deep(.el-card__header) {
  padding: 10px 20px;
  font-weight: bold;
}
&lt;/style>
