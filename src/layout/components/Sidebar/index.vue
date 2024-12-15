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
        <el-sub-menu :index="item.path">
          <template #title>
            <el-icon v-if="item.icon"><component :is="item.icon" /></el-icon>
            <span>{{ item.title }}</span>
          </template>
          <el-menu-item
            v-for="child in item.children"
            :key="child.path"
            :index="child.path"
            :class="{ 'is-active': isActive(child.path) }"
          >
            <template #title>
              <el-icon v-if="child.icon"><component :is="child.icon" /></el-icon>
              <span>{{ child.title }}</span>
            </template>
          </el-menu-item>
        </el-sub-menu>
      </template>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { menuItems } from './menu'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const route = useRoute()
const activeMenu = computed(() => route.path)
const defaultOpeneds = ref(['/market-review']) // 默认展开市场复盘菜单

const isActive = (path: string) => {
  return route.path === path
}
</script>

<style scoped>
.sidebar {
  height: 100%;
  background-color: #304156;
}

.menu {
  border: none;
  height: 100%;
  width: 100%;
}

:deep(.el-menu-item) {
  &:hover {
    background-color: #263445 !important;
  }

  &.is-active {
    background-color: #1890ff !important;
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background: #fff;
    }
  }
}

:deep(.el-sub-menu__title) {
  &:hover {
    background-color: #263445 !important;
  }
}

.el-icon {
  margin-right: 12px;
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
}
</style>
