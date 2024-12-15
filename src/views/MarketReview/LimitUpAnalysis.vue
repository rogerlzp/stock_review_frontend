&lt;template>
  &lt;div class="limit-analysis-container">
    &lt;el-card class="analysis-card">
      &lt;template #header>
        &lt;div class="card-header">
          &lt;span>涨停板分析&lt;/span>
          &lt;div class="header-right">
            &lt;el-button-group>
              &lt;el-button size="small" @click="exportData">
                导出数据
                &lt;el-icon>&lt;Download />&lt;/el-icon>
              &lt;/el-button>
              &lt;el-button size="small" @click="refreshData">
                刷新数据
                &lt;el-icon>&lt;Refresh />&lt;/el-icon>
              &lt;/el-button>
            &lt;/el-button-group>
            &lt;el-date-picker
              v-model="selectedDate"
              type="date"
              placeholder="选择日期"
              format="YYYY-MM-DD"
              value-format="YYYYMMDD"
              @change="fetchData"
            />
          &lt;/div>
        &lt;/div>
      &lt;/template>

      &lt;abnormal-analysis
        :abnormal-stocks="abnormalStocks"
        :strong-stocks="strongStocks"
        :board-trend="boardTrend"
        :sector-linkage="sectorLinkage"
      />

      &lt;el-row :gutter="20">
        &lt;!-- 涨停板统计 -->
        &lt;el-col :span="12">
          &lt;el-card class="box-card">
            &lt;template #header>
              &lt;div class="card-header">
                &lt;span>涨停板统计&lt;/span>
              &lt;/div>
            &lt;/template>
            &lt;div class="limit-stats">
              &lt;el-table :data="limitStats" style="width: 100%">
                &lt;el-table-column prop="limit_times" label="连板数" />
                &lt;el-table-column prop="count" label="数量" />
              &lt;/el-table>
            &lt;/div>
          &lt;/el-card>
        &lt;/el-col>

        &lt;!-- 行业涨停分布 -->
        &lt;el-col :span="12">
          &lt;el-card class="box-card">
            &lt;template #header>
              &lt;div class="card-header">
                &lt;span>行业涨停分布&lt;/span>
              &lt;/div>
            &lt;/template>
            &lt;div class="industry-distribution">
              &lt;el-table :data="industryDistribution" style="width: 100%">
                &lt;el-table-column prop="industry" label="行业" />
                &lt;el-table-column prop="limit_up_count" label="涨停数" />
                &lt;el-table-column prop="stock_names" label="股票">
                  &lt;template #default="scope">
                    &lt;el-tooltip
                      :content="scope.row.stock_names"
                      placement="top"
                      :show-after="200"
                    >
                      &lt;span>{{ scope.row.stock_names }}&lt;/span>
                    &lt;/el-tooltip>
                  &lt;/template>
                &lt;/el-table-column>
              &lt;/el-table>
            &lt;/div>
          &lt;/el-card>
        &lt;/el-col>
      &lt;/el-row>

      &lt;el-row :gutter="20" class="mt-4">
        &lt;!-- 最强涨停股 -->
        &lt;el-col :span="12">
          &lt;el-card class="box-card">
            &lt;template #header>
              &lt;div class="card-header">
                &lt;span>最强涨停股（封单金额排序）&lt;/span>
              &lt;/div>
            &lt;/template>
            &lt;div class="strongest-stocks">
              &lt;el-table :data="strongestStocks" style="width: 100%">
                &lt;el-table-column prop="name" label="名称" />
                &lt;el-table-column prop="industry" label="行业" />
                &lt;el-table-column prop="fd_amount" label="封单金额">
                  &lt;template #default="scope">
                    {{ formatAmount(scope.row.fd_amount) }}
                  &lt;/template>
                &lt;/el-table-column>
                &lt;el-table-column prop="limit_times" label="连板数" />
                &lt;el-table-column prop="turnover_ratio" label="换手率">
                  &lt;template #default="scope">
                    {{ formatPercent(scope.row.turnover_ratio) }}
                  &lt;/template>
                &lt;/el-table-column>
              &lt;/el-table>
            &lt;/div>
          &lt;/el-card>
        &lt;/el-col>

        &lt;!-- 最快涨停股 -->
        &lt;el-col :span="12">
          &lt;el-card class="box-card">
            &lt;template #header>
              &lt;div class="card-header">
                &lt;span>最快涨停股（首次封板时间）&lt;/span>
              &lt;/div>
            &lt;/template>
            &lt;div class="fastest-stocks">
              &lt;el-table :data="fastestStocks" style="width: 100%">
                &lt;el-table-column prop="name" label="名称" />
                &lt;el-table-column prop="industry" label="行业" />
                &lt;el-table-column prop="first_time" label="封板时间" />
                &lt;el-table-column prop="fd_amount" label="封单金额">
                  &lt;template #default="scope">
                    {{ formatAmount(scope.row.fd_amount) }}
                  &lt;/template>
                &lt;/el-table-column>
                &lt;el-table-column prop="limit_times" label="连板数" />
              &lt;/el-table>
            &lt;/div>
          &lt;/el-card>
        &lt;/el-col>
      &lt;/el-row>

      &lt;el-row :gutter="20" class="mt-4">
        &lt;!-- 尾盘涨停股 -->
        &lt;el-col :span="12">
          &lt;el-card class="box-card">
            &lt;template #header>
              &lt;div class="card-header">
                &lt;span>尾盘涨停股（14:30后）&lt;/span>
              &lt;/div>
            &lt;/template>
            &lt;div class="last-stocks">
              &lt;el-table :data="lastStocks" style="width: 100%">
                &lt;el-table-column prop="name" label="名称" />
                &lt;el-table-column prop="industry" label="行业" />
                &lt;el-table-column prop="last_time" label="封板时间" />
                &lt;el-table-column prop="fd_amount" label="封单金额">
                  &lt;template #default="scope">
                    {{ formatAmount(scope.row.fd_amount) }}
                  &lt;/template>
                &lt;/el-table-column>
                &lt;el-table-column prop="limit_times" label="连板数" />
              &lt;/el-table>
            &lt;/div>
          &lt;/el-card>
        &lt;/el-col>

        &lt;!-- 炸板股统计 -->
        &lt;el-col :span="12">
          &lt;el-card class="box-card">
            &lt;template #header>
              &lt;div class="card-header">
                &lt;span>炸板股统计&lt;/span>
              &lt;/div>
            &lt;/template>
            &lt;div class="broken-stocks">
              &lt;el-table :data="brokenStocks" style="width: 100%">
                &lt;el-table-column prop="name" label="名称" />
                &lt;el-table-column prop="industry" label="行业" />
                &lt;el-table-column prop="open_times" label="炸板次数" />
                &lt;el-table-column prop="first_time" label="首次封板" />
                &lt;el-table-column prop="pct_chg" label="涨幅">
                  &lt;template #default="scope">
                    {{ formatPercent(scope.row.pct_chg) }}
                  &lt;/template>
                &lt;/el-table-column>
              &lt;/el-table>
            &lt;/div>
          &lt;/el-card>
        &lt;/el-col>
      &lt;/el-row>
    &lt;/el-card>
  &lt;/div>
&lt;/template>

&lt;script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, Refresh } from '@element-plus/icons-vue'
import axios from 'axios'
import AbnormalAnalysis from '@/components/MarketReview/AbnormalAnalysis.vue'
import * as XLSX from 'xlsx'
import type {
  LimitStat,
  IndustryDistribution,
  StrongestStock,
  AbnormalStock,
  StrongStock,
  BoardTrend,
  SectorLinkage,
  LimitAnalysisResponse
} from '@/types/market'

const selectedDate = ref(new Date().toISOString().split('T')[0].replace(/-/g, ''))
const limitStats = ref&lt;LimitStat[]>([])
const industryDistribution = ref&lt;IndustryDistribution[]>([])
const strongestStocks = ref&lt;StrongestStock[]>([])
const fastestStocks = ref&lt;StrongestStock[]>([])
const lastStocks = ref&lt;StrongestStock[]>([])
const brokenStocks = ref&lt;StrongestStock[]>([])
const abnormalStocks = ref&lt;AbnormalStock[]>([])
const strongStocks = ref&lt;StrongStock[]>([])
const boardTrend = ref&lt;BoardTrend[]>([])
const sectorLinkage = ref&lt;SectorLinkage[]>([])

const fetchData = async () => {
  try {
    const response = await axios.get&lt;LimitAnalysisResponse>(`/api/v1/limit-analysis/${selectedDate.value}`)
    const data = response.data
    
    limitStats.value = data.limit_stats
    industryDistribution.value = data.industry_distribution
    strongestStocks.value = data.strongest_stocks
    fastestStocks.value = data.fastest_stocks
    lastStocks.value = data.last_stocks
    brokenStocks.value = data.broken_stocks
    abnormalStocks.value = data.abnormal_stocks
    strongStocks.value = data.strong_stocks
    boardTrend.value = data.board_trend
    sectorLinkage.value = data.sector_linkage
  } catch (error) {
    ElMessage.error('获取数据失败：' + (error as Error).message)
  }
}

const formatAmount = (value: number) => {
  if (!value) return '0'
  return (value / 10000).toFixed(2) + '万'
}

const formatPercent = (value: number) => {
  if (!value) return '0%'
  return value.toFixed(2) + '%'
}

const exportData = () => {
  try {
    const wb = XLSX.utils.book_new()
    
    const limitStatsWS = XLSX.utils.json_to_sheet(limitStats.value)
    XLSX.utils.book_append_sheet(wb, limitStatsWS, '涨停统计')
    
    const abnormalWS = XLSX.utils.json_to_sheet(abnormalStocks.value)
    XLSX.utils.book_append_sheet(wb, abnormalWS, '异动股分析')
    
    const strongWS = XLSX.utils.json_to_sheet(strongStocks.value)
    XLSX.utils.book_append_sheet(wb, strongWS, '强势股跟踪')
    
    const sectorWS = XLSX.utils.json_to_sheet(sectorLinkage.value)
    XLSX.utils.book_append_sheet(wb, sectorWS, '板块联动分析')
    
    XLSX.writeFile(wb, `市场分析_${selectedDate.value}.xlsx`)
    
    ElMessage.success('数据导出成功')
  } catch (error) {
    ElMessage.error('导出失败：' + (error as Error).message)
  }
}

const refreshData = () => {
  fetchData()
  ElMessage.success('数据已刷新')
}

onMounted(() => {
  fetchData()
})
&lt;/script>

&lt;style scoped>
.limit-analysis-container {
  padding: 20px;
}

.analysis-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-right {
  display: flex;
  gap: 16px;
  align-items: center;
}

.mt-4 {
  margin-top: 16px;
}

:deep(.el-card__header) {
  padding: 10px 20px;
  font-weight: bold;
}
&lt;/style>
