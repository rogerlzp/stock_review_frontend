<template>
  <div class="limit-up">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <h2 class="title">涨停板分析</h2>
          <div class="filter-section">
            <el-date-picker
              v-model="selectedDate"
              type="date"
              placeholder="选择日期"
              :disabled-date="disabledDate"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 200px;"
              :clearable="false"
              :editable="false"
              @change="handleDateChange"
            />
            <el-select 
              v-model="filterType" 
              placeholder="选择筛选类型" 
              style="width: 150px; margin-left: 15px;"
            >
              <el-option label="连板数" value="limit_times" />
              <el-option label="涨停统计" value="up_stat" />
            </el-select>
            
            <!-- 连板数选择 -->
            <el-select 
              v-if="filterType === 'limit_times'" 
              v-model="limitTimes" 
              placeholder="选择连板数"
              style="width: 150px; margin-left: 15px;"
            >
              <el-option label="二连板" :value="2" />
              <el-option label="三连板" :value="3" />
              <el-option label="四连板" :value="4" />
              <el-option label="五连板" :value="5" />
            </el-select>

            <!-- 涨停统计选择 -->
            <el-select 
              v-if="filterType === 'up_stat'" 
              v-model="upStat" 
              placeholder="选择涨停统计"
              style="width: 150px; margin-left: 15px;"
            >
              <el-option label="4天3板" value="3/4" />
              <el-option label="5天3板" value="3/5" />
              <el-option label="5天4板" value="4/5" />
            </el-select>

            <el-button 
              type="primary" 
              @click="handleSearch" 
              style="margin-left: 15px; width: 100px;"
              :disabled="!isSearchEnabled"
            >
              查询
            </el-button>
          </div>
        </div>
      </template>
      <el-table
        :data="tableData"
        style="width: 100%"
        border
        v-loading="loading"
      >
        <el-table-column
          type="index"
          label="序号"
          width="60"
          fixed
        />
        <el-table-column
          prop="stockCode"
          label="代码"
          width="100"
          fixed
        />
        <el-table-column
          prop="stockName"
          label="名称"
          width="100"
          fixed
        >
          <template #default="{ row }">
            <router-link 
              :to="{ 
                name: 'StockDetail',
                params: { 
                  code: row.stockCode,
                  date: selectedDate
                }
              }"
              class="stock-link"
            >
              {{ row.stockName }}
            </router-link>
          </template>
        </el-table-column>
        <el-table-column
          prop="limitTimes"
          label="连板数"
          width="100"
          sortable="custom"
        >
          <template #default="{ row }">
            <el-tag :type="getLimitTimesType(row.limitTimes)" v-if="row.limitTimes">
              {{ row.limitTimes }}连板
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="upStat"
          label="涨停统计"
          width="100"
        >
          <template #default="{ row }">
            <el-tooltip
              content="首次涨停/涨停次数"
              placement="top"
            >
              <span>{{ row.upStat || '-' }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column
          prop="limitUpTime"
          label="涨停时间"
          width="120"
          sortable="custom"
        >
          <template #default="{ row }">
            {{ row.limitUpTime || '-' }}
          </template>
        </el-table-column>
        <el-table-column
          prop="turnoverRate"
          label="换手率"
          width="100"
          sortable="custom"
        >
          <template #default="{ row }">
            {{ row.turnoverRate ? formatNumber(row.turnoverRate) + '%' : '-' }}
          </template>
        </el-table-column>
        <el-table-column
          prop="amount"
          label="成交额(亿)"
          width="120"
          sortable="custom"
        >
          <template #default="{ row }">
            {{ row.amount ? formatNumber(row.amount / 100000000) : '-' }}
          </template>
        </el-table-column>
        <el-table-column
          prop="bidAmount"
          label="封单金额(亿)"
          width="120"
          sortable="custom"
        >
          <template #default="{ row }">
            {{ row.bidAmount ? formatNumber(row.bidAmount / 100000000) : '-' }}
          </template>
        </el-table-column>
        <el-table-column
          prop="theme"
          label="题材"
          min-width="200"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            {{ row.theme || '-' }}
          </template>
        </el-table-column>
        <el-table-column
          prop="limitUpReason"
          label="涨停原因"
          min-width="200"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span class="clickable" @click="showReason(row)">
              {{ row.limitUpReason || '-' }}
            </span>
          </template>
        </el-table-column>
      </el-table>

      <!-- 添加分页器 -->
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
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      title="涨停原因"
      width="40%"
    >
      <p>{{ currentReason }}</p>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios';
import { ElMessage } from 'element-plus'

interface LimitUpData {
  stockCode: string
  stockName: string
  limitTimes: number
  upStat: string
  limitUpTime: string
  turnoverRate: number
  amount: number
  bidAmount: number
  theme: string
  limitUpReason: string
  status: string
  netChange: number
  freeFloat: number
}

const loading = ref(false)
const data = ref<LimitUpData[]>([])
const selectedDate = ref('')
const filterType = ref('limit_times')
const limitTimes = ref<number | null>(null)
const upStat = ref<string | null>(null)
const currentPage = ref(1)
const pageSize = ref(10)
const dialogVisible = ref(false)
const currentReason = ref('')

// 计算当前页的数据
const tableData = computed(() => {
  console.log('Computing tableData:', data.value) // 添加日志
  return data.value
})

// 计算总条目数
const totalItems = computed(() => data.value.length)

const isSearchEnabled = computed(() => {
  if (!selectedDate.value) return false;
  
  if (filterType.value === 'limit_times') {
    return limitTimes.value !== null;
  } else if (filterType.value === 'up_stat') {
    return upStat.value !== null;
  }
  return false;
});

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

const formatAmount = (value: number) => {
  return (value / 100000000).toFixed(2)  // 转换为亿元
}

const formatNumber = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '-'
  if (value === 0) return '0.00'
  return value.toFixed(2)
}

const getLimitTimesType = (limitTimes: number): 'success' | 'warning' | 'danger' | '' => {
  if (!limitTimes) return ''
  if (limitTimes >= 3) return 'danger'
  if (limitTimes === 2) return 'warning'
  return 'success'
}

const showReason = (row: LimitUpData) => {
  currentReason.value = row.limitUpReason
  dialogVisible.value = true
}

// 初始化日期为今天
const initDate = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  selectedDate.value = `${year}-${month}-${day}`
}

// 修改 fetchData 函数
const fetchData = async (params: any = {}) => {
  loading.value = true
  try {
    // 如果没有传入 trade_date，使用选中的日期
    if (!params.trade_date && selectedDate.value) {
      params.trade_date = selectedDate.value.replace(/-/g, '')
    }

    console.log('Fetching data with params:', params) // 添加日志
    const response = await axios.get('/api/market-review/limit-up', { params })
    console.log('API Response:', response.data) // 添加日志

    if (response.data && Array.isArray(response.data)) {
      data.value = response.data.map(item => {
        console.log('Processing item:', item) // 添加日志
        return {
          stockCode: item.stockCode,
          stockName: item.stockName,
          limitTimes: item.limitTimes,
          upStat: item.upStat,
          limitUpTime: item.limitUpTime,
          turnoverRate: item.turnoverRate,
          amount: item.amount,
          bidAmount: item.bidAmount,
          theme: item.theme,
          limitUpReason: item.limitUpReason,
          status: item.status,
          netChange: item.netChange,
          freeFloat: item.freeFloat
        }
      })
      console.log('Processed data:', data.value) // 添加日志
    } else {
      data.value = []
      ElMessage.warning('未找到符合条件的数据')
    }
  } catch (error) {
    console.error('Error fetching limit up data:', error)
    ElMessage.error('获取数据失败')
    data.value = []
  } finally {
    loading.value = false
  }
}

// 处理日期变化
const handleDateChange = async (val: string) => {
  console.log('Date changed:', val) // 添加日志
  if (val) {
    await fetchData({ trade_date: val.replace(/-/g, '') })
  }
}

// 处理搜索
const handleSearch = async () => {
  if (!selectedDate.value) {
    ElMessage.warning('请选择日期')
    return
  }

  const params: any = {
    trade_date: selectedDate.value.replace(/-/g, '')
  }

  if (filterType.value === 'limit_times' && limitTimes.value !== null) {
    params.limit_times = limitTimes.value
  } else if (filterType.value === 'up_stat' && upStat.value) {
    params.up_stat = upStat.value
  }

  await fetchData(params)
}

// 组件挂载时初始化日期并加载数据
onMounted(async () => {
  initDate()
  await handleSearch()
})
</script>

<style scoped>
.limit-up {
  padding: 20px;
}

.card-header {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
  color: #303133;
}

.filter-section {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.el-button {
  height: 40px;
}

:deep(.el-input__wrapper) {
  height: 40px;
}

:deep(.el-select) {
  width: 150px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
