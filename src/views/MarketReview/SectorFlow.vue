<template>
  <div class="sector-flow">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <div class="left">
            <span>板块资金流向</span>
            <el-button
              type="primary"
              link
              @click="showColumnSettings = true"
              class="settings-btn"
            >
              <el-icon><Setting /></el-icon>
              列设置
            </el-button>
          </div>
          <el-date-picker
            v-model="selectedDate"
            type="date"
            placeholder="选择日期"
            :disabled-date="disabledDate"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="handleDateChange"
            :clearable="false"
            :editable="false"
          />
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="tableData"
        style="width: 100%"
        :default-sort="{ prop: 'netAmount', order: 'descending' }"
      >
        <el-table-column prop="rank" label="排名" width="80" fixed="left" sortable />
        <el-table-column prop="name" label="板块名称" fixed="left" min-width="120" />

        <template v-for="col in visibleColumns" :key="col.prop">
          <el-table-column v-bind="col">
            <template #default="{ row }" v-if="col.formatter">
              <span :class="getValueClass(row[col.prop])">
                {{ col.formatter(row[col.prop]) }}
              </span>
            </template>
          </el-table-column>
        </template>

        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="showDetails(row)">
              资金明细
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalItems"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>

      <el-dialog
        v-model="showColumnSettings"
        title="列设置"
        width="500px"
      >
        <el-checkbox-group v-model="selectedColumns">
          <div class="column-settings">
            <el-checkbox
              v-for="col in availableColumns"
              :key="col.prop"
              :label="col.prop"
              :disabled="col.required"
            >
              {{ col.label }}
            </el-checkbox>
          </div>
        </el-checkbox-group>
        <template #footer>
          <el-button @click="showColumnSettings = false">取消</el-button>
          <el-button type="primary" @click="saveColumnSettings">
            确定
          </el-button>
        </template>
      </el-dialog>

      <el-dialog
        v-model="dialogVisible"
        :title="`${currentSector?.name || ''} - 资金明细`"
        width="60%"
      >
        <el-descriptions :column="2" border>
          <el-descriptions-item label="超大单">
            <span :class="getValueClass(currentSector?.buyElgAmount)">
              {{ formatAmount(currentSector?.buyElgAmount) }}亿
              ({{ currentSector?.buyElgAmountRate.toFixed(2) }}%)
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="大单">
            <span :class="getValueClass(currentSector?.buyLgAmount)">
              {{ formatAmount(currentSector?.buyLgAmount) }}亿
              ({{ currentSector?.buyLgAmountRate.toFixed(2) }}%)
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="中单">
            <span :class="getValueClass(currentSector?.buyMdAmount)">
              {{ formatAmount(currentSector?.buyMdAmount) }}亿
              ({{ currentSector?.buyMdAmountRate.toFixed(2) }}%)
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="小单">
            <span :class="getValueClass(currentSector?.buySmAmount)">
              {{ formatAmount(currentSector?.buySmAmount) }}亿
              ({{ currentSector?.buySmAmountRate.toFixed(2) }}%)
            </span>
          </el-descriptions-item>
        </el-descriptions>
      </el-dialog>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { Setting } from '@element-plus/icons-vue'
import { getSectorFlow } from '@/services/marketReview'
import type { SectorFlowData } from '@/types/marketReview'
import { formatNumber, formatPercent } from '@/utils/format'

const loading = ref(false)
const data = ref<SectorFlowData[]>([])
const selectedDate = ref(new Date())
const currentPage = ref(1)
const pageSize = ref(10)
const dialogVisible = ref(false)
const currentSector = ref<SectorFlowData | null>(null)

const totalItems = computed(() => data.value.length)

const tableData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return data.value.slice(start, end)
})

const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
}

const disabledDate = (time: Date) => {
  return time.getTime() > Date.now()
}

const handleDateChange = async (val: string) => {
  console.log('Date selected:', val)
  if (val) {
    await fetchData(val)
  }
}

const showDetails = (row: SectorFlowData) => {
  currentSector.value = row
  dialogVisible.value = true
}

const fetchData = async (date: string) => {
  loading.value = true
  try {
    console.log('Fetching sector flow data for date:', date)
    const response = await getSectorFlow(date)
    data.value = response.data.data
    console.log('Processed data:', data.value)
  } catch (error) {
    console.error('获取板块资金流向数据失败:', error)
  }
  loading.value = false
}

const availableColumns = [
  { prop: 'close', label: '收盘点位', sortable: true },
  { prop: 'pctChange', label: '涨跌幅', sortable: true,
    formatter: (val: number) => formatPercent(val) },
  { prop: 'netAmount', label: '净流入(亿)', sortable: true,
    formatter: (val: number) => formatNumber(val, 2) },
  { prop: 'netAmountRate', label: '净占比', sortable: true,
    formatter: (val: number) => formatPercent(val) },
  { prop: 'buyElgAmount', label: '超大单(亿)', sortable: true,
    formatter: (val: number) => formatNumber(val, 2) },
  { prop: 'buyElgAmountRate', label: '超大单占比', sortable: true,
    formatter: (val: number) => formatPercent(val) },
  { prop: 'buyLgAmount', label: '大单(亿)', sortable: true,
    formatter: (val: number) => formatNumber(val, 2) },
  { prop: 'buyLgAmountRate', label: '大单占比', sortable: true,
    formatter: (val: number) => formatPercent(val) },
  { prop: 'buyMdAmount', label: '中单(亿)', sortable: true,
    formatter: (val: number) => formatNumber(val, 2) },
  { prop: 'buyMdAmountRate', label: '中单占比', sortable: true,
    formatter: (val: number) => formatPercent(val) },
  { prop: 'buySmAmount', label: '小单(亿)', sortable: true,
    formatter: (val: number) => formatNumber(val, 2) },
  { prop: 'buySmAmountRate', label: '小单占比', sortable: true,
    formatter: (val: number) => formatPercent(val) },
  { prop: 'hotStock', label: '热门股票' }
]

const defaultColumns = ['pctChange', 'netAmount', 'netAmountRate', 'hotStock']
const selectedColumns = ref(defaultColumns)
const showColumnSettings = ref(false)

const visibleColumns = computed(() =>
  availableColumns.filter(col => selectedColumns.value.includes(col.prop))
)

const saveColumnSettings = () => {
  localStorage.setItem('sectorFlowColumns', JSON.stringify(selectedColumns.value))
  showColumnSettings.value = false
}

const getValueClass = (value: number) => {
  if (!value) return ''
  return value >= 0 ? 'up' : 'down'
}

onMounted(() => {
  const savedColumns = localStorage.getItem('sectorFlowColumns')
  if (savedColumns) {
    selectedColumns.value = JSON.parse(savedColumns)
  }
  const today = new Date()
  selectedDate.value = today
  const dateStr = today.toISOString().split('T')[0]
  fetchData(dateStr)
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.settings-btn {
  display: flex;
  align-items: center;
  gap: 4px;
}

.column-settings {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.up {
  color: #f56c6c;
}

.down {
  color: #67c23a;
}
</style>
