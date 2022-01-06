<template>
    <el-container>
        <el-main>
            <el-card>
                <el-form :model="form" label-position="top" :rules="formRule" ref="formRef" style="max-width: 900px">
                    <el-form-item label="邮箱账号"  prop="username">
                        <el-input v-model="form.username"></el-input>
                    </el-form-item>

                    <el-form-item label="邮箱密码" prop="password">
                        <el-input
                            v-model="form.password"
                            type="password"
                            placeholder="请输入密码"
                            show-password
                        />
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

                    <el-form-item style="margin-top:38px">
                        <el-button type="primary" @click="onSubmit('formRef')">保存</el-button>
                    </el-form-item>
                </el-form>
            </el-card>
        </el-main>
    </el-container>
</template>

<script>
import { getEmailSetting, updateEmailSetting } from "../api/System"

export default {
    data() {
        return {
            form: {
                smtpHost: null,
                smtpPort: null,
                username: null,
                password: null
            },
            formRule: {
                username: [this.requiredInputValidRule('请输入邮箱账号'), { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }],
                password: [this.requiredInputValidRule('请输入邮箱密码')],
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
            
        }
    }
}

</script>