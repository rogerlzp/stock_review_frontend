<template>
  <div class="technical-analysis">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>技术分析</span>
          <div class="controls">
            <el-autocomplete
              v-model="searchInput"
              :fetch-suggestions="searchStocks"
              placeholder="输入股票代码或名称"
              :trigger-on-focus="false"
              clearable
              @clear="tsCode = ''"
              style="width: 300px; margin-right: 10px"
              @select="handleStockSelect"
              :value-key="searchInput"
            >
              <template #default="{ item }">
                <div class="stock-suggestion">
                  <div class="stock-code">{{ item.ts_code }}</div>
                  <div class="stock-name">{{ item.name }}</div>
                  <div class="stock-info">
                    <el-tag size="small" type="info">{{ item.market }}</el-tag>
                    <el-tag v-if="item.industry" size="small" type="success" style="margin-left: 4px">{{ item.industry }}</el-tag>
                  </div>
                </div>
              </template>
            </el-autocomplete>
            <el-date-picker
              v-model="date"
              type="date"
              placeholder="选择日期"
              format="YYYY-MM-DD"
              value-format="YYYYMMDD"
              :clearable="false"
              @change="handleDateChange"
              style="width: 150px"
            />
          </div>
        </div>
      </template>

      <div v-loading="loading">
        <!-- 技术指标概览 -->
        <div class="overview-section" v-if="data">
          <el-row :gutter="20">
            <el-col :span="6">
              <el-card shadow="hover">
                <template #header>
                  <div class="card-header">
                    <span>趋势分析</span>
                  </div>
                </template>
                <div class="trend-info">
                  <p>短期趋势: <span :class="data?.trend?.short_term">{{ data?.trend?.short_term }}</span></p>
                  <p>中期趋势: <span :class="data?.trend?.medium_term">{{ data?.trend?.medium_term }}</span></p>
                  <p>长期趋势: <span :class="data?.trend?.long_term">{{ data?.trend?.long_term }}</span></p>
                  <p v-if="data?.trend?.ma_cross?.golden_cross" class="signal">
                    <el-tag type="success">金叉信号</el-tag>
                  </p>
                  <p v-if="data?.trend?.ma_cross?.death_cross" class="signal">
                    <el-tag type="danger">死叉信号</el-tag>
                  </p>
                </div>
              </el-card>
            </el-col>
            
            <el-col :span="6">
              <el-card shadow="hover">
                <template #header>
                  <div class="card-header">
                    <span>MACD分析</span>
                  </div>
                </template>
                <div class="macd-info">
                  <p>趋势: <span :class="data?.macd?.trend">{{ data?.macd?.trend }}</span></p>
                  <p>差值: {{ data?.macd?.divergence.toFixed(2) }}</p>
                  <p>信号: <el-tag :type="getMacdTagType(data?.macd?.divergence)">{{ getMacdSignalText(data?.macd?.divergence) }}</el-tag></p>
                </div>
              </el-card>
            </el-col>
            
            <el-col :span="6">
              <el-card shadow="hover">
                <template #header>
                  <div class="card-header">
                    <span>KDJ分析</span>
                  </div>
                </template>
                <div class="kdj-info">
                  <p>K值: {{ data?.kdj?.k.toFixed(2) }}</p>
                  <p>D值: {{ data?.kdj?.d.toFixed(2) }}</p>
                  <p>J值: {{ data?.kdj?.j.toFixed(2) }}</p>
                  <p>信号: 
                    <el-tag :type="getKdjTagType(data?.kdj?.signal)">
                      {{ getKdjSignalText(data?.kdj?.signal) }}
                    </el-tag>
                  </p>
                </div>
              </el-card>
            </el-col>
            
            <el-col :span="6">
              <el-card shadow="hover">
                <template #header>
                  <div class="card-header">
                    <span>RSI分析</span>
                  </div>
                </template>
                <div class="rsi-info">
                  <p>RSI(6): {{ data?.rsi?.rsi6.toFixed(2) }}</p>
                  <p>RSI(12): {{ data?.rsi?.rsi12.toFixed(2) }}</p>
                  <p>RSI(24): {{ data?.rsi?.rsi24.toFixed(2) }}</p>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>

        <!-- 更多分析内容将在这里添加 -->
        <el-tabs v-model="activeTab" class="analysis-tabs">
          <el-tab-pane label="趋势分析" name="trend">
            <div class="chart-section" v-if="data?.trend">
              <TrendChart :price-data="priceData" />
              <div class="analysis-text">
                <h3>趋势分析结果</h3>
                <el-descriptions :column="2" border v-if="data?.trend">
                  <el-descriptions-item label="短期趋势">
                    <el-tag :type="getTrendTagType(data.trend.short_term)">
                      {{ data.trend.short_term }}
                    </el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="中期趋势">
                    <el-tag :type="getTrendTagType(data.trend.medium_term)">
                      {{ data.trend.medium_term }}
                    </el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="长期趋势">
                    <el-tag :type="getTrendTagType(data.trend.long_term)">
                      {{ data.trend.long_term }}
                    </el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="均线信号">
                    <div class="signal-tags">
                      <el-tag v-if="data.trend.ma_cross.golden_cross" type="success">金叉</el-tag>
                      <el-tag v-if="data.trend.ma_cross.death_cross" type="danger">死叉</el-tag>
                      <el-tag v-if="!data.trend.ma_cross.golden_cross && !data.trend.ma_cross.death_cross" type="info">无信号</el-tag>
                    </div>
                  </el-descriptions-item>
                </el-descriptions>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="MACD分析" name="macd">
            <div class="chart-section" v-if="data?.macd">
              <MacdChart :macd-data="macdData" />
              <div class="analysis-text">
                <h3>MACD分析结果</h3>
                <el-descriptions :column="2" border v-if="data?.macd">
                  <el-descriptions-item label="MACD趋势">
                    <el-tag :type="getTrendTagType(data.macd.trend)">
                      {{ data.macd.trend }}
                    </el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="MACD差值">
                    {{ data.macd.divergence.toFixed(2) }}
                  </el-descriptions-item>
                  <el-descriptions-item label="信号">
                    <el-tag :type="getMacdTagType(data.macd.divergence)">
                      {{ getMacdSignalText(data.macd.divergence) }}
                    </el-tag>
                  </el-descriptions-item>
                </el-descriptions>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="KDJ分析" name="kdj">
            <div class="chart-section" v-if="data?.kdj">
              <KdjChart :kdj-data="kdjData" />
              <div class="analysis-text">
                <h3>KDJ分析结果</h3>
                <el-descriptions :column="2" border v-if="data?.kdj">
                  <el-descriptions-item label="K值">{{ data.kdj.k.toFixed(2) }}</el-descriptions-item>
                  <el-descriptions-item label="D值">{{ data.kdj.d.toFixed(2) }}</el-descriptions-item>
                  <el-descriptions-item label="J值">{{ data.kdj.j.toFixed(2) }}</el-descriptions-item>
                  <el-descriptions-item label="信号">
                    <el-tag :type="getKdjTagType(data.kdj.signal)">
                      {{ getKdjSignalText(data.kdj.signal) }}
                    </el-tag>
                  </el-descriptions-item>
                </el-descriptions>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="RSI分析" name="rsi">
            <div class="chart-section" v-if="data?.rsi">
              <div class="analysis-text">
                <h3>RSI分析结果</h3>
                <el-descriptions :column="2" border v-if="data?.rsi">
                  <el-descriptions-item label="RSI(6)">
                    {{ data.rsi.rsi6.toFixed(2) }}
                    <el-tag :type="getRsiTagType(data.rsi.rsi6)" size="small" style="margin-left: 8px">
                      {{ getRsiSignalText(data.rsi.rsi6) }}
                    </el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="RSI(12)">
                    {{ data.rsi.rsi12.toFixed(2) }}
                    <el-tag :type="getRsiTagType(data.rsi.rsi12)" size="small" style="margin-left: 8px">
                      {{ getRsiSignalText(data.rsi.rsi12) }}
                    </el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="RSI(24)">
                    {{ data.rsi.rsi24.toFixed(2) }}
                    <el-tag :type="getRsiTagType(data.rsi.rsi24)" size="small" style="margin-left: 8px">
                      {{ getRsiSignalText(data.rsi.rsi24) }}
                    </el-tag>
                  </el-descriptions-item>
                </el-descriptions>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { getTechnicalIndicators } from '@/services/technical'
import type { TechnicalAnalysis } from '@/types/technical'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import TrendChart from '@/components/TechnicalCharts/TrendChart.vue'
import MacdChart from '@/components/TechnicalCharts/MacdChart.vue'
import KdjChart from '@/components/TechnicalCharts/KdjChart.vue'

interface StockSuggestion {
  ts_code: string;
  symbol: string;
  name: string;
  market: string;
  industry?: string;
}

const route = useRoute()
const loading = ref(false)
const data = ref<TechnicalAnalysis>()
const searchInput = ref('')
const tsCode = ref(route.query.ts_code as string || '')
const date = ref(route.query.date as string || '')
const activeTab = ref('trend')

// 图表数据计算
const priceData = computed(() => {
  if (!data.value) return {
    dates: [],
    prices: [],
    ma5: [],
    ma10: [],
    ma20: [],
    ma30: [],
    volume: []
  }

  return {
    dates: data.value.dates,
    prices: data.value.prices,
    ma5: data.value.ma5,
    ma10: data.value.ma10,
    ma20: data.value.ma20,
    ma30: data.value.ma30,
    volume: data.value.volume
  }
})

const macdData = computed(() => {
  if (!data.value) return {
    dates: [],
    dif: [],
    dea: [],
    macd: []
  }

  return {
    dates: data.value.dates,
    dif: data.value.macd.dif,
    dea: data.value.macd.dea,
    macd: data.value.macd.hist
  }
})

const kdjData = computed(() => {
  if (!data.value) return {
    dates: [],
    k: [],
    d: [],
    j: []
  }

  return {
    dates: data.value.dates,
    k: data.value.kdj.k_values,
    d: data.value.kdj.d_values,
    j: data.value.kdj.j_values
  }
})

// 辅助函数
const getTrendTagType = (trend: string) => {
  switch (trend) {
    case 'up':
      return 'success'
    case 'down':
      return 'danger'
    default:
      return 'info'
  }
}

const getRsiTagType = (value: number) => {
  if (value >= 70) return 'danger'
  if (value <= 30) return 'warning'
  return 'info'
}

const getRsiSignalText = (value: number) => {
  if (value >= 70) return '超买'
  if (value <= 30) return '超卖'
  return '中性'
}

const getKdjTagType = (signal: string) => {
  switch (signal) {
    case 'oversold':
      return 'success'
    case 'overbought':
      return 'danger'
    case 'golden_cross':
      return 'warning'
    case 'death_cross':
      return 'info'
    default:
      return 'info'
  }
}

const getKdjSignalText = (signal: string) => {
  switch (signal) {
    case 'oversold':
      return '超卖'
    case 'overbought':
      return '超买'
    case 'golden_cross':
      return '金叉'
    case 'death_cross':
      return '死叉'
    default:
      return '中性'
  }
}

const getMacdSignalText = (divergence: number) => {
  if (divergence > 0) return '多头信号'
  if (divergence < 0) return '空头信号'
  return '中性信号'
}

const getMacdTagType = (divergence: number) => {
  if (divergence > 0) return 'success'
  if (divergence < 0) return 'danger'
  return 'info'
}

const searchStocks = async (query: string, cb: (suggestions: StockSuggestion[]) => void) => {
  if (!query) {
    cb([])
    return
  }
  
  try {
    const response = await axios.get(`/api/stock/search?query=${encodeURIComponent(query)}`)
    if (response.data && Array.isArray(response.data)) {
      cb(response.data)
    } else {
      cb([])
    }
  } catch (error) {
    console.error('搜索股票失败:', error)
    cb([])
  }
}

const handleStockSelect = (item: StockSuggestion) => {
  if (item) {
    searchInput.value = `${item.ts_code} ${item.name}`
    tsCode.value = item.ts_code
    if (date.value) {
      fetchData()
    }
  }
}

const fetchData = async () => {
  if (!tsCode.value) {
    ElMessage.warning('请输入股票代码')
    return
  }
  
  loading.value = true
  try {
    const response = await getTechnicalIndicators(tsCode.value, date.value)
    data.value = response.data.data
  } catch (error) {
    ElMessage.error('获取技术指标数据失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleDateChange = async () => {
  if (date.value && tsCode.value) {
    await fetchData()
  }
}

onMounted(() => {
  if (date.value && tsCode.value) {
    fetchData()
  }
})
</script>

<style lang="scss" scoped>
.technical-analysis {
  padding: 20px;

  .box-card {
    margin-bottom: 20px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .controls {
    display: flex;
    gap: 16px;
    align-items: center;
  }

  .overview-section {
    margin-top: 20px;
    margin-bottom: 20px;

    .el-card {
      height: 100%;
      
      .el-card__header {
        padding: 10px 20px;
        font-weight: bold;
      }

      .el-card__body {
        padding: 15px;
      }
    }
  }

  .analysis-tabs {
    margin-top: 20px;

    .chart-section {
      padding: 20px;
      background-color: #f5f7fa;
      border-radius: 4px;
      
      .analysis-text {
        margin-top: 20px;
        
        h3 {
          margin-bottom: 16px;
          font-size: 16px;
          font-weight: bold;
        }
      }
    }
  }

  .trend-info, .macd-info, .kdj-info, .rsi-info {
    p {
      margin: 8px 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .signal-tags {
    display: flex;
    gap: 8px;
  }

  :deep(.el-descriptions__cell) {
    padding: 12px 16px;
  }
}
</style>
