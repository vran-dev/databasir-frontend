<template>
    <el-container>
        <el-header>

        </el-header>
        <el-main class="login-main">
            hello world {{ registrationId }}
        </el-main>
        <el-footer>
            <el-space>

            </el-space>
        </el-footer>
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
            registrationId: null
        }
    },

    created() {
        this.registrationId = this.$route.params.id
        this.login()
    },

    methods: {
        async login() {
            await oauth2Login(this.registrationId, this.$route.query).then(resp => {
                if (!resp.errCode) {
                    user.saveUserLoginData(resp.data)
                    this.$store.commit('userUpdate', {
                        nickname: resp.data.nickname,
                        username: resp.data.username,
                        email: resp.data.email,
                        avatar: resp.data.avatar
                    })
                    this.$router.push({path: '/groups'})
                }
            })
        }
    }
}
</script>