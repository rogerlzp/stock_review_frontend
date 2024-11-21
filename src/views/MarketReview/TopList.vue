<template>
  <div class="top-list">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <div class="left">
            <span>龙虎榜数据</span>
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

      <!-- 统计信息 -->
      <el-descriptions border :column="4" class="stats-info">
        <el-descriptions-item label="上榜个股数">
          {{ data.length }}
        </el-descriptions-item>
        <el-descriptions-item label="总成交额">
          {{ formatNumber(totalAmount) }}亿
        </el-descriptions-item>
        <el-descriptions-item label="机构买入总额">
          {{ formatNumber(totalBuyAmount) }}亿
        </el-descriptions-item>
        <el-descriptions-item label="机构卖出总额">
          {{ formatNumber(totalSellAmount) }}亿
        </el-descriptions-item>
      </el-descriptions>

      <!-- 主表格 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        style="width: 100%; margin-top: 20px;"
        :default-sort="{ prop: 'amount', order: 'descending' }"
      >
        <!-- 固定列 -->
        <el-table-column prop="tsCode" label="代码" width="100" fixed="left" />
        <el-table-column prop="name" label="名称" width="100" fixed="left" />

        <!-- 动态列 -->
        <template v-for="col in visibleColumns" :key="col.prop">
          <el-table-column v-bind="col">
            <template #default="{ row }" v-if="col.formatter">
              <span :class="getValueClass(row[col.prop])">
                {{ col.formatter(row[col.prop]) }}
              </span>
            </template>
          </el-table-column>
        </template>

        <!-- 操作列 -->
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="showDetails(row)">
              交易明细
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页器 -->
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

      <!-- 列设置对话框 -->
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

      <!-- 交易明细弹窗 -->
      <el-dialog
        v-model="dialogVisible"
        :title="`${currentStock?.name || ''} - 交易明细`"
        width="80%"
      >
        <el-descriptions :column="2" border>
          <el-descriptions-item label="上榜理由">
            {{ currentStock?.reason }}
          </el-descriptions-item>
          <el-descriptions-item label="成交额">
            {{ formatNumber(currentStock?.amount || 0) }}亿
          </el-descriptions-item>
          <el-descriptions-item label="买入金额">
            <span :class="getValueClass(currentStock?.buyAmount)">
              {{ formatNumber(currentStock?.buyAmount || 0) }}亿
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="卖出金额">
            <span :class="getValueClass(-currentStock?.sellAmount)">
              {{ formatNumber(currentStock?.sellAmount || 0) }}亿
            </span>
          </el-descriptions-item>
        </el-descriptions>

        <el-tabs v-model="activeTab" class="mt-4">
          <el-tab-pane label="买入机构" name="buy">
            <el-table :data="currentStock?.buyInst || []" border>
              <el-table-column type="index" label="序号" width="80" />
              <el-table-column label="营业部名称" min-width="300">
                <template #default="{ row }">
                  {{ row }}
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="卖出机构" name="sell">
            <el-table :data="currentStock?.sellInst || []" border>
              <el-table-column type="index" label="序号" width="80" />
              <el-table-column label="营业部名称" min-width="300">
                <template #default="{ row }">
                  {{ row }}
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </el-dialog>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { Setting } from '@element-plus/icons-vue'
import { getTopList } from '@/services/marketReview'
import type { TopListData } from '@/types/marketReview'
import { formatNumber, formatPercent } from '@/utils/format'

const loading = ref(false)
const data = ref<TopListData[]>([])
const selectedDate = ref(new Date())
const currentPage = ref(1)
const pageSize = ref(10)
const dialogVisible = ref(false)
const currentStock = ref<TopListData | null>(null)
const activeTab = ref('buy')

// 列设置相关
const showColumnSettings = ref(false)
const defaultColumns = ['close', 'change', 'turnoverRate', 'amount', 'netAmount']
const selectedColumns = ref<string[]>(defaultColumns)

// 可用列配置
const availableColumns = [
  { prop: 'close', label: '收盘价', sortable: true },
  { prop: 'change', label: '涨跌幅', sortable: true,
    formatter: (val: number) => formatPercent(val) },
  { prop: 'turnoverRate', label: '换手率', sortable: true,
    formatter: (val: number) => formatPercent(val) },
  { prop: 'amount', label: '成交额(亿)', sortable: true,
    formatter: (val: number) => formatNumber(val, 2) },
  { prop: 'buyAmount', label: '买入金额(亿)', sortable: true,
    formatter: (val: number) => formatNumber(val, 2) },
  { prop: 'sellAmount', label: '卖出金额(亿)', sortable: true,
    formatter: (val: number) => formatNumber(val, 2) },
  { prop: 'netAmount', label: '净买入(亿)', sortable: true,
    formatter: (val: number) => formatNumber(val, 2) },
  { prop: 'netRate', label: '净买率', sortable: true,
    formatter: (val: number) => formatPercent(val) },
  { prop: 'reason', label: '上榜原因', width: '200' }
]

// 当前可见列
const visibleColumns = computed(() =>
  availableColumns.filter(col => selectedColumns.value.includes(col.prop))
)

// 保存列设置
const saveColumnSettings = () => {
  localStorage.setItem('topListColumns', JSON.stringify(selectedColumns.value))
  showColumnSettings.value = false
}

// 计算汇总数据
const totalItems = computed(() => data.value.length)
const totalAmount = computed(() =>
  data.value.reduce((sum, item) => sum + (item.amount || 0), 0)
)
const totalBuyAmount = computed(() =>
  data.value.reduce((sum, item) => sum + (item.buyAmount || 0), 0)
)
const totalSellAmount = computed(() =>
  data.value.reduce((sum, item) => sum + (item.sellAmount || 0), 0)
)

// 计算当前页的数据
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
  if (val) {
    await fetchData(val)
  }
}

const getValueClass = (value: number | undefined) => {
  if (value === undefined || value === 0) return ''
  return value > 0 ? 'up' : 'down'
}

const showDetails = (row: TopListData) => {
  currentStock.value = row
  dialogVisible.value = true
}

const fetchData = async (date: string) => {
  loading.value = true
  try {
    const response = await getTopList(date)
    data.value = response.data.data
  } catch (error) {
    console.error('获取龙虎榜数据失败:', error)
  }
  loading.value = false
}

onMounted(() => {
  // 加载保存的列设置
  const savedColumns = localStorage.getItem('topListColumns')
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

.stats-info {
  margin-bottom: 20px;
}

.up {
  color: #f56c6c;
}

.down {
  color: #67c23a;
}

.mt-4 {
  margin-top: 16px;
}
</style>
