<template>
  <div class="concept-stocks">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>{{ name }} - 成分股列表</span>
          <el-date-picker
            v-model="date"
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
        :default-sort="{ prop: 'pct_chg', order: 'descending' }"
      >
        <el-table-column prop="ts_code" label="股票代码" width="100" />
        <el-table-column prop="name" label="股票名称" width="120" />
        <el-table-column prop="pct_chg" label="涨跌幅" width="100" sortable>
          <template #default="{ row }">
            <span :class="getValueClass(row.pct_chg)">
              {{ formatNumber(row.pct_chg) }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="成交额" width="120" sortable>
          <template #default="{ row }">
            {{ formatAmount(row.amount) }}
          </template>
        </el-table-column>
        <el-table-column prop="turnover_rate" label="换手率" width="100" sortable>
          <template #default="{ row }">
            {{ formatNumber(row.turnover_rate) }}%
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status.includes('连板') ? 'danger' : 'info'" size="small">
              {{ row.status || '-' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lu_time" label="涨停时间" width="100">
          <template #default="{ row }">
            {{ row.lu_time || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="lu_desc" label="涨停原因" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.lu_desc || '-' }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getConceptStocks } from '@/services/marketReview'
import { ElMessage } from 'element-plus'
import { formatNumber, formatAmount } from '@/utils/format'

const route = useRoute()
const loading = ref(false)
const data = ref<any[]>([])
const date = ref(route.query.date as string)
const name = ref(route.query.name as string)
const code = ref(route.query.code as string)

const getValueClass = (value: number) => {
  if (value > 0) return 'up'
  if (value < 0) return 'down'
  return ''
}

const handleDateChange = async (val: string) => {
  if (val) {
    await fetchData()
  }
}

const fetchData = async () => {
  if (!code.value) {
    ElMessage.error('概念代码不能为空')
    return
  }
  
  loading.value = true
  try {
    const response = await getConceptStocks(date.value, code.value)
    if (response.data && Array.isArray(response.data)) {
      data.value = response.data
    } else {
      data.value = []
      ElMessage.warning('没有找到相关成分股数据')
    }
  } catch (error) {
    console.error('获取成分股列表失败:', error)
    ElMessage.error('获取概念成分股失败')
    data.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (date.value && code.value) {
    fetchData()
  }
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.up {
  color: #f56c6c;
  font-weight: bold;
}

.down {
  color: #67c23a;
  font-weight: bold;
}
</style>
