<template>
    <el-tabs v-model="activeTab" @tab-click="onTabClick">
        <el-tab-pane label="项目分组" name="groupListTab">
            <el-container>
                <el-header>
                    <el-row :gutter="12">
                        <el-col :span="3" v-require-roles="['SYS_OWNER']">
                            <el-tooltip content="创建一个分组" placement="top">
                                <el-button type="primary"  icon="plus"  style="width:100%;" @click="toCreatePage()"></el-button>
                            </el-tooltip>
                        </el-col>
                        <el-col :span="8">
                            <el-input @change='onQuery' v-model="groupPageQuery.groupNameContains" label="组名" placeholder="组名称搜索" prefix-icon="search"/>
                        </el-col>
                    </el-row>
                </el-header>
                <el-main>
                    <el-row v-if="groupPageData.data.length == 0">
                        <el-col>
                            <el-empty description="请先创建分组"></el-empty>
                        </el-col>
                    </el-row>
                    <el-row v-else :gutter="20" v-for="(partition, index) in partitionArray(4, groupPageData.data)" :key="index" >
                        <el-col :span="6"  v-for="group in partition" :key="group.id">
                            <el-card shadow="hover" @mouseenter="mouseEnterGroupId=group.id" @mouseleave="mouseEnterGroupId=null">
                                <el-divider content-position="right">
                                        <el-link :underline="false" 
                                            v-show="group.id == mouseEnterGroupId" 
                                            v-require-roles="['SYS_OWNER', 'GROUP_OWNER?groupId='+group.id]" 
                                            @click="toEditPage(group.id, group.name)"
                                            icon="Edit" >
                                        </el-link>
                                        <el-link :underline="false">
                                            <span @click="toGroupDashboard(group.id, group.name)">
                                                <h4>
                                                    {{ group.name }}
                                                </h4>    
                                            </span>
                                        </el-link>
                                </el-divider>
                                <el-space direction="vertical" alignment="stretch" :size="16">
                                        <span style="color:#909399;font-size:13px;">
                                            {{ group.description }}
                                        </span>
                                        <el-space wrap>
                                            <el-tooltip content="组长">
                                                <el-icon color="#909399"><user /></el-icon>
                                            </el-tooltip>
                                            <el-tag v-for="(owner, index) in group.groupOwnerNames.slice(0, 2)" :key="index"  type="info"> {{ owner }}</el-tag>
                                            <template v-if="group.groupOwnerNames.length > 2">
                                                <el-dropdown>
                                                    <el-icon class="el-icon--right">
                                                        <arrow-down />
                                                    </el-icon>
                                                    <template #dropdown>
                                                    <el-dropdown-menu>
                                                        <el-dropdown-item v-for="(owner, index) in group.groupOwnerNames.slice(3)" :key="index">
                                                            <el-tag type="info">{{ owner }}</el-tag>
                                                        </el-dropdown-item>
                                                    </el-dropdown-menu>
                                                    </template>
                                                </el-dropdown>
                                            </template>
                                        </el-space>
                                        <el-space wrap>
                                            <el-tooltip content="项目数">
                                                <el-icon color="#909399"><folder /></el-icon>
                                            </el-tooltip>
                                            <span style="color:#909399">
                                                {{ group.projectCount }}
                                            </span>
                                        </el-space>
                                </el-space>
                            </el-card>
                        </el-col>
                    </el-row>
                </el-main>
                <el-footer>
                    <el-pagination layout="prev, pager, next" 
                        :hide-on-single-page="false"
                        :currentPage="groupPageData.number" 
                        :page-size="groupPageData.size" 
                        :page-count="groupPageData.totalPages"
                        @current-change="onPageChange">
                    </el-pagination>
                </el-footer>
            </el-container>
        </el-tab-pane>
        <el-tab-pane label="关注项目" name="favoriteProjectListTab">
            <el-container>
                <el-main>
                    <el-table :data="favoriteProjectPageData.data"  stripe>
                        <el-table-column prop="projectId" label="项目 ID"/>
                        <el-table-column prop="projectName" label="项目名称" >
                            <template v-slot="scope">
                                <el-link @click="toDocumentPage(scope.row)" icon="Document">
                                    <span>{{ scope.row.projectName }}</span>
                                </el-link>
                            </template>
                            
                        </el-table-column>
                        <el-table-column prop="projectDescription" label="项目描述" />
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
                        <el-table-column label="数据库类型">
                            <template v-slot="scope">
                                <database-icon :databaseType="scope.row.databaseType" />
                            </template>
                        </el-table-column>
                        <el-table-column prop="databaseName" label="数据库名称" />
                        <el-table-column prop="groupName" label="所属分组">
                            <template v-slot="scope">
                                <el-link @click="toGroupDashboard(scope.row.groupId, scope.row.groupName)" icon="List">
                                    {{ scope.row.groupName }}
                                </el-link>
                            </template>
                        </el-table-column>
                        <el-table-column prop="createAt" label="关注时间" />
                        <el-table-column label="操作" >
                            <template v-slot="scope">
                                <el-dropdown>
                                    <span>
                                        更多
                                    <el-icon >
                                        <arrow-down />
                                    </el-icon>
                                    </span>
                                    <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item>
                                            <el-button type="primary" size="small" @click.stop="toDocumentPage(scope.row)" icon="View">查看文档</el-button>
                                        </el-dropdown-item>
                                        <el-dropdown-item>
                                            <el-button type="warning" size="small" @click.stop="onRemoveFavorite(scope.row.projectId)" icon="StarFilled">取消关注</el-button>
                                        </el-dropdown-item>
                                        <el-dropdown-item v-require-roles="['SYS_OWNER', 'GROUP_OWNER?groupId='+groupId]">
                                            <el-button type="danger" size="small" @click.stop="onProjectDelete(scope.row.projectId)" icon="Remove">删除项目</el-button>
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                    </template>
                                </el-dropdown>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-main>
                <el-footer>
                    <el-pagination layout="prev, pager, next" 
                        :hide-on-single-page="false"
                        :currentPage="favoriteProjectPageData.number" 
                        :page-size="favoriteProjectPageData.size" 
                        :page-count="favoriteProjectPageData.totalPages"
                        @current-change="onFavoriteProjectPageChange">
                    </el-pagination>
                </el-footer>
            </el-container>
            
        </el-tab-pane>
    </el-tabs>


    <el-dialog v-model="isShowEditGroupDialog" width="38%" center destroy-on-close>
        <el-form :model="groupData" :rules="groupDataRule" ref="groupFormRef" label-position="top">
            <el-form-item label="名称"  prop="name">
                <el-input v-model="groupData.name"></el-input>
            </el-form-item>

            <el-form-item label="描述" prop="description">
                <el-input v-model="groupData.description" type="textarea"></el-input>
            </el-form-item>

            <h2>组长管理</h2>
            <el-form-item>
                <el-autocomplete
                    v-model="userQueryData.nicknameOrUsernameOrEmailContains"
                    :fetch-suggestions="queryUsersAsync"
                    placeholder="用户名、昵称或邮箱搜索"
                    @select="onGroupOwnerSelect"
                    clearable
                >
                </el-autocomplete>
            </el-form-item>
            <el-form-item>
                <el-space wrap>
                <el-tag
                v-for="(user, index) in groupData.groupOwners"
                :key="user.id"
                type="primary"
                size="large"
                closable
                :disable-transitions="false"
                @close="onGroupOwnerRemove(index)"
                >
                <el-tooltip :content="user.email" placement="top">
                    <span>{{ user.nickname }}</span>
                </el-tooltip>
                </el-tag>
                </el-space>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="onGroupSave('groupFormRef')">保存</el-button>
                <el-button @click="isShowEditGroupDialog = false">取消</el-button>
            </el-form-item>
        </el-form>
        <el-collapse v-if="groupData.id">
            <el-collapse-item name="1">
                <template #title><el-icon><warning-filled /></el-icon>删除分组</template>
                <el-tooltip content="数据一旦删除将无法恢复，谨慎操作" placement="top">
                    <el-button icon="delete" size="large" style="width:100%;margin:0 auto;" @click="onGroupDelete(groupData.id)">确认删除分组</el-button>
                </el-tooltip>
            </el-collapse-item>
        </el-collapse>
    </el-dialog>
</template>

<style>
.card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 22px;
}

.el-row {
  margin-bottom: 20px;
}

.el-row:last-child {
  margin-bottom: 0;
}
</style>

<script>
import { listGroups, getGroup, createOrUpdateGroup, deleteGroup } from "@/api/Group"
import { listUsers } from "@/api/User"
import { listFavorites, removeFavorite } from "../api/UserProject"
import { deleteProjectById } from "../api/Project"
import { user } from '../utils/auth'

export default {
    data() {
      return {
          isShowEditGroupDialog: false,
          mouseEnterGroupId: null,
          groupData: {
              groupOwners: []
          },
          groupDataRule: {
            name: [this.requiredInputValidRule('请输入有效昵称')],
            description: [this.requiredInputValidRule('请输入有效邮箱')]
          },
          userQueryData: {
              nicknameContains: null,
              nicknameOrUsernameOrEmailContains: null,
              size: 50
          },
          groupPageData: {
             data: [],
             number: 1,
             size: 15,
             totalElements:0,
             totalPages: 1
          },
          groupPageQuery: {
            page: 0,
            size: 15,
            groupNameContains: null
          },

          favoriteProjectPageData: {
            data: [],
            number: 1,
            size: 15,
            totalElements:0,
            totalPages: 1
          },
          favoriteProjectPageQuery: {
            page: 0,
            size: 20,
            projectNameContains: null
          }
      }
    },
    
    created() {
        this.fetchGroupsFunction()
        this.fetchUserFavorites()
    },

    computed: {
        activeTab: {
            get(){
                if (this.$store.state.groupListActiveTab) {
                    return this.$store.state.groupListActiveTab
                } else {
                    this.$store.commit('switchGroupListActiveTab', 'groupListTab')
                    return "groupListTab"
                }
            },
            set(newVal) {
                this.$store.commit('switchGroupListActiveTab', newVal)
            }
        }
    },
        
    methods: {
        isPermit(role) {
            return user.hasAnyRoles([ role ])
        },
        async fetchUserFavorites() {
            const jsonData = await listFavorites(this.favoriteProjectPageQuery)
            this.favoriteProjectPageData.data = jsonData.data.content
            this.favoriteProjectPageData.number = jsonData.data.number + 1
            this.favoriteProjectPageData.size = jsonData.data.size
            this.favoriteProjectPageData.totalPages = jsonData.data.totalPages
            this.favoriteProjectPageData.totalElements = jsonData.data.totalElements
        },
        async fetchGroupsFunction() {
            const jsonData = await listGroups(this.groupPageQuery)
            this.groupPageData.data = jsonData.data.content
            this.groupPageData.number = jsonData.data.number + 1
            this.groupPageData.size = jsonData.data.size
            this.groupPageData.totalPages = jsonData.data.totalPages
            this.groupPageData.totalElements = jsonData.data.totalElements
        },
        requiredInputValidRule(message) {
            return {
                required: true,
                message: message,
                trigger: 'blur',
            }
        },
        requiredGroupOwners() {
            if (this.groupData.groupOwners == null 
            || this.groupData.groupOwners.length < 1
            || this.groupData.groupOwners.length > 20) {
                return false
            } else {
                return true
            }
        },
        partitionArray(size, arr) {
            var output = []
            var idx = 0
            for (var i = 0; i < arr.length; i += size)
            {
                output[idx++] = arr.slice(i, i + size)
            }
            return output
        },

        onPageChange(currentPage) {
            if (currentPage) {
                this.groupPageQuery.page = currentPage - 1
                this.fetchGroupsFunction()
            }
        },

        onQuery() {
            this.fetchGroupsFunction()
        },
        async queryUsersAsync(query, callback) {
            const data = await listUsers(this.userQueryData).then(resp => resp.data.content)
            const users = data.map(u => {
                return {
                    value: u.nickname,
                    nickname: u.nickname,
                    email: u.email,
                    id: u.id
                }
            })
            callback(users)
        },

        onGroupDelete(groupId) {
            this.$confirm('确认删除该分组？删除后数据将无法恢复', '警告', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                deleteGroup(groupId).then(resp => {
                    if (!resp.errCode) {
                        this.$message.success('删除成功')
                        this.isShowEditGroupDialog = false
                        this.fetchGroupsFunction()
                    }
                })
            })
        },
        onGroupSave() {
            if (!this.requiredGroupOwners()) {
                this.$message.warning('组长人数至少需要 1 人，最多为 20 人')
                return
            }
            this.$refs.groupFormRef.validate(valid => {
                if (valid) {
                    const request = Object.assign({}, this.groupData)
                    request.groupOwnerUserIds = this.groupData.groupOwners.map(r => r.id)
                    createOrUpdateGroup(request).then(resp => {
                        if (!resp.errCode) {
                            this.$message.success('保存成功')
                            this.isShowEditGroupDialog = false
                            this.groupData = { groupOwners: [] }
                            this.fetchGroupsFunction()
                        }
                    })
                } else {
                    this.$message.error('请填写表单必填项')
                }
            })
            
        },

        onGroupOwnerRemove(index) {
            this.groupData.groupOwners.splice(index, 1)
        },
        onGroupOwnerSelect(item) {
            if (!this.groupData.groupOwners.some(data => data.id == item.id)) {
                this.groupData.groupOwners.push(item)
            }
        
            this.userQueryData.nicknameOrUsernameOrEmailContains = null
        },
        toCreatePage() {
            this.isShowEditGroupDialog = true
            this.groupData = { groupOwners: [] }
        },
        toEditPage(groupId) {
            getGroup(groupId).then(resp => {
                if(!resp.errCode) {
                    this.isShowEditGroupDialog = true
                    this.groupData = resp.data
                }
            })
        },
        toGroupDashboard(groupId, groupName) {
            this.$router.push({path: "/groups/"+groupId, query: {groupName: groupName }})
        },

        toGroupMemberListPage() {

        },
        toDocumentPage(favoriteProject) {
            const groupId = favoriteProject.groupId
            const projectId = favoriteProject.projectId
            this.$router.push({
                path: "/groups/" + groupId + "/projects/" + projectId +  "/documents",
                query: { projectName: favoriteProject.projectName, groupName: favoriteProject.groupName }
            })
        },
        onFavoriteProjectPageChange(currentPage) {
            if (currentPage) {
                this.favoriteProjectPageQuery.page = currentPage - 1
                this.fetchUserFavorites()
            }
        },
        onRemoveFavorite(projectId) {
            removeFavorite(projectId).then(resp => {
                if (!resp.errCode) {
                    this.$message.success('成功取消')
                    this.fetchUserFavorites()
                }
            })
        },
        onProjectDelete(id) {
            this.$confirm('确认删除该项目？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                deleteProjectById(this.groupId, id).then(resp => {
                    if (!resp.errCode) {
                        this.$message.success('删除成功');
                        this.fetchUserFavorites()
                    }
                })
            })
        },
        onTabClick(tab) {
            this.$store.commit('switchGroupListActiveTab', tab.props.name)
        }
    }
}

</script>