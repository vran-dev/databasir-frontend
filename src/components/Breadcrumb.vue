<template>
  <el-breadcrumb separator="/" >
   <el-breadcrumb-item v-if="!menuIsCollapse">
       <el-link @click="onFoldMenu()" :underline="false">
            <el-icon><fold /></el-icon>
       </el-link>
   </el-breadcrumb-item>
        <el-breadcrumb-item  v-for="(item, index) in breadcrumbs" :key="index" :to="item.to">{{ item.name }}</el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script>

export default{
    data() {

    },
    computed: {
        breadcrumbs: function() {
            if (typeof this.$route.meta.breadcrumb === 'function') {
                return this.$route.meta.breadcrumb(this.$route, this.$store.state)
            } else {
                return []
            }
        },
        menuIsCollapse() {
            return this.$store.state.menu.isCollapse
        }
    },
    methods: {
        onFoldMenu() {
            this.$store.commit('foldMenu')
        }
    }
}
</script>