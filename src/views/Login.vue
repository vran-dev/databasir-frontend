<template>
    <el-container>
        <el-header>
        </el-header>
        <el-main class="login-main">
            <div class="login-card">
                <el-form ref="formRef" :rules="formRule" :model="form" style="border:none;">
                    <el-form-item>
                        <el-link href="https://github.com/vran-dev/databasir" target="_blank" :underline="false" type="info">
                            <h1>Databasir</h1>
                        </el-link>
                    </el-form-item>
                    <el-form-item  prop="username">
                        <input type="text" class="login-input" placeholder="用户名或邮箱" v-model="form.username" @keyup.enter="onLogin('formRef')">
                    </el-form-item>
                    <el-form-item prop="password">
                        <input type="password" class="login-input" placeholder="密码" v-model="form.password" @keyup.enter="onLogin('formRef')" >
                    </el-form-item>
                    <el-form-item>
                        <el-space :size="32">
                            <el-button style="width: 120px; margin-top:10px;border-color:#EEE;" color="#000" @click="onLogin('formRef')" plain round >
                                登录
                            </el-button>
                            <el-tooltip content="请联系管理员为您重置密码">
                                <el-link target="_blank" :underline="false" type="info">
                                忘记密码？
                                </el-link>
                            </el-tooltip>
                        </el-space>
                    </el-form-item>
                    <el-form-item>
                        <el-divider content-position="right" v-if="oauthApps.length > 0">
                            <el-space :size="26">
                                第三方登录
                                <el-link v-for="(item, index) in oauthApps" :key="index" :underline="false" @click="onAuthLogin(item.registrationId)">
                                    <oauth2-app-type :app-type="item.appType" :app-icon="item.appIcon" :app-name="item.appName"/>
                                </el-link>
                            </el-space>
                        </el-divider>
                    </el-form-item>
                </el-form>
            </div>
        </el-main>
    </el-container>
</template>

<style>
.login-main {
    margin: 0 auto;
    margin-top: 200px;
}

.login-input {
    border-width: 0 0 1px 0;
    border-style: solid;
    border-color:#ddd;
    width: 100%;
    min-height: 33px;
}

.login-input::placeholder {
    color: rgba(180, 180, 180, 0.808);
}

.login-input:focus {
    outline: none;
    border-color: #000;
}

.login-card {
    max-width: 600px;
    min-width: 500px;
    border-color: black;
    /* border-style: solid; */
}

.app-icon {
    --el-avatar-bg-color: transparent;
}

</style>
<script>
import { login } from "../api/Login"
import { user } from "../utils/auth"
import { listAll, authorizationUrl } from "../api/OAuthApp"
import Oauth2AppType from '../components/Oauth2AppType.vue'

export default {
    components: { Oauth2AppType },
    data() {
        return {
            form: {
                username: null,
                password: null
            },

            formRule: {
                username: [{required: true,message: '请输入用户名或邮箱',trigger: 'blur'}],
                password: [{required: true,message: '请输入密码',trigger: 'blur'}],
            },

            oauthApps: []
        }
    },

    created() {
        this.fetchAllOAuthApps()
    },

    methods: {
        resolveAppIcon(item) {
            if (item.appIcon && item.appIcon != '') {
                return item.appIcon
            }
            if ('github' == item.appType) {
                return require('@/assets/app/github.svg')
            } else if ('gitlab' == item.appType) {
                return require('@/assets/app/gitlab.svg')
            } else {
                return ''
            }
        },
        fetchAllOAuthApps() {
            listAll().then(resp => {
                if(!resp.errCode) {
                    this.oauthApps = resp.data
                }
            })
        },
        toIndexPage() {
            this.$router.push({path: '/groups'})
        },

        onAuthLogin(id) {
            const protocol = window.location.protocol
            const redirectUri = protocol + "//" + window.location.host + "/login/oauth2/" + id
            const params = {
                redirect_uri: redirectUri
            }
            authorizationUrl(id, params).then(resp => {
                if (!resp.errCode) {
                    window.location.href = resp.data
                }
            })
        },

        onLogin() {
             this.$refs.formRef.validate(valid => {
                 if (valid) {
                    login(this.form).then(resp => {
                        if (!resp.errCode) {
                            user.saveUserLoginData(resp.data)
                            this.$store.commit('userUpdate', {
                                nickname: resp.data.nickname,
                                username: resp.data.username,
                                email: resp.data.email,
                            })
                            this.toIndexPage()
                        }
                    })
                 }
             })
        }
    }
}
</script>