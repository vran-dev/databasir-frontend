<template>
    <el-container>
        <el-main>
            <el-card shadow="hover" style="max-width: 600px">
                <el-divider>
                    <el-icon><box /></el-icon> 系统邮箱设置
                </el-divider>
                <el-form :model="form" label-position="top" :rules="formRule" ref="formRef" style="max-width: 900px">
                    <el-form-item label="SMTP 用户名"  prop="username">
                        <el-input v-model="form.username" placeholder="请输入 SMTP 服务用户名"></el-input>
                    </el-form-item>
                    <el-form-item label="SMTP 密码" prop="password">
                        <el-input
                            v-model="form.password"
                            type="password"
                            placeholder="请输入密码"
                            show-password
                        />
                    </el-form-item>
                    <el-form-item label="发送邮箱"  prop="mailFrom">
                        <el-input v-model="form.mailFrom" placeholder="请输入邮箱账号"></el-input>
                    </el-form-item>

                    <el-form-item label="SMTP" prop="smtpHost">
                        <el-col :span="12">
                            <el-input v-model="form.smtpHost" placeholder="SMTP Host"/>
                        </el-col>
                        <el-col :span="1" style="text-align:center">
                            :
                        </el-col>
                        <el-col :span="6">
                            <el-input v-model="form.smtpPort" placeholder="SMTP Port" />
                        </el-col>
                    </el-form-item>
                    <el-form-item  label="启用 SSL" prop="useSSL">
                        <el-switch
                            v-model="form.useSSL"
                        />
                    </el-form-item>
                  <el-form-item  label="启用 TLS" prop="useTls">
                    <el-switch
                        v-model="form.useTls"
                    />
                  </el-form-item>

                    <el-form-item style="margin-top:38px">
                        <el-button type="primary" @click="onSubmit('formRef')">保存</el-button>
                        <el-button type="danger" @click="onReset()">重置</el-button>
                    </el-form-item>
                </el-form>
            </el-card>
        </el-main>
    </el-container>
</template>

<script>
import { getEmailSetting, updateEmailSetting, deleteEmailSetting } from "../api/System"

export default {
    data() {
        return {
            form: {
                smtpHost: null,
                smtpPort: null,
                username: null,
                mailFrom: null,
                password: null,
                useSSL: false,
                useTls: false,
            },
            formRule: {
                username: [this.requiredInputValidRule('请输入 SMTP 服务用户名')],
                password: [this.requiredInputValidRule('请输入 SMTP 服务密码')],
                smtpHost: [this.requiredInputValidRule('请输入 SMTP 地址')],
                smtpPort: [this.requiredInputValidRule('请输入 SMTP 端口'), { min: 1, max: 65535, message: '端口有效值为 1~65535', trigger: 'blur' }],
            }
        }
    },

    mounted() {
        this.fetchSysMail()
    },

    methods: {
        requiredInputValidRule(message) {
            return {
                required: true,
                message: message,
                trigger: 'blur',
            }
        },
        async fetchSysMail() {
            const data = await getEmailSetting().then(resp => resp.data)
            if(data) {
                this.form = data
            }
        },

        onSubmit() {
            this.$refs.formRef.validate((valid) => {
                if(this.form.useTls && this.form.useSSL) {
                  this.$message.error('不能同时启用 SSL 和 TLS')
                  return false
                }
                if (valid) {
                    updateEmailSetting(this.form).then(resp => {
                        if (!resp.errCode) {
                            this.$message.success('更新成功')
                        }
                    })
                    return true
                } else {
                    this.$message.error('请完善表单相关信息！')
                    return false
                }
            })

        },
        onReset() {
            this.$confirm('确认重置系统邮件吗？删除后数据将无法恢复', '警告', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                deleteEmailSetting().then(resp => {
                    if (!resp.errCode) {
                        this.form = {}
                        this.$message.success('重置成功')
                    }
                })
            })
        }
    }
}

</script>