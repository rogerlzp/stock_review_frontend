<template>
  <div class="header">
    <div class="left">
      <h2>股票市场分析系统</h2>
    </div>
    <div class="right">
      <!-- 可以添加用户信息、设置等 -->
    </div>
  </div>
</template>

<script lang="ts" setup>
// Header component logic
</script>

<style lang="scss" scoped>
.header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;

  .left {
    h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 500;
      color: #303133;
    }
  }

  .right {
    display: flex;
    align-items: center;
  }
}
</style>
