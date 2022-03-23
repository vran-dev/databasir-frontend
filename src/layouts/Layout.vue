<template>
    <el-container class="databasir">
        <el-aside>
            <AppNav class="databasir-nav"></AppNav>
        </el-aside>
        <el-header class="databasir-main-header">
            <Breadcrumb></Breadcrumb>
            <Avatar></Avatar>
        </el-header>
        <el-main class="databasir-main">
            <el-container>
                <el-main class="databasir-main-content">
                    <router-view></router-view>
                </el-main>
            </el-container>
        </el-main>
    </el-container>
</template>

<style>
.databasir-nav {
    position: fixed;
    transform: scale(1, 1);
    left: 0;
    bottom: 0;
    top: 0;
}

.databasir-main-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: fixed;
    transform: scale(1, 1);
    top: 0px;
    right: 0px;
    left: 50px;
    padding: 30px;
    margin-left: 33px;
    background: #FFF;
    z-index: 100;
    border-color: #EEE;
    border-width: 0px 0px 1px 0px;
    border-style: solid;
}

.databasir {
    display: block;
}

.databasir-main {
    position: relative;
    margin-left: 60px;
    margin-top: 80px;
    --el-main-padding: 0px 20px 20px 20px;
}

.databasir-main-expand {
    margin-left: 50px;
}

.databasir-main-content {
    max-width: 95%;
    --el-main-padding: 0px 20px 20px 20px;
}

.h2 {
    font-size: 24px;
    color: #606266;
    font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
  'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
    margin-top: 13px;
    margin-bottom: 13px;
}
.h3 {
    font-size: 20px;
    color: #909399;
    font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
  'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
    margin-top: 18px;
    margin-bottom: 18px;
}

</style>
<script>
import AppNav from '../components/AppNav.vue'
import Breadcrumb from '../components/Breadcrumb.vue'
import Avatar from '../components/Avatar.vue'

export default {
    components: { AppNav, Breadcrumb, Avatar },
}

</script>