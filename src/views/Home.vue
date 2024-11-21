<template>
  <div class="home">
    <page-header title="股票分析系统">
      <template #right>
        <el-button type="primary" @click="$router.push('/market-analysis')">
          市场分析
        </el-button>
      </template>
    </page-header>
    
    <el-card class="welcome-card">
      <template #header>
        <div class="card-header">
          <span>欢迎使用</span>
        </div>
      </template>
      <div class="card-content">
        <p>这是一个股票市场分析系统，提供以下功能：</p>
        <ul>
          <li>热门概念板块分析</li>
          <li>机构重点关注股票</li>
          <li>交易活跃度分析</li>
        </ul>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import PageHeader from '../components/common/PageHeader.vue'
</script>

<style scoped>
.welcome-card {
  max-width: 800px;
  margin: 20px auto;
}

.card-content {
  line-height: 1.6;
}

ul {
  padding-left: 20px;
  margin-top: 10px;
}
</style> 