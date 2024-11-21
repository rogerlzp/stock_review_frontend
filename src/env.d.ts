/// <reference types="vite/client" />
/// <reference types="vue/dist/vue.d.ts" />
/// <reference types="vue-router/dist/vue-router.d.ts" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    icon?: string
    hideInMenu?: boolean
  }
}
