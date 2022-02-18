<template>
  <el-tabs>
    <!-- project list -->
    <el-tab-pane label="项目列表">
        <el-row :gutter="12">
            <el-col :span="3" v-require-roles="['SYS_OWNER', 'GROUP_OWNER?groupId='+groupId, 'GROUP_MEMBER?groupId='+groupId]">
                <el-tooltip content="新建一个新项目" placement="top">
                    <el-button type="primary" style="width:100%" icon="plus" @click="toCreateProject">新建</el-button>
                </el-tooltip>
            </el-col>
            <el-col :span="8">
                <el-input @change='onProjectQuery' v-model="projectFilter.nameContains" label="项目名" placeholder="项目名称搜索" prefix-icon="search"/>
            </el-col>
            <el-col :span="8">
                <el-input @change="onProjectQuery" v-model="projectFilter.databaseNameContains" label="数据库名" placeholder="数据库名称搜索" prefix-icon="search"/>
            </el-col>
            <el-col :span="5">
                <el-select @change="onProjectQuery" @clear="onProjectDatabaseTypeClear()" v-model="projectFilter.databaseType" placeholder="选择数据库类型" clearable>
                    <el-option
                    v-for="item in databaseTypes"
                    :key="item"
                    :label="item"
                    :value="item"
                    >
                    </el-option>
                </el-select>
            </el-col>
        </el-row>
        <el-row>
            <el-table :data="projectPageData.data" border>
                <el-table-column prop="id" label="ID" min-width="60" fixed="left" />
                <el-table-column label="项目名称" min-width="120" fixed="left" resizable>
                    <template v-slot="scope">
                        <el-link :underline="true" :icon="Edit" @click.stop="toEditProject(scope.row)">{{ scope.row.name }}</el-link>
                    </template>
                </el-table-column>
                <el-table-column prop="databaseName" label="数据库" width="200"  resizable />
                <el-table-column prop="databaseType" label="数据库类型" resizable ></el-table-column>
                <el-table-column prop="description" label="说明" min-width="160" resizable />
                <el-table-column label="定时同步" align="center">
                    <template v-slot="scope">
                        <el-tag v-if="scope.row.isAutoSync">
                            {{ scope.row.autoSyncCron }}
                        </el-tag>
                        <span v-else>
                            无
                        </span>
                    </template>
                </el-table-column>
                <el-table-column prop="createAt" label="创建时间" min-width="120" resizable ></el-table-column>
                <el-table-column fixed="right" label="操作" min-width="180" align="center"  resizable>
                    <template v-slot="scope">
                        <el-space>
                            <el-button type="primary" size="small" @click.stop="toEditProject(scope.row)">编辑</el-button>
                            <el-button type="primary" size="small" @click.stop="toDocumentPage(scope.row)">查看文档</el-button>
                            <el-button type="primary" size="small" @click.stop="toProjectOperationLogDrawer(scope.row)">日志</el-button>
                            <el-button type="danger" size="small" @click.stop="onProjectDelete(scope.row.id)" v-require-roles="['SYS_OWNER', 'GROUP_OWNER?groupId='+groupId]">删除</el-button>
                        </el-space>
                    </template>
                </el-table-column>
            </el-table>
            
        </el-row>
        <el-row>
            <el-col>
                <el-pagination layout="prev, pager, next" 
                :hide-on-single-page="false"
                :currentPage="projectPageData.number" 
                :page-size="projectPageData.size" 
                :page-count="projectPageData.totalPages"
                @current-change="onProjectListCurrentPageChange">

                </el-pagination>
            </el-col>
        </el-row>

        <!-- project form -->
        <el-dialog v-model="isShowProjectEditDialog" width="42%" center destroy-on-close >
            <el-form :model="projectForm" label-position="top" :rules="projectFormRules" ref="projectFormRulesRef">
                <el-tabs>
                    <el-tab-pane label="基础配置">
                        <!-- basic -->
                        <h2>基础信息</h2>
                        <el-form-item label="名称" prop="name">
                            <el-col :span="17">
                            <el-input v-model="projectForm.name" placeholder="项目名称"></el-input>
                            </el-col>
                        </el-form-item>
                        <el-form-item label="描述" prop="description">
                            <el-col :span="17">
                            <el-input v-model="projectForm.description" type="textarea" placeholder="项目描述"></el-input>
                            </el-col>
                        </el-form-item>                              
                        <!-- connection -->
                        <h2>连接配置</h2>
                        <el-row :gutter="33">
                            <el-col :span="8">
                                <el-form-item label="用户名" prop="dataSource.username">
                                    <el-input v-model="projectForm.dataSource.username" placeholder="root"></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="9">
                                <el-form-item label="密码"  prop="dataSource.password">
                                    <el-input v-model="projectForm.dataSource.password" placeholder="**********"  :type="password" show-password></el-input>
                                </el-form-item>                         
                            </el-col>
                            <el-col :span="17">
                                <el-form-item label="地址" prop="dataSource.url">
                                    <el-input v-model="projectForm.dataSource.url" placeholder="127.0.0.1:3306"></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="8">
                                <el-form-item label="数据库" prop="dataSource.databaseName">
                                    <el-input v-model="projectForm.dataSource.databaseName" placeholder="需要同步的数据库名称"></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="8">
                                <el-form-item label="数据库类型" prop="dataSource.databaseType">
                                    <el-select v-model="projectForm.dataSource.databaseType" placeholder="选择数据库类型" clearable>
                                        <el-option
                                        v-for="item in databaseTypes"
                                        :key="item"
                                        :label="item"
                                        :value="item"
                                        >
                                        </el-option>
                                    </el-select>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-form-item :label="index > 0 ? '':'属性'" v-for="(item, index) in projectForm.dataSource.properties" :key="index">
                            <el-col :span="8">
                                <el-input v-model.trim="item.key" placeholder="Key"></el-input>
                            </el-col>
                            <el-col  :offset="1" :span="8">
                                <el-input v-model.trim="item.value" placeholder="Value" />
                            </el-col>
                            <el-col :offset="1" :span="6">
                                <el-button type="danger" size="small" @click="removeDataSourceProperty(index)">- 删除</el-button>
                                <el-button type="primary" size="small" @click="addDataSourceProperty" v-if="(index+1) == projectForm.dataSource.properties.length">+ 添加</el-button>
                            </el-col>
                        </el-form-item>
                        <el-form-item label="属性" v-if="projectForm.dataSource.properties.length == 0">
                            <el-button type="text" size="small" @click="addDataSourceProperty" >+ 添加</el-button>
                        </el-form-item>

                        <el-form-item>
                            <el-col>
                                <el-button v-if="testConnectionState.isTest" plain circle :type="testConnectionState.buttonType" size="small">
                                    <el-icon v-if="testConnectionState.success"><check /></el-icon>
                                    <el-icon v-else><close /></el-icon>
                                </el-button>
                                <el-button :type="testConnectionState.buttonType" plain size="small" @click="onTestConnection('projectFormRulesRef')" :loading="loading.testConnection">
                                    测试连接
                                </el-button>
                            </el-col>
                            <el-col v-if="testConnectionState.isTest && !testConnectionState.success">
                                <el-link type="danger" :underline="false">{{ testConnectionState.message }}</el-link>
                            </el-col>
                        </el-form-item>
                    </el-tab-pane>

                    <el-tab-pane label="高级配置">
                        <!-- schema meta sync rule-->
                        <h2>同步规则</h2>
                        <el-form-item label="定时同步">
                            <el-space wrap :size="33">
                                <el-switch v-model="projectForm.projectSyncRule.isAutoSync"></el-switch>
                                <el-input 
                                    v-model="projectForm.projectSyncRule.autoSyncCron" 
                                    v-if="projectForm.projectSyncRule.isAutoSync" 
                                    placeholder="CRON 表达式" 
                                    >
                                </el-input>    
                            </el-space>
                        </el-form-item>

                        <!-- ignore table name regex -->
                        <el-form-item :label="index > 0 ? '': '忽略表名称（支持正则表达式）'" v-for="(item, index) in projectForm.projectSyncRule.ignoreTableNameRegexes" :key="index">
                            <el-col :span="6">
                                <el-input v-model="projectForm.projectSyncRule.ignoreTableNameRegexes[index]" placeholder="name regex"></el-input>
                            </el-col>
                            <el-col :span="6" :offset="1">
                                <el-button type="danger" size="small" @click="removeIgnoreTableName(index)">- 删除</el-button>
                                <el-button type="primary" size="small" @click="addIgnoreTableName" v-if="(index+1) == projectForm.projectSyncRule.ignoreTableNameRegexes.length">+ 添加</el-button>
                            </el-col>
                        </el-form-item>
                        <el-form-item label="忽略表名称（支持正则表达式）" v-if="projectForm.projectSyncRule.ignoreTableNameRegexes.length == 0">
                            <el-button type="text" size="small" @click="addIgnoreTableName" >+ 添加</el-button>
                        </el-form-item>

                        <!-- ignore column name regex -->
                        <el-form-item :label="index > 0 ? '' : '忽略列名称（支持正则表达式）'" v-for="(item, index) in projectForm.projectSyncRule.ignoreColumnNameRegexes" :key="index">
                            <el-col :span="6">
                                <el-input v-model="projectForm.projectSyncRule.ignoreColumnNameRegexes[index]" placeholder="name regex"></el-input>
                            </el-col>
                            <el-col :span="6"  :offset="1">
                                <el-button type="danger" size="small" @click="removeIgnoreColumnName(index)">- 删除</el-button>
                                <el-button type="primary" size="small" @click="addIgnoreColumnName" v-if="(index+1) == projectForm.projectSyncRule.ignoreColumnNameRegexes.length">+ 添加</el-button>
                            </el-col>
                        </el-form-item>
                        <el-form-item label="忽略列名称（支持正则表达式）" v-if="projectForm.projectSyncRule.ignoreColumnNameRegexes.length == 0">
                            <el-button type="text" size="small" @click="addIgnoreColumnName" >+ 添加</el-button>
                        </el-form-item>
                    </el-tab-pane>
                </el-tabs>
                <el-form-item>
                    <el-divider content-position="center"></el-divider>
                    <el-button type="primary" @click="onProjectFormSave('projectFormRulesRef')" >保存</el-button>
                    <el-button @click="onProjectFormCancel">取消</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
        <el-drawer
            v-model="isShowProjectOperationLogDrawer"
            title="项目日志"
            size="50%"
        >
            <el-table :data="projectOperationLogPageData.data">
                <el-table-column prop="id" label="ID"/>
                <el-table-column prop="operatorNickname" label="操作人" />
                <el-table-column prop="operationName" label="操作" />
                <el-table-column label="状态" >
                    <template v-slot="scope">
                        <span v-if="scope.row.isSuccess">
                            <el-tag type="success">成功</el-tag>
                        </span>
                        <span v-else>
                            <el-tag  type="danger">失败</el-tag>
                        </span>
                    </template>
                </el-table-column>

                <el-table-column label="错误信息" >
                    <template v-slot="scope">
                        <span v-if="scope.row.isSuccess">
                        </span>
                        <span v-else>
                            {{ scope.row.operationResponse.errMessage }}
                        </span>
                    </template>
                </el-table-column>
                <el-table-column prop="createAt" label="记录时间" />
            </el-table>
            <el-pagination layout="prev, pager, next" 
                :hide-on-single-page="false"
                :currentPage="projectOperationLogPageData.number" 
                :page-size="projectOperationLogPageData.size" 
                :page-count="projectOperationLogPageData.totalPages"
                @current-change="onProjectOperationLogCurrentPageChange">

            </el-pagination>
        </el-drawer>
    </el-tab-pane>
    
    <el-tab-pane label="分组成员">
        <el-row :gutter="33">
            <el-col :span="3" v-require-roles="['SYS_OWNER', 'GROUP_OWNER?groupId='+groupId]">
                <el-tooltip content="添加一个新组员" placement="top">
                    <el-button type="primary" style="width:100%" icon="plus" @click="onClickShowAddGroupMemberDrawer()">添加成员</el-button>
                </el-tooltip>
            </el-col>
            <el-col :span="3">
                <el-select @change="onGroupMemberQuery" @clear="onGroupRoleFilterClear" v-model="groupMemberFilter.role" placeholder="选择角色过滤" clearable>
                    <el-option
                    v-for="item in roleTypes"
                    :key="item"
                    :label="formatRoleName(item)"
                    :value="item"
                    >
                    </el-option>
                </el-select>
            </el-col>
            <el-col :span="8">
                <el-input @change='onGroupMemberQuery()' v-model="groupMemberFilter.nicknameOrUsernameOrEmailContains" placeholder="成员昵称、用户名、邮箱搜索" prefix-icon="search"/>
            </el-col>
        </el-row>

        <el-row>
            <el-col>
                <el-table :data="groupMemberPageData.data"  border width='80%'>
                    <el-table-column prop="userId" label="用户 ID" min-width="60" fixed="left" />
                    <el-table-column prop="nickname" label="昵称" min-width="120" fixed="left" resizable />
                    <el-table-column prop="username" label="用户名" min-width="120" resizable />
                    <el-table-column prop="email" label="邮箱" width="200"  resizable />
                    <el-table-column label="角色" resizable align="center">
                        <template v-slot="scope">
                            <el-tag v-if="scope.row.role == 'GROUP_OWNER'" type="danger" effect="plain"> {{ formatRoleName(scope.row.role )}} </el-tag>
                            <el-tag v-else effect="plain"> {{ formatRoleName(scope.row.role )}} </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="createAt" label="入组时间" min-width="160" resizable />
                    <el-table-column label="操作" min-width="120" resizable v-require-roles="['SYS_OWNER', 'GROUP_OWNER?groupId='+groupId]">
                        <template v-slot="scope">
                            <el-button type="danger" size="small" @click="onGroupMemberRemove(scope.row.nickname, scope.row.userId)" plain>移除</el-button>
                            <el-button v-if="scope.row.role == 'GROUP_MEMBER'" plain size="small" @click="onGroupMemberRoleUpdate(scope.row, 'GROUP_OWNER')">升为组长</el-button>
                            <el-button v-else size="small" @click="onGroupMemberRoleUpdate(scope.row, 'GROUP_MEMBER')" plain>设为组员</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-col>
        </el-row>
        <el-row>
            <el-col>
                <el-pagination layout="prev, pager, next" 
                :hide-on-single-page="false"
                :currentPage="groupMemberPageData.number" 
                :page-size="groupMemberPageData.size" 
                :page-count="groupMemberPageData.totalPages"
                @current-change="onGroupMemberCurrentPageChange">

                </el-pagination>
            </el-col>
        </el-row>

          <el-drawer
            v-model="isShowAddGroupMemberDrawer"
            title="添加成员"
            direction="btt"
            size="50%"
        >
            <el-affix :offset="0" position="top" target=".el-drawer__body">
                <el-row :gutter="33">
                    <el-col :span="12">
                        <el-input @change='fetchUsers' v-model="userPageQuery.nicknameOrUsernameOrEmailContains" label="用户名" placeholder="输入昵称、用户名或邮箱搜索" prefix-icon="search"/>
                    </el-col>
                    <el-col :span="12">
                        <el-pagination layout="sizes, prev, pager, next" 
                        :hide-on-single-page="false"
                        :currentPage="userPageQuery.number" 
                        :page-size="userPageQuery.size" 
                        :page-sizes="[5, 10, 20, 30]"
                        :page-count="userPageData.totalPages"
                        @size-change="onUserPageSizeChange"
                        @current-change="fetchUsers">
                        </el-pagination>
                    </el-col>
                </el-row>
            </el-affix>

            <el-row>
                <el-col>
                    <el-table :data="userPageData.data" style="width: 100%" border>
                        <el-table-column prop="id" label="用户 ID" width="80" />
                        <el-table-column prop="nickname" label="昵称" />
                        <el-table-column prop="username" label="用户名"  />
                        <el-table-column prop="email" label="邮箱" />
                        <el-table-column label="启用状态" width="100">
                            <template v-slot="scope">
                                <span v-if="scope.row.enabled">启用中</span>
                                <span v-else>已禁用</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作">
                            <template v-slot="scope">
                                <span v-if="isInGroup(scope.row)">
                                    <el-button type="danger" size="small" @click="onGroupMemberRemove(scope.row.nickname, scope.row.id)" plain>移除</el-button>
                                </span>
                                <span v-else>
                                    <el-button type="primary" plain size="small" @click="onGroupMemberAdd(scope.row.id, 'GROUP_MEMBER')">+ 添加组员</el-button>
                                    <el-button type="success" plain size="small" @click="onGroupMemberAdd(scope.row.id, 'GROUP_OWNER')">+ 添加组长</el-button>
                                </span>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-col>
            </el-row>
        </el-drawer>
    </el-tab-pane>
  </el-tabs>
</template>

<style>
.el-row {
    margin-top: 33px
}
</style>
<script>
import { listProjects, deleteProjectById, getProjectById, testConnection, createOrUpdateProject } from '@/api/Project'
import { listGroupMembers, removeGroupMember, addGroupMember, updateGroupMemberRole } from '../api/Group'
import { listUsers } from '../api/User'
import { listOperationLogs } from '../api/OperationLog'
import { ElMessage } from 'element-plus'
import { databaseTypes } from '@/api/Const.js'

export default {
    data() {
        return {
            isShowProjectEditDialog: false,
            isShowAddGroupMemberDrawer: false,
            isShowProjectOperationLogDrawer: false,
            // ====== project domain ======
            projectPageData: {
                data: [],
                number: 1,
                size: 15,
                totalElements:0,
                totalPages: 1
            },
            projectFilter: {
                page: 0,
                size: 15,
                groupId: null,
                databaseType: null,
                nameContains: null,
                databaseNameContains: null
            },

            // ======= group domain =======
            groupMemberPageData: {
                data: [],
                number: 1,
                size: 10,
                totalElements:0,
                totalPages: 1
            },
            groupMemberFilter: {
                page: 0,
                size: 10,
                role: null,
                nicknameOrUsernameOrEmailContains: null
            },
            userPageQuery: {
                page: 0,
                size: 10,
                nicknameOrUsernameOrEmailContains: null
            },
            userPageData: {
                data: [],
                number: 1,
                size: 8,
                totalElements:0,
                totalPages: 1
            },

            // ======= project form ======
            projectForm: {
                id: null,
                name: null,
                description: null,
                groupId: null,
                dataSource: {
                    username: null,
                    databaseType: null,
                    databaseName: null,
                    password: null,
                    url: null,
                    properties: []
                },
                projectSyncRule: {
                    isAutoSync: false,
                    autoSyncCron: null,
                    ignoreTableNameRegexes: [],
                    ignoreColumnNameRegexes: []
                }
            },
            projectFormRules: {
                name: [ {required: true, message: '名称不能为空',trigger: 'blur'}, ],
                description: [ {required: true, message: '说明不能为空',trigger: 'blur'}, ],
                dataSource: {
                    username: [ {required: true,message: '数据库用户名不能为空',trigger: 'blur'} ],
                    url: [ {required: true,message: '数据库连接地址不能为空',trigger: 'blur'} ],
                    databaseName: [ {required: true,message: '数据库名称不能为空',trigger: 'blur'} ],
                    databaseType: [ {required: true,message: '请选择数据库类型',trigger: 'change'} ],
                }
            },
            testConnectionState: {
                buttonType: 'primary',
                isTest: false,
                success: false,
                message: null,
            },
            loading: {
                testConnection: false
            },
            projectOperationLogPageData: {
                data: [],
                number: 1,
                size: 10,
                totalElements:0,
                totalPages: 1
            },

            projectOperationLogPageQuery: {
                page: 0,
                size: 10,
                involveProjectId: null,
                module: 'project',
            },
            // ======= common domain ======
            databaseTypes: databaseTypes,
            groupId: null,
            roleTypes: ['GROUP_OWNER', 'GROUP_MEMBER']
        }
    },
    
    created() {
        if (this.$route.params.groupId) {
            this.projectFilter.groupId = this.$route.params.groupId
            this.groupId = this.$route.params.groupId
        }

        this.$watch(
            () => this.projectForm.dataSource,
            () => {
                this.testConnectionState.isTest = false
                this.testConnectionState.buttonType = 'primary'
            },
            { deep: true }
        )
        this.fetchGroupProjects()
        this.fetchGroupMembers()
    },

    methods: {
        // ========== group domain ===========
        formatRoleName(role) {
            if (role == 'GROUP_OWNER') {
                return '组长'
            } else if (role == 'GROUP_MEMBER') {
                return '组员'
            } else {
                return '未知'
            }
        },
        fetchGroupMembers(currentPage) {
            if (currentPage) {
                this.groupMemberFilter.page = currentPage - 1
            } else {
                this.groupMemberFilter.page = 0
            }
            listGroupMembers(this.$route.params.groupId, this.groupMemberFilter).then(jsonData => {
                this.groupMemberPageData.data = jsonData.data.content
                this.groupMemberPageData.number = jsonData.data.number + 1
                this.groupMemberPageData.size = jsonData.data.size
                this.groupMemberPageData.totalPages = jsonData.data.totalPages
                this.groupMemberPageData.totalElements = jsonData.data.totalElements
            })
        },
        onGroupRoleFilterClear() {
            this.groupMemberFilter.role = null
        },
        onGroupMemberQuery() {
            this.groupMemberFilter.page = 0
            if (this.groupMemberFilter.role == '') {
                this.groupMemberFilter.role = null
            }
            this.fetchGroupMembers()
        },
        onGroupMemberCurrentPageChange(currentPage) {
            if (currentPage && (currentPage -1) != this.groupMemberFilter.page) {
                this.groupMemberFilter.page = currentPage - 1
                this.fetchGroupMembers()
            }
        },
        onGroupMemberRemove(nickname, userId) {
            const groupId = this.$route.params.groupId
            this.$confirm('确认移除成员['+nickname+']', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                removeGroupMember(groupId , userId).then(resp => {
                    if (!resp.errCode) {
                        this.$message.success("移除成功")
                        this.fetchGroupMembers()
                        if(this.isShowAddGroupMemberDrawer) {
                            this.userPageData.data.filter(u => u.id == userId).forEach(u => {
                                const idx = u.inGroupIds.indexOf(this.groupId)
                                u.inGroupIds.splice(idx, 1)
                            })
                        }
                    }
                })
            })

        },
        onGroupMemberRoleUpdate(user, role) {
            const groupId = this.$route.params.groupId
            updateGroupMemberRole(groupId, user.userId, role).then(resp => {
                if (!resp.errCode) {
                    const roleDesc = role == 'GROUP_OWNER' ? '组长' : '组员'
                    this.$message.success("成功设置为"+roleDesc)
                    user.role = role
                }
            })
        },
        isInGroup(user) {
            return user.inGroupIds.some(item => item == this.groupId)
        },
        // ========= group member add domain ========
        fetchUsers(currentPage) {
            if (currentPage) {
                this.userPageQuery.page = currentPage - 1
            } else {
                this.userPageQuery.page = null
            }
            listUsers(this.userPageQuery).then(resp => {
                if (!resp.errCode) {
                    this.userPageData.data = resp.data.content
                    this.userPageData.number = resp.data.number + 1
                    this.userPageData.size = resp.data.size
                    this.userPageData.totalPages = resp.data.totalPages
                    this.userPageData.totalElements = resp.data.totalElements
                }
            })
        },
        onClickShowAddGroupMemberDrawer() {
            this.isShowAddGroupMemberDrawer = true
            this.fetchUsers()
        },
        onGroupMemberAdd(userId, role) {
            const body = {
                userId: userId,
                role: role
            }
            const groupId = this.$route.params.groupId
            addGroupMember(groupId, body).then(resp => {
                if (!resp.errCode) {
                    this.$message.success("添加成功")
                    this.userPageData.data.filter(u => u.id == userId).forEach(u => {
                        u.inGroupIds.push(this.groupId)
                    })
                    this.fetchGroupMembers()
                }
            })
        },
        onUserPageSizeChange(currentSize) {
            if (currentSize) {
                this.userPageQuery.size = currentSize
                this.fetchUsers()
            }
        },
        // ========== project domain ===========
        fetchGroupProjects() {
            if (this.projectFilter.databaseType == '') {
                this.projectFilter.databaseType = null
            }
            listProjects(this.projectFilter).then(resp => {
                if (!resp.errCode) {
                    this.projectPageData.data = resp.data.content
                    this.projectPageData.number = resp.data.number + 1
                    this.projectPageData.size = resp.data.size
                    this.projectPageData.totalPages = resp.data.totalPages
                    this.projectPageData.totalElements = resp.data.totalElements
                }
            })
        },
        onProjectDatabaseTypeClear() {
            this.projectFilter.databaseType = null
        },
        onProjectQuery() {
            this.projectFilter.page = 0
            this.fetchGroupProjects()
        },
        onProjectListCurrentPageChange(currentPage) {
            if (currentPage && (currentPage -1) != this.projectFilter.page) {
                this.projectFilter.page = currentPage - 1
                this.fetchGroupProjects()
            }
        },
        onProjectDelete(id) {
            this.$confirm('确认删除该项目？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                deleteProjectById(this.groupId, id).then(resp => {
                    if (!resp.errCode) {
                        ElMessage({
                            showClose: true,
                            message: '删除成功',
                            type: 'success',
                            duration: 3 * 1000
                        });
                        this.onProjectQuery()
                    }
                })
            })
        },
        toEditProject(row) {
            getProjectById(row.id).then(resp => {
                        this.projectForm = resp.data
                        this.isShowProjectEditDialog = true
                    })
        },
        toCreateProject() {
            const groupId = this.$route.params.groupId
            this.projectForm = {
                id: null,
                name: null,
                description: null,
                groupId: groupId,
                dataSource: {
                    username: null,
                    databaseType: null,
                    databaseName: null,
                    password: null,
                    url: null,
                    properties: []
                },
                projectSyncRule: {
                    isAutoSync: false,
                    autoSyncCron: null,
                    ignoreTableNameRegexes: [],
                    ignoreColumnNameRegexes: []
                }
            }
            this.isShowProjectEditDialog = true
        },
        toDocumentPage(project) {
            const groupId = this.$route.params.groupId
            const projectId = project.id
            this.$router.push({
                path: "/groups/" + groupId + "/projects/" + projectId +  "/documents",
                query: { projectName: project.name }
            })
        },

        // project operation logs
        fetchProjectOperationLogs(currentPage) {
            if (currentPage) {
                this.projectOperationLogPageQuery.page = currentPage - 1
            } else {
                this.projectOperationLogPageQuery.page = null
            }
            listOperationLogs(this.projectOperationLogPageQuery).then(resp => {
                if (!resp.errCode) {
                    this.projectOperationLogPageData.data = resp.data.content
                    this.projectOperationLogPageData.number = resp.data.number + 1
                    this.projectOperationLogPageData.size = resp.data.size
                    this.projectOperationLogPageData.totalPages = resp.data.totalPages
                    this.projectOperationLogPageData.totalElements = resp.data.totalElements
                }
            })
        },
        onProjectOperationLogCurrentPageChange(currentPage) {
            if (currentPage && (currentPage -1) != this.projectOperationLogPageQuery.page) {
                this.projectOperationLogPageQuery.page = currentPage - 1
                this.fetchProjectOperationLogs(currentPage)
            }
        },
        toProjectOperationLogDrawer(project) {
            this.projectOperationLogPageQuery.involveProjectId = project.id
            this.fetchProjectOperationLogs()
            this.isShowProjectOperationLogDrawer = true
        },
        
        // project form domain
        onProjectFormSave(){
            this.$refs.projectFormRulesRef.validate((valid) => {
                if(!valid) {
                    this.$message.error('请填写表单必填项')
                    return false
                } 

                if (!this.projectForm.id && !this.projectForm.dataSource.password) {
                    this.$message.error('请填写数据库连接密码')
                    return false
                }

                createOrUpdateProject(this.projectForm).then(resp => {
                    if (!resp.errCode) {
                        this.$message.success('保存成功')
                        this.fetchGroupProjects()
                        this.isShowProjectEditDialog = false
                    }
                    return true;
                })
            })
        },
        onProjectFormCancel(){
            this.isShowProjectEditDialog = false
        },

        addDataSourceProperty(){
            this.projectForm.dataSource.properties.push({key:"", value:""})
        },

        removeDataSourceProperty(index){
            this.projectForm.dataSource.properties.splice(index, 1)
        },

        addIgnoreTableName(){
            this.projectForm.projectSyncRule.ignoreTableNameRegexes.push("")
        },

        removeIgnoreTableName(index) {
            this.projectForm.projectSyncRule.ignoreTableNameRegexes.splice(index, 1)
        },

        addIgnoreColumnName(){
            this.projectForm.projectSyncRule.ignoreColumnNameRegexes.push("")
        },

        removeIgnoreColumnName(index){
            this.projectForm.projectSyncRule.ignoreColumnNameRegexes.splice(index, 1)
        },

        onTestConnection(){
            this.loading.testConnection = true
            this.$refs.projectFormRulesRef.validate((valid) => {
                if(!valid) {
                    this.$message.error('请填写表单必填项')
                    this.loading.testConnection = false
                    return false
                } 

                if (!this.projectForm.id && !this.projectForm.dataSource.password) {
                    this.$message.error('请填写数据库连接密码')
                    this.loading.testConnection = false
                    return false
                }
                const request = {
                    projectId: this.projectForm.id,
                    databaseType: this.projectForm.dataSource.databaseType,
                    databaseName: this.projectForm.dataSource.databaseName,
                    username: this.projectForm.dataSource.username,
                    password: this.projectForm.dataSource.password,
                    url: this.projectForm.dataSource.url,
                    properties: this.projectForm.dataSource.properties
                }
                testConnection(request).then(resp => {
                    if (!resp.errCode) {
                        this.testConnectionState.success = true
                        this.testConnectionState.buttonType = 'success'
                        this.$message.success('连接成功')
                    } else {
                        this.testConnectionState.success = false
                        this.testConnectionState.buttonType = 'danger'
                    }
                    this.testConnectionState.isTest = true
                    this.testConnectionState.message = resp.errMessage
                }).finally(() => this.loading.testConnection = false)
            })
            
        }
    }
}
</script>