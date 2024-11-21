<template>
  <div class="concepts">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>概念题材分析</span>
          <el-date-picker
            v-model="selectedDate"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="handleDateChange"
          />
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="data"
        style="width: 100%"
        :default-sort="{ prop: 'limitUpCount', order: 'descending' }"
      >
        <el-table-column prop="conceptName" label="概念名称" min-width="120" />
        <el-table-column prop="stockCount" label="成分股数量" width="100" sortable />
        <el-table-column prop="limitUpCount" label="涨停数量" width="100" sortable>
          <template #default="{ row }">
            <span :class="getValueClass(row.limitUpCount)">
              {{ row.limitUpCount }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="upCount" label="上涨家数" width="100" sortable>
          <template #default="{ row }">
            <span :class="getValueClass(row.upCount)">
              {{ row.upCount }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="hotNum" label="热度" width="100" sortable>
          <template #default="{ row }">
            {{ row.hotNum }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button link type="primary" @click="showStockList(row)">
              成分股列表
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 使用抽屉组件替代弹窗 -->
      <el-drawer
        v-model="drawerVisible"
        :title="`${currentConcept?.conceptName || ''} - 成分股列表`"
        size="70%"
        :destroy-on-close="true"
      >
        <!-- 统计信息栏 -->
        <el-descriptions border :column="4" class="mb-4">
          <el-descriptions-item label="成分股数量">
            {{ currentConcept?.stockCount || 0 }}
          </el-descriptions-item>
          <el-descriptions-item label="涨停数量">
            <span :class="getValueClass(currentConcept?.limitUpCount)">
              {{ currentConcept?.limitUpCount || 0 }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="上涨家数">
            <span :class="getValueClass(currentConcept?.upCount)">
              {{ currentConcept?.upCount || 0 }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="热度">
            {{ currentConcept?.hotNum || 0 }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- Tab切换 -->
        <el-tabs v-model="activeTab" class="mb-4">
          <el-tab-pane label="全部成分股" name="all" />
          <el-tab-pane label="涨停股票" name="limit-up" />
          <el-tab-pane label="上涨股票" name="up" />
          <el-tab-pane label="下跌股票" name="down" />
        </el-tabs>

        <!-- 成分股表格 -->
        <el-table
          v-loading="stockListLoading"
          :data="filteredStockList"
          style="width: 100%"
          :default-sort="{ prop: 'pct_chg', order: 'descending' }"
        >
          <el-table-column prop="ts_code" label="代码" width="100" />
          <el-table-column prop="name" label="名称" width="120" />
          <el-table-column prop="pct_chg" label="涨跌幅" width="100" sortable>
            <template #default="{ row }">
              <span :class="getValueClass(row.pct_chg)">
                {{ formatPercent(row.pct_chg) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="amount" label="成交额(亿)" width="120" sortable>
            <template #default="{ row }">
              {{ formatNumber(row.amount / 100000000, 2) }}
            </template>
          </el-table-column>
          <el-table-column prop="turnover_rate" label="换手率" width="100" sortable>
            <template #default="{ row }">
              {{ formatPercent(row.turnover_rate) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="120" />
          <el-table-column prop="lu_time" label="涨停时间" width="120" sortable />
          <el-table-column prop="lu_desc" label="涨停原因" min-width="200" show-overflow-tooltip />
        </el-table>
      </el-drawer>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { getConcepts, getConceptStocks } from '@/services/marketReview'
import type { ConceptData } from '@/types/marketReview'
import { formatNumber, formatPercent } from '@/utils/format'

const loading = ref(false)
const data = ref<ConceptData[]>([])
const selectedDate = ref(new Date())
const drawerVisible = ref(false)
const currentConcept = ref<ConceptData | null>(null)
const stockListLoading = ref(false)
const stockList = ref<any[]>([])
const activeTab = ref('all')

const handleDateChange = async (val: string) => {
  if (val) {
    await fetchData(val)
  }
}

const getValueClass = (value: number) => {
  if (!value) return ''
  return value > 0 ? 'up' : 'down'
}

// 计算属性：根据tab筛选股票列表
const filteredStockList = computed(() => {
  switch (activeTab.value) {
    case 'limit-up':
      return stockList.value.filter(stock => stock.lu_time)
    case 'up':
      return stockList.value.filter(stock => stock.pct_chg > 0)
    case 'down':
      return stockList.value.filter(stock => stock.pct_chg < 0)
    default:
      return stockList.value
  }
})

// 修改展示成分股列表的方法
const showStockList = async (row: ConceptData) => {
  currentConcept.value = row
  drawerVisible.value = true
  stockListLoading.value = true
  try {
    const response = await getConceptStocks(
      formatDate(selectedDate.value), 
      row.tsCode
    )
    stockList.value = response.data.data
  } catch (error) {
    console.error('获取成分股列表失败:', error)
  }
  stockListLoading.value = false
}

const fetchData = async (date: string) => {
  loading.value = true
  try {
    const response = await getConcepts(date)
    data.value = response.data.data
  } catch (error) {
    console.error('获取概念题材数据失败:', error)
  }
  loading.value = false
}

// 初始化加载
const today = new Date()
selectedDate.value = today
const dateStr = today.toISOString().split('T')[0]
fetchData(dateStr)
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.up {
  color: #f56c6c;
}

.down {
  color: #67c23a;
}

.mb-4 {
  margin-bottom: 16px;
}
</style>
