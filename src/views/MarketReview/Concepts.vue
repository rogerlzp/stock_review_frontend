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
        <el-table-column prop="tsCode" label="概念代码" width="120" />
        <el-table-column prop="conceptName" label="概念名称" min-width="120" />
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
        <el-table-column prop="stockCount" label="成分股数量" width="100" sortable />
        <el-table-column prop="hotNum" label="热度" width="100" sortable>
          <template #default="{ row }">
            {{ row.hotNum }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="300" show-overflow-tooltip />
        <el-table-column fixed="right" label="操作" width="120">
          <template #default="{ row }">
            <el-button link type="primary" @click="showStockList(row)">
              成分股列表
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { getConcepts } from '@/services/marketReview'
import type { ConceptData } from '@/types/marketReview'
import { formatNumber, formatPercent } from '@/utils/format'
import { useRouter } from 'vue-router'

const router = useRouter()

const loading = ref(false)
const data = ref<ConceptData[]>([])
const selectedDate = ref(new Date())

const handleDateChange = async (val: string) => {
  if (val) {
    await fetchData(val)
  }
}

const getValueClass = (value: number) => {
  if (!value) return ''
  return value > 0 ? 'up' : 'down'
}

const showStockList = async (row: ConceptData) => {
  router.push({
    path: '/market-review/concept-stocks',
    query: {
      date: selectedDate.value,
      name: row.conceptName,
      code: row.tsCode
    }
  })
}

const fetchData = async (date: string) => {
  loading.value = true
  try {
    const response = await getConcepts(date)
    if (response.data) {
      data.value = response.data
    } else {
      data.value = []
      console.warn('概念数据格式不正确:', response)
    }
  } catch (error) {
    console.error('获取概念题材数据失败:', error)
    data.value = []
  } finally {
    loading.value = false
  }
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
