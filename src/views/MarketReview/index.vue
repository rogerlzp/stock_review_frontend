<template>
  <div class="market-review">
    <el-container>
      <el-aside width="200px">
        <el-menu
          :default-active="selectedKeys"
          class="menu"
          @select="handleSelect"
        >
          <el-menu-item index="overview">
            <router-link to="/market-review/overview">市场概览</router-link>
          </el-menu-item>
          <el-menu-item index="sector-flow">
            <router-link to="/market-review/sector-flow">板块资金流向</router-link>
          </el-menu-item>
          <el-menu-item index="top-list">
            <router-link to="/market-review/top-list">龙虎榜数据</router-link>
          </el-menu-item>
          <el-menu-item index="concepts">
            <router-link to="/market-review/concepts">概念题材分析</router-link>
          </el-menu-item>
          <el-menu-item index="limit-up">
            <router-link to="/market-review/limit-up">涨停板分析</router-link>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default defineComponent({
  name: 'MarketReview',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const selectedKeys = ref(route.path.split('/').pop() || 'overview')

    const handleSelect = (key: string) => {
      selectedKeys.value = key
    }

    return {
      selectedKeys,
      handleSelect
    }
  }
})
</script>

<style scoped>
.market-review {
  min-height: 100vh;
}

.menu {
  height: 100%;
  border-right: solid 1px #e6e6e6;
}

:deep(.el-menu-item a) {
  text-decoration: none;
  color: inherit;
}
</style>
