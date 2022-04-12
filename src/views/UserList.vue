<template>
    <el-container>
        <el-header>
            <el-row :gutter="12">
                <el-col :span="2">
                    <el-tooltip content="创建新用户" placement="top">
                        <el-button type="primary"  icon="plus" style="width: 100%" @click="toCreatePage()"></el-button>
                    </el-tooltip>
                </el-col>
                <el-col :span="6">
                    <el-input @change='onQuery' v-model="userPageQuery.nicknameOrUsernameOrEmailContains" label="用户名" placeholder="昵称、用户名或邮箱搜索" prefix-icon="search"/>
                </el-col>
            </el-row>
        </el-header>
        <el-main>
            <el-table :data="userPageData.content" border width='80%'>
                <el-table-column prop="id" label="ID" min-width="60" fixed="left" />
                <el-table-column prop="nickname" label="昵称" min-width="120" fixed="left" resizable />
                <el-table-column prop="username" label="用户名" min-width="120" resizable />
                <el-table-column label="邮箱" width="200"  resizable>
                    <template v-slot="scope">
                        <el-link :underline="true" @click="onGetUserDetail(scope.row)" type="primary">
                            {{ scope.row.email }}
                        </el-link>
                    </template>
                </el-table-column>
                <el-table-column label="启用状态" resizable >
                    <template #header>
                        <el-select v-model="userPageQuery.enabled" placeholder="启用状态" @change="onQuery" clearable>
                        <el-option
                            v-for="item in [true, false]"
                            :key="item"
                            :label="item?'启用':'禁用'"
                            :value="item"
                            >
                        </el-option>
                    </el-select>
                    </template>
                    <template v-slot="scope">
                        <el-switch v-model="scope.row.enabled" :loading="loading.userEnableLoading"  @change="onSwitchEnabled(scope.row.id, scope.row.enabled)" :disabled="shouldDisableSwitch(scope.row)">
                        </el-switch>
                    </template>
                </el-table-column>
                <el-table-column label="系统管理员">
                    <template v-slot="scope">
                        <el-switch v-model="scope.row.isSysOwner" :loading="loading.sysOwnerLoading" @change="onChangeSysOwner(scope.row)" :disabled="shouldDisableSwitch(scope.row)">
                        </el-switch>
                    </template>
                </el-table-column>
                <el-table-column prop="createAt" label="创建时间" min-width="140"/>
                <el-table-column label="操作" min-width="120" resizable >
                    <template v-slot="scope">
                        <el-button icon="Refresh" type="warning" size="small" @Click.stop="onRenewPassword(scope.row.id)">重置密码</el-button>
                        <el-button icon="Delete" type="danger" size="small" @Click.stop="onDeleteUser(scope.row.id)">删除账号</el-button>
                    </template>
                </el-table-column>
            </el-table>

        </el-main>
        <el-footer>
            <el-pagination layout="sizes, prev, pager, next" 
            :hide-on-single-page="false"
            :currentPage="userPageData.number" 
            :page-size="userPageQuery.size" 
            :page-sizes="[10,15,20,30]"
            :page-count="userPageData.totalPages"
            @size-change="onPageSizeChange"
            @current-change="onPageChange">
            </el-pagination>
        </el-footer>

        <!-- user detail drawer -->
        <el-drawer
                v-model="isShowUserDetailDrawer"
                title="用户详情"
                direction="rtl"
                size="50%"
            >
            <el-descriptions
                        title="基础信息"
                        :column="1"
                        border>
                <el-descriptions-item label="ID">{{ userDetailData.id }}</el-descriptions-item>
                <el-descriptions-item label="昵称">{{ userDetailData.nickname }}</el-descriptions-item>
                <el-descriptions-item label="用户名">{{ userDetailData.username }}</el-descriptions-item>
                <el-descriptions-item label="邮箱" :span="2">{{ userDetailData.email }}</el-descriptions-item>
                <el-descriptions-item label="启用状态" :span="2">{{ userDetailData.enabled?'启用中':'已禁用' }}</el-descriptions-item>
                <el-descriptions-item label="注册时间" :span="2">{{ userDetailData.createAt }}</el-descriptions-item>
            </el-descriptions>
            <br />
            <h3>角色信息</h3>
            <el-table :data="userDetailData.roles" stripe>
                <el-table-column label="角色" prop="role" :formatter="roleNameFormatter">
                </el-table-column>
                <el-table-column label="所属分组">
                    <template v-slot="scope">
                        <el-link v-if="scope.row.groupId" @click="toGroupPage(scope.row.groupId, scope.row.groupName)">{{ scope.row.groupName }} <el-icon><List /></el-icon></el-link>
                    </template>
                </el-table-column>
                <el-table-column prop="groupId" label="分组 ID"></el-table-column>
                <el-table-column prop="createAt" label="角色分配时间"></el-table-column>
            </el-table>
        </el-drawer>

        <!-- user create dialog -->
        <el-dialog v-model="isShowEditUserDialog" width="38%" center destroy-on-close title="创建用户">
            <el-form :model="userData" label-position="top" :rules="userFormRule" ref="userFormRef">
                <el-form-item label="昵称"  prop="nickname">
                    <el-input v-model="userData.nickname"></el-input>
                </el-form-item>
                <el-form-item label="用户名"  prop="username">
                    <el-input v-model="userData.username"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email"> 
                    <el-input v-model="userData.email"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input
                        v-model="userData.password"
                        type="password"
                        placeholder="请输入密码"
                        show-password
                    />
                </el-form-item>
                <el-form-item label="启用状态">
                    <el-switch v-model="userData.enabled">
                    </el-switch>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" plain @click="onSaveUserData('userFormRef')">保存</el-button>
                    <el-button plain @click="isShowEditUserDialog = false">取消</el-button>
                </el-form-item>
            </el-form>
                
        </el-dialog>
    </el-container>
</template>

<script>
import { listUsers, enableUser, disableUser, renewPassword, createUser, addSysOwnerTo, removeSysOwnerFrom, getByUserId, deleteByUserId } from "../api/User"
import {ElMessage} from 'element-plus'
import { user } from "../utils/auth"

export default {
    data() {
        return {
            loading: {
                sysOwnerLoading: false,
                userEnableLoading: false
            },
            userData: {
                enabled: true
            },
            userFormRule: {
                nickname: [this.requiredInputValidRule('昵称不能为空')],
                username: [this.requiredInputValidRule('用户名不能为空')],
                email: [this.requiredInputValidRule('邮箱不能为空'), { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }],
                password: [this.requiredInputValidRule('密码不能为空'), { min: 6, max: 18, message: '密码位数位数要求在 6~18 之间', trigger: 'blur' }],
            },
            userPageData: {
                content: [],
            },
            userPageQuery: {
                nicknameOrUsernameOrEmailContains: null,
                enabled: null,
                page: 0,
                size: 10
            },
            userDetailData: {

            },
            isShowUserDetailDrawer: false,
            isShowEditUserDialog: false,
            roleNameFormatter: function(row, column, role) {
            if (role == 'SYS_OWNER') {
                return '系统管理员'
            } else if (role == 'GROUP_OWNER') {
                return '组长'
            } else if (role == 'GROUP_MEMBER') {
                return '组员'
            } else {
                return role
            }
        }
        }
    },

    created() {
        this.fetchUsers()
    },
    methods: {
        fetchUsers() {
            listUsers(this.userPageQuery).then(resp => {
                if (!resp.errCode) {
                    this.userPageData = resp.data
                    this.userPageData.number = resp.data.number + 1
                }
            })
        },
        requiredInputValidRule(message) {
            return {
                required: true,
                message: message,
                trigger: 'blur',
            }
        },
        onSwitchEnabled(userId, val) {
            if (val) {
                enableUser(userId)
            } else {
                disableUser(userId)
            }
        },
        onRenewPassword(userId) {
            this.$confirm('确认重置该用户密码？新密码将通过邮件下发', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                renewPassword(userId).then(resp => {
                    if (!resp.errCode) {
                        ElMessage({
                            showClose: true,
                            message: '密码重置成功',
                            type: 'success',
                            duration: 3 * 1000
                        });
                    }
                })
            })
        },
        onDeleteUser(userId) {
            this.$confirm('确认删除该用户吗？删除后无法恢复，请谨慎操作', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                deleteByUserId(userId).then(resp => {
                    if (!resp.errCode) {
                        this.fetchUsers()
                        ElMessage({
                            showClose: true,
                            message: '用户删除成功',
                            type: 'success',
                            duration: 3 * 1000
                        });
                    }
                })
            })
        },
        onPageChange(currentPage) {
            if (currentPage && (currentPage - 1) != this.userPageQuery.page) {
                this.userPageQuery.page = currentPage - 1
                this.fetchUsers()
            }
        },
        onPageSizeChange(currentSize) {
            if (currentSize) {
                this.userPageQuery.size = currentSize
                this.fetchUsers()
            }
        },
        onQuery() {
            this.userPageQuery.page = 0
            this.fetchUsers()
        },
        onGetUserDetail(user) {
            this.isShowUserDetailDrawer = true
            getByUserId(user.id).then(resp => {
                if(!resp.errCode) {
                    this.userDetailData = resp.data
                }
            })
        },
        onSaveUserData() {
            this.$refs.userFormRef.validate(valid => {
                if (valid) {
                    createUser(this.userData).then(resp => {
                        if (!resp.errCode) {
                            this.$message.success("保存用户成功")
                            this.isShowEditUserDialog = false
                            this.userData = {
                                enabled: false
                            }
                            this.fetchUsers()
                        }
                    })
                    return true
                } else {
                    return false
                }
            })
            
        },
        onChangeSysOwner(user) {
            const userId = user.id
            this.loading.sysOwnerLoading = true
            if (user.isSysOwner) {
                return addSysOwnerTo(userId).then(resp => {
                    if (!resp.errCode) {
                        this.$message.success("启用系统管理员成功")
                    }
                    this.loading.sysOwnerLoading = false
                })
            } else {
                return removeSysOwnerFrom(userId).then(resp => {
                    if (!resp.errCode) {
                        this.$message.warning("禁用系统管理员成功")
                    }
                    this.loading.sysOwnerLoading = false
                })
            }
        },
        toCreatePage() {
            this.isShowEditUserDialog = true
        },
        toGroupPage(groupId, groupName) {
            if(groupId) {
                this.$router.push({path: '/groups/'+groupId, query: { groupName: groupName }})
            }
        },
        shouldDisableSwitch(row) {
            const loginData = user.loadUserLoginData()
            if (loginData && loginData.id == row.id) {
                return true
            }
            return false
        },
    }
}

</script>