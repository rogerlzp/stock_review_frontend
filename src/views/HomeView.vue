<template>
  <div class="home">
    <h1>股票市场分析系统</h1>
    <el-button type="primary" @click="$router.push('/market-analysis')">
      开始分析
    </el-button>
  </div>
</template>

<style scoped>
.home {
  text-align: center;
  padding: 20px;
}

h1 {
  margin-bottom: 20px;
}
</style>
