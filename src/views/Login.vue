<template>
    <el-container style="">
        <el-header>

        </el-header>
        <el-main class="login-main">
            <div class="login-form">
                <el-form ref="formRef" :model="form" label-width="120px">
                    <el-form-item>
                        <h1>Databasir</h1>
                    </el-form-item>
                    <el-form-item>
                        <el-input v-model="form.username" placeholder="用户名或邮箱" suffix-icon="User">
                        </el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-input v-model="form.password" type="password" placeholder="密码" suffix-icon="Key" input-style="login-input">
                        </el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button rounded type="primary" style="width: 100%" @click="onLogin">
                            登录
                        </el-button>
                    </el-form-item>
                </el-form>
            </div>
        </el-main>
        <el-footer>

        </el-footer>
    </el-container>
</template>

<style>
.login-main {
    margin: 0 auto;
}
.login-form {
    min-width: 380px;
    max-width: 600px;
}

.login-input {
    border-width: 0 2 1 0;
}

</style>
<script>
import { login } from "../api/Login"
import { ElMessage } from "element-plus"
import { user } from "../utils/auth"

export default {
    data() {
        return {
            form: {
                username: null,
                password: null
            }
        }
    },

    methods: {
        toIndexPage() {
            this.$router.push({path: '/groups'})
        },
        
        errorMessage(msg) {
            ElMessage({
                showClose: true,
                message: msg,
                type: 'error',
                duration: 0.8 * 1000,
            })
        },

        onLogin() {
            login(this.form).then(resp => {
                if (!resp.errCode) {
                    user.saveUserLoginData(resp.data)
                    this.$store.commit('userUpdate', {
                        nickname: resp.data.nickname,
                        username: resp.data.username,
                        email: resp.data.email,
                    })
                    this.toIndexPage()
                } else {
                    this.errorMessage(resp.errMessage)   
                }
            })
        }
    }
}
</script>