<template>
  <el-tabs>
    <!-- project list -->
    <el-tab-pane label="项目列表">
        <el-row :gutter="12">
            <el-col :span="3" v-require-roles="['SYS_OWNER', 'GROUP_OWNER?groupId='+groupId, 'GROUP_MEMBER?groupId='+groupId]">
                <el-tooltip content="新建一个新项目" placement="top">
                    <el-button type="primary" style="width:100%" icon="plus" @click="toProjectEditPage(null)">新建</el-button>
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
                        <el-link :underline="true" :icon="Edit" @click.stop="onClickShowProjectDetail(scope.row)">{{ scope.row.name }}</el-link>
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
                            <el-button type="primary" size="small" @click.stop="toProjectEditPage(scope.row)">编辑</el-button>
                            <el-button type="primary" size="small" @click.stop="toDocumentPage(scope.row)">查看文档</el-button>
                            <el-button type="danger" size="small" @click.stop="onProjectDelete(scope.row.id)">删除</el-button>
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

        <!-- project detail -->
        <el-drawer
            v-model="isShowProjectDetailDrawer"
            title="项目详情"
            size="50%"
        >
            <el-descriptions
                title="基础信息"
                :column="1"
                border
            >
                <el-descriptions-item label="项目名称">{{ projectDetailData.name }}</el-descriptions-item>
                <el-descriptions-item label="项目描述">{{ projectDetailData.description }}</el-descriptions-item>
                <el-descriptions-item label="创建时间" :span="2">{{ projectDetailData.createAt }}</el-descriptions-item>
            </el-descriptions>
            <br/>

            <el-descriptions
                title="数据源"
                :column="1"
                border
            >
                <el-descriptions-item label="地址">{{ projectDetailData.dataSource.url }}</el-descriptions-item>
                <el-descriptions-item label="用户名">{{ projectDetailData.dataSource.username }}</el-descriptions-item>
                <el-descriptions-item label="数据库名称">{{ projectDetailData.dataSource.databaseName }}</el-descriptions-item>
                <el-descriptions-item label="数据库类型">{{ projectDetailData.dataSource.databaseType }}</el-descriptions-item>
                <el-descriptions-item label="连接属性">
                    <ul>
                        <li v-for="(item, index) in projectDetailData.dataSource.properties" :key="index">
                            {{ item.key +' = '+item.value}}
                        </li>
                    </ul>
                </el-descriptions-item>

            </el-descriptions>
            <br/>
            <el-descriptions
                title="高级配置"
                :column="1"
                direction="vertical"
                border
            >
                <el-descriptions-item label="自动同步配置">
                    <el-tag v-if="projectDetailData.projectSyncRule.isAutoSync">
                        {{ projectDetailData.projectSyncRule.autoSyncCron }}
                    </el-tag>
                    <span v-else>
                        无
                    </span>
                </el-descriptions-item>
                <el-descriptions-item label="过滤表配置">
                    <el-space direction="vertical">
                        <el-tag v-for="(item, index) in projectDetailData.projectSyncRule.ignoreTableNameRegexes" :key="index">{{ item }}</el-tag>
                    </el-space>
                </el-descriptions-item><br>
                <el-descriptions-item label="过滤列配置">
                    <el-space direction="vertical">
                        <el-tag v-for="(item, index) in projectDetailData.projectSyncRule.ignoreColumnNameRegexes" :key="index">{{ item }}  </el-tag>
                    </el-space>
                </el-descriptions-item>
            </el-descriptions>
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
import { listProjects, deleteProjectById, getProjectById } from '@/api/Project'
import { listGroupMembers, removeGroupMember, addGroupMember, updateGroupMemberRole } from '../api/Group'
import { listUsers } from '../api/User'
import { ElMessage } from 'element-plus'
import { databaseTypes } from '@/api/Const.js'

export default {
    data() {
        return {
            isShowProjectDetailDrawer: false,
            isShowAddGroupMemberDrawer: false,
            // ====== project domain ======
            projectDetailData: {

            },
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

        onClickShowProjectDetail(row) {
            getProjectById(row.id).then(resp => {
                        this.projectDetailData =  resp.data
                        this.isShowProjectDetailDrawer = true
                    })
        },
        
        toProjectEditPage(project) {
            const groupId = this.$route.params.groupId
            if (project != null) {
                const projectId = project.id
                const projectName = project.name
                this.$router.push({
                    path: "/groups/"+ groupId +"/projects/" + projectId + "/edit",
                    query: { projectName: projectName }
                })
            } else {
                this.$router.push({path: "/groups/"+groupId+"/projects/create"})
            }
        },

        toDocumentPage(project) {
            const groupId = this.$route.params.groupId
            const projectId = project.id
            this.$router.push({
                path: "/groups/" + groupId + "/projects/" + projectId +  "/documents",
                query: { projectName: project.name }
            })
        }        
    }
}
</script>