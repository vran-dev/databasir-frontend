<template>
    <el-container>
        <el-aside>
            <AppNav></AppNav>
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
.el-aside {
    display: block;
    position: fixed;
    left: 0;
    bottom: 0;
    top: 0;
    width: 200px;
}

.databasir-main-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: fixed;
    top: 0px;
    right: 0px;
    left: 220px;
    padding: 30px;
    background: #FFF;
    z-index: 100;
    border-color: #EEE;
    border-width: 0px 0px 1px 0px;
    border-style: solid;
}

.databasir-main {
    margin-left: 200px;
    margin-top: 80px;
    --el-main-padding: 0px 20px 20px 20px;
}

.databasir-main-content {
    max-width: 95%;
    --el-main-padding: 0px 20px 20px 20px;
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