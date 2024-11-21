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
            :disabled-date="disabledDate"
            @change="handleDateChange"
          />
        </div>
      </template>
      <el-table
        v-loading="loading"
        :data="data"
        style="width: 100%"
        :default-sort="{ prop: 'avgChange', order: 'descending' }"
      >
        <el-table-column prop="conceptName" label="概念名称" />
        <el-table-column prop="stockCount" label="成分股数量" sortable />
        <el-table-column prop="avgChange" label="平均涨跌幅" sortable>
          <template #default="{ row }">
            <span :class="row.avgChange >= 0 ? 'up' : 'down'">
              {{ row.avgChange }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              @click="showDetails(row)"
            >
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      title="概念详情"
      width="50%"
    >
      <el-descriptions :column="1" border>
        <el-descriptions-item label="概念描述">
          {{ currentConcept?.description }}
        </el-descriptions-item>
        <el-descriptions-item label="龙头股">
          {{ currentConcept?.leadingStocks.join('、') }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { getConcepts } from '@/services/marketReview'
import type { ConceptData } from '@/types/marketReview'

const loading = ref(false)
const data = ref<ConceptData[]>([])
const selectedDate = ref(new Date())
const dialogVisible = ref(false)
const currentConcept = ref<ConceptData | null>(null)

const disabledDate = (time: Date) => {
  return time.getTime() > Date.now()
}

const handleDateChange = async (val: Date) => {
  if (val) {
    const dateStr = val.toISOString().split('T')[0]
    await fetchData(dateStr)
  }
}

const showDetails = (row: ConceptData) => {
  currentConcept.value = row
  dialogVisible.value = true
}

const fetchData = async (date: string) => {
  loading.value = true
  try {
    const response = await getConcepts(date)
    data.value = response.data
  } catch (error) {
    console.error('获取概念题材数据失败:', error)
  }
  loading.value = false
}

onMounted(() => {
  const today = new Date().toISOString().split('T')[0]
  fetchData(today)
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
}

.down {
  color: #67c23a;
}
</style>
