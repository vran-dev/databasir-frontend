<template>
  <el-menu
  router
  :collapse="isCollapse"
  mode="vertical"
  class="left-menu">
    <el-menu-item v-if="isCollapse" @click="expandMenu" index="#">
      <el-icon><expand /></el-icon>
    </el-menu-item>
    <el-menu-item index="/">
      <el-icon><home-filled /></el-icon>
      <template #title>
        <span>Databasir</span>
      </template>
    </el-menu-item>
    <template v-for="(menu, index) in routes" :key="index" >
      <el-sub-menu v-if="isShowMenu(menu) && menu.children.length > 0 && menu.children.some(ele => !ele.hidden)" :index="menu.path">
        <template #title> 
          <el-icon>
            <component :is="menu.icon" />
          </el-icon>
          <span>{{ menu.meta.nav }}</span>
        </template>
        <template :key="index + '-' + childIndex" v-for="(child, childIndex) in menu.children">
          <el-menu-item v-if="!child.hidden"  :index="menu.path+'/'+child.path">
            <el-icon v-if="child.icon">
              <component :is="child.icon" />
            </el-icon>
            <template #title>
              <span>{{ child.meta.nav }}</span>
            </template>
          </el-menu-item>
        </template>
      </el-sub-menu>
      <el-menu-item  v-else-if="isShowMenu(menu)" :index="menu.path">
        <el-icon>
          <component :is="menu.icon" />
        </el-icon>
        <template #title>
          <span>{{ menu.meta.nav }}</span>
        </template> 
      </el-menu-item>
    </template>
  </el-menu>
</template>
<style>
.left-menu:not(.el-menu--collapse) {
  height: 100vh;
}
</style>
<script>
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import { user } from '../utils/auth'
import store from '../store/index'

export default {
  setup() {
    const isCollapse = computed(() => store.state.menu.isCollapse)
    const router = useRouter()
    const routes = router.options.routes

    const isShowMenu = (menu) => {
      if (menu.hidden) {
        return false
      }
      if (menu.meta.requireAnyRoles && menu.meta.requireAnyRoles.length > 0) {
        const hasAnyRoles = user.hasAnyRoles(menu.meta.requireAnyRoles)
        if (!hasAnyRoles) {
          return false
        }
      }
      return true
    }

    const expandMenu = () => {
      store.commit('expandMenu')
    }

    return {
      isCollapse,
      isShowMenu,
      expandMenu,
      routes,
    }
  }
}
</script>