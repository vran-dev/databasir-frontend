<template>
    <el-container>
        <el-main v-loading="loading" class="login-main">
            <el-result
                :icon="icon"
                :title="title"
                :sub-title="subTitle"
                v-show="!loading"
            >
                <template #extra>
                <el-button type="primary" @click="toIndexPage()">立即跳转</el-button>
                </template>
            </el-result>
        </el-main>
    </el-container>
</template>

<style>
.login-main {
    margin: 0 auto;
    margin-top: 200px;
}

</style>
<script>
import { oauth2Login } from "../api/Login"
import { user } from "../utils/auth"


export default {
    data() {
        return {
            registrationId: null,
            icon: '',
            title: '',
            subTitle: '',
            loading: true,
        }
    },

    created() {
        this.registrationId = this.$route.params.id
        this.login()
    },

    methods: {
         login() {
            const redirectUri = window.location.href
            const params = this.$route.query
            params.redirect_uri = redirectUri
            oauth2Login(this.registrationId, params).then(resp => {
                if (!resp.errCode) {
                    user.saveUserLoginData(resp.data)
                    this.$store.commit('userUpdate', {
                        nickname: resp.data.nickname,
                        username: resp.data.username,
                        email: resp.data.email,
                        avatar: resp.data.avatar
                    })
                    this.icon='success'
                    this.$router.push({path: '/groups'})
                } else {
                    this.title = resp.errMessage
                    this.icon = 'error'
                }
                this.loading = false
            }).catch(err => {
                console.log('login failed: '+err)
                this.icon = 'error'
                this.title = '登陆失败，请重试'
                this.loading = false
            })
        },

        toIndexPage() {
            this.$router.push({path: '/'})
        }
    }
}
</script>