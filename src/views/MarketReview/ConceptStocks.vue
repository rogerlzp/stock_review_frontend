<template>
  <div class="concept-stocks">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>{{ conceptName }} - 成分股列表</span>
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
        :default-sort="{ prop: 'hotNum', order: 'descending' }"
      >
        <el-table-column prop="cons_code" label="股票代码" width="100" />
        <el-table-column prop="cons_name" label="股票名称" width="120" />
        <el-table-column prop="hot_num" label="热度" width="100" sortable />
        <el-table-column prop="desc" label="描述" min-width="300" show-overflow-tooltip />
      </el-table>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getConceptStocks } from '@/services/marketReview'

const route = useRoute()
const loading = ref(false)
const data = ref<any[]>([])
const selectedDate = ref(route.query.date as string)
const conceptName = ref(route.query.name as string)

const handleDateChange = async (val: string) => {
  if (val) {
    await fetchData(val)
  }
}

const fetchData = async (date: string) => {
  loading.value = true
  try {
    const response = await getConceptStocks(date, conceptName.value)
    data.value = response.data.data
  } catch (error) {
    console.error('获取成分股列表失败:', error)
  }
  loading.value = false
}

onMounted(() => {
  if (selectedDate.value && conceptName.value) {
    fetchData(selectedDate.value)
  }
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> 