<template>
    <el-container>
        <el-header>
        </el-header>
        <el-main>
            <el-card shadow="hover" style="max-width: 600px">
                <img :src="require('@/assets/logo.png')" style="max-width: 330px; max-height: 330px;"/>

                <el-form
                    label-position="top"
                    label-width="100px"
                    :model="userFormData"
                    style="max-width: 460px"
                >
                    <el-form-item label="昵称">
                        <el-col :span="20"> 
                            <el-input v-model="userFormData.nickname" maxlength="32"></el-input>
                        </el-col>
                        <el-col :span="2" :offset="1" v-if="isNickNameChanged">
                            <el-button plain icon="Check" circle size="small" @click="onUpdateNickname" ></el-button>
                        </el-col>
                    </el-form-item>
                    <el-form-item label="用户名">
                        <el-col :span="20">
                            <el-input v-model="userFormData.username" disabled></el-input>
                        </el-col>
                    </el-form-item>
                    <el-form-item label="邮箱">
                        <el-col :span="20">
                            <el-input v-model="userFormData.email" disabled></el-input>
                        </el-col>
                    </el-form-item>
                    <el-form-item label="密码">
                        <el-col :span="12">
                            <el-input disabled type="password"  v-model="userFormData.password"></el-input>
                        </el-col>
                        <el-col :span="11" :offset="1">
                            <el-button type="danger" plain @click="onShowUpdatePasswordDialog" icon="edit" >修改密码</el-button>
                        </el-col>
                    </el-form-item>
                </el-form>
            </el-card>

            <el-dialog
                v-model="isShowUpdatePasswordDialog"
                title="修改密码"
                width="33%"
                :before-close="onUpdatePasswordDialogClose"
            >
                <el-form
                    label-position="top"
                    label-width="100px"
                    :model="userPasswordUpdateForm"
                    :rules="userPasswordUpdateFormRule"
                    ref="userPasswordUpdateFormRef"
                >
                    <el-form-item label="原密码" prop="originPassword">
                        <el-input v-model="userPasswordUpdateForm.originPassword" placeholder="请输入原登录密码"  type="password"></el-input>
                    </el-form-item>
                    <el-form-item label="新密码" prop="newPassword">
                        <el-input v-model="userPasswordUpdateForm.newPassword" placeholder="输入新密码"  type="password" maxlength="32" show-word-limit show-password></el-input>
                    </el-form-item>
                    <el-form-item label="再次输入新密码" prop="confirmNewPassword">
                        <el-input v-model="userPasswordUpdateForm.confirmNewPassword"  type="password" placeholder="再次输入新密码" maxlength="32" show-word-limit show-password></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="onUpdatePassword('userPasswordUpdateFormRef')" type="primary">确认</el-button>
                        <el-button @click="isShowUpdatePasswordDialog = false">取消</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
        </el-main>
    </el-container>
</template>

<script>
import { updatePassword, updateNickname } from "../api/User";
import { user } from "../utils/auth";
export default {
    data() {
        const validatePasswordIsEq = (rule, value, callback) => {
            if (value  == this.userPasswordUpdateForm.newPassword && !this.userPasswordUpdateForm.confirmNewPassword) {
                callback();
                return;
            }

            if(value  == this.userPasswordUpdateForm.newPassword && value != this.userPasswordUpdateForm.confirmNewPassword) {
                callback(new Error('两次输入密码不一致!'));
                return;
            }

            if (value == this.userPasswordUpdateForm.confirmNewPassword && value != this.userPasswordUpdateForm.newPassword) {
                callback(new Error('两次输入密码不一致!'));
                return;
            }

            callback();
        };
        return {
            userFormData: {
                password: '..........',
                nickname: null,
                username: null,
                email: null
            },
            userPasswordUpdateForm: {
                originPassword: null,
                newPassword: null,
                confirmNewPassword: null
            },
            
             userPasswordUpdateFormRule: {
                originPassword: [
                    { required: true,message: '请输入原密码', trigger: 'blur' },
                ],
                newPassword: [
                    { required: true,message: '请输入新密码', trigger: 'blur'},
                    { min: 6,max: 32,message: '密码在6~32位之间',trigger: 'blur'},
                    { validator: validatePasswordIsEq, trigger: 'blur', required: true }
                ],
                confirmNewPassword: [
                    { required: true,message: '请再次输入新密码', trigger: 'blur'},
                    { min: 6,max: 32,message: '密码在6~32位之间',trigger: 'blur'},
                    { validator: validatePasswordIsEq, trigger: 'blur'}
                ]
            },
            isShowUpdatePasswordDialog: false,
            isNickNameChanged: false,
            userId: null
        }
    },

    watch: {
        'userFormData.nickname'(newVal) {
            this.isNickNameChanged = this.$store.state.user.nickname != newVal
        }
    },
    mounted() {
        user.loadUserLoginData() .then(data => {
            this.userId = data.id
            this.userFormData.nickname = data.nickname
            this.userFormData.username = data.username
            this.userFormData.email = data.email
        })
    },

    methods: {
        onShowUpdatePasswordDialog() {
            this.isShowUpdatePasswordDialog = true
        },
        onUpdatePasswordDialogClose(callback) {
            this.userPasswordUpdateForm = {}
            callback()
        },
        onUpdatePassword() {
            this.$refs.userPasswordUpdateFormRef.validate(valid => {
                if(valid) {
                    updatePassword(this.userId, this.userPasswordUpdateForm).then(resp => {
                        if (!resp.errCode) {
                            this.$message.success("密码修改成功，请重新登录")
                            user.removeUserLoginData()
                            this.isShowUpdatePasswordDialog = true
                            this.userPasswordUpdateForm = {}
                            this.$router.push({path: '/login'})
                        }
                    })
                } else {
                    this.$message.error('请检查表单项')
                }
            })
        },
        onUpdateNickname() {
            if(!this.userFormData.nickname) {
                this.$message.warning("请输入有效的昵称")
                return
            }
            updateNickname(this.userId, { nickname: this.userFormData.nickname }).then(resp => {
                if (!resp.errCode) {
                    this.$message.success("修改成功")
                    this.$store.commit('userUpdate', {
                        nickname: this.userFormData.nickname
                    })
                }
            })
        },
    }
}
</script>