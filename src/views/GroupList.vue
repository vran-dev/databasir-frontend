<template>
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
                    <el-card shadow="hover">
                        <template #header>
                            <div class="card-header">
                                <el-link :underline="false">
                                    <span @click="toGroupDashboard(group.id, group.name)">{{ group.name }}</span>
                                </el-link>
                                <el-tooltip content="编辑" placement="top"  v-require-roles="['SYS_OWNER', 'GROUP_OWNER?groupId='+group.id]">
                                    <el-button icon="edit" size="small" @click="toEditPage(group.id, group.name)" circle   v-require-roles="['SYS_OWNER', 'GROUP_OWNER?groupId='+group.id]"></el-button>
                                </el-tooltip>
                            </div>
                        </template>
                        <el-descriptions :column="1"  @click="toGroupDashboard(group.id)">
                            <el-descriptions-item label="描述" label-align="left" align="left">
                                <span style="white-space: pre-line;"> {{ group.description }}</span>
                            </el-descriptions-item>
                            <el-descriptions-item label="组长" label-align="left" align="left">
                                <el-space wrap>
                                    <el-tag v-for="(owner, index) in group.groupOwnerNames" :key="index" effect='plain'> {{ owner }}</el-tag>
                                </el-space>
                            </el-descriptions-item>
                            <el-descriptions-item label="项目" label-align="left" align="left">{{ group.projectCount }}</el-descriptions-item>
                        </el-descriptions>
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
    </el-container>
</template>

<style>
.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
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
import { user } from '../utils/auth'

export default {
    data() {
      return {
          isShowEditGroupDialog: false,
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
          }
      }
    },
    
    created() {
        this.fetchGroupsFunction()
    },
    
    methods: {
        isPermit(role) {
            return user.hasAnyRoles([ role ])
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

        }
    }
}

</script>