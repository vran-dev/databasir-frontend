<template>
    <el-dropdown>
        <el-avatar :size="36" :src="avatarUrl" icon="avatar"></el-avatar>
        <template #dropdown>
        <el-dropdown-menu>
            <el-dropdown-item>{{ userNickname }}</el-dropdown-item>

            <el-dropdown-item icon="user" divided @click="toProfilePage()">个人中心</el-dropdown-item>
            <el-dropdown-item icon="back" @click="onLogout()">注销登陆</el-dropdown-item>
        </el-dropdown-menu>
        </template>
    </el-dropdown>
</template>

<script>
import { user } from '../utils/auth'

export default {
    data(){
        return {
            avatarUrl: null
        }
    },
    computed: {
        userNickname() {
            return this.$store.state.user.nickname 
        }
    },
    methods: {
        onLogout(){
            user.removeUserLoginData()
            this.$router.push({path: '/login'})
        },
        toProfilePage() {
            this.$router.push({ path: '/profile'})
        }
    }
}
</script>
