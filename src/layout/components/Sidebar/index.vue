<template>
  <div class="sidebar">
    <el-menu
      :default-active="activeMenu"
      class="menu"
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#409EFF"
      :router="true"
      :default-openeds="defaultOpeneds"
    >
      <template v-for="item in menuItems" :key="item.path">
        <el-menu-item-group>
          <template #title>
            <el-icon v-if="item.icon"><component :is="item.icon" /></el-icon>
            <span>{{ item.title }}</span>
          </template>
          <el-menu-item
            v-for="child in item.children"
            :key="child.path"
            :index="child.path"
          >
            {{ child.title }}
          </el-menu-item>
        </el-menu-item-group>
      </template>
    </el-menu>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { menuItems } from './menu'

export default defineComponent({
  name: 'Sidebar',
  setup() {
    const route = useRoute()
    const activeMenu = computed(() => route.path)
    const defaultOpeneds = ref(['1']) // 默认展开所有菜单组

    return {
      menuItems,
      activeMenu,
      defaultOpeneds
    }
  }
})
</script>

<style scoped>
.sidebar {
  height: 100%;
}

.menu {
  height: 100%;
  border: none;
}

:deep(.el-menu-item) {
  border-left: 3px solid transparent;
}

:deep(.el-menu-item.is-active) {
  border-left: 3px solid #409EFF;
  background-color: #263445 !important;
}

:deep(.el-menu-item-group__title) {
  padding: 12px 20px;
  font-size: 14px;
  color: #bfcbd9;
}

:deep(.el-menu-item) {
  min-width: 160px;
  padding-left: 40px !important;
}
</style>
