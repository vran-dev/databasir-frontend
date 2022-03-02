<template>
    <el-container>
        <el-header>
            <el-row :gutter="12">
                <el-col :span="2">
                    <el-tooltip content="创建应用" placement="top">
                        <el-button type="primary"  icon="plus" style="width: 100%" @click="onAppCreate()"></el-button>
                    </el-tooltip>
                </el-col>
                <el-col :span="6">
                    <el-input @change='onQuery' v-model="appPageQuery.appNameContains" label="应用名称" placeholder="应用名称搜素" prefix-icon="search"/>
                </el-col>
                <el-col :span="3">
                    <el-select v-model="appPageQuery.appType" placeholder="应用类型" @change="onQuery" clearable >
                        <el-option
                        v-for="item in appTypes"
                        :key="item"
                        :label="item"
                        :value="item"
                        >
                        </el-option>
                    </el-select>
                </el-col>

            </el-row>
        </el-header>
        <el-main>
            <el-table :data="appPageData.data">
                <el-table-column prop="registrationId" label="应用 ID" />
                <el-table-column prop="appType" label="应用类型">
                    <template v-slot="scope">
                         <oauth2-app-type :app-type="scope.row.appType" :app-name="scope.row.appName"/>
                    </template>
                </el-table-column>
                <el-table-column prop="appName" label="名称" />
                <el-table-column prop="appIcon" label="图标">
                    <template v-slot="scope">
                        <img :src="scope.row.appIcon" style="max-width: 33px; max-height: 33px;"/>
                    </template>
                </el-table-column>
                <el-table-column label="授权地址">
                    <template v-slot="scope">
                        <el-link type="info"> {{ scope.row.authUrl }}</el-link>
                    </template>
                </el-table-column>
                <el-table-column label="资源地址">
                    <template v-slot="scope">
                        <el-link type="info"> {{ scope.row.resourceUrl }}</el-link>
                    </template>
                </el-table-column>
                <el-table-column prop="clientId" label="Client ID" >
                </el-table-column>
                <el-table-column prop="updateAt" label="更新时间" />
                <el-table-column prop="createAt" label="创建时间" />
                <el-table-column label="操作">
                    <template v-slot="scope">
                        <el-space>
                            <el-button type="primary" size="small" icon="Edit" @click="onAppEdit(scope.row)">
                                编辑
                            </el-button>
                            <el-button type="danger" @click="onDelete(scope.row)" size="small" icon="Delete">
                                删除
                            </el-button>
                        </el-space>
                    </template>
                </el-table-column>
            </el-table>
            <el-dialog v-model="isShowEditAppDialog" width="38%" center destroy-on-close>
                <el-form :model="appFormData" label-position="top">
                    <el-row :gutter="28">
                        <el-col :span="8">
                            <el-form-item label="应用 ID"  prop="registrationId">
                                <el-input v-model="appFormData.registrationId"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">    
                            <el-form-item label="应用名称" prop="appName">
                                <el-input v-model="appFormData.appName" ></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            
                        </el-col>
                    </el-row>
                    <el-form-item label="应用类型" prop="appName">
                                <el-select v-model="appFormData.appType" placeholder="请选择应用类型" size="default">
                                    <el-option
                                    v-for="item in appTypes"
                                    :key="item"
                                    :label="item"
                                    :value="item"
                                    >
                                    </el-option>
                                </el-select>
                    </el-form-item>
                    <el-row :gutter="28">
                        <el-col :span="8">
                            <el-form-item label="Client Id" prop="clientId">
                                <el-input v-model="appFormData.clientId" ></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item label="Client Secret" prop="clientSecret">
                                <el-input v-model="appFormData.clientSecret" ></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row :gutter="28">
                        <el-col :span="8">
                            <el-form-item label="授权地址" prop="authUrl">
                                <el-input v-model="appFormData.authUrl" ></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item label="资源地址" prop="resourceUrl">
                                <el-input v-model="appFormData.resourceUrl" ></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                   
                    <el-form-item>
                        <el-button type="primary" @click="onAppSave('groupFormRef')">保存</el-button>
                        <el-button @click="isShowEditAppDialog = false">取消</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>

        </el-main>
        <el-footer>
            <el-pagination layout="prev, pager, next" 
                :hide-on-single-page="false"
                :currentPage="appPageData.number" 
                :page-size="appPageData.size" 
                :page-count="appPageData.totalPages"
                @current-change="onAppCurrentPageChange">
            </el-pagination>
        </el-footer>
    </el-container>
</template>

<script>

import { pageList, deleteById, updateApp, createApp, getById } from '../api/OAuthApp'
import Oauth2AppType from '../components/Oauth2AppType.vue'

export default {
    components: { Oauth2AppType },
    data() {
        return {
            appPageData: {
                data: [],
                number: 1,
                size: 10,
                totalElements:0,
                totalPages: 1
            },

            appPageQuery: {
                page: 0,
                size: 10,
                appNameContains: null,
                appType: null
            },

            isShowEditAppDialog: false,
            appFormData: {
                id: null,
            },
            appTypes: [
                'github', 'gitlab'
            ]
        }
    },

    created() {
        this.fetchApps()
    },

    methods: {
        fetchApps(currentPage) {
            if (currentPage) {
                this.appPageQuery.page = currentPage - 1
            } else {
                this.appPageQuery.page = null
            }
            if (this.appPageQuery.appType == '') {
                this.appPageQuery.appType = null
            }
            
            pageList(this.appPageQuery).then(resp => {
                if (!resp.errCode) {
                    this.appPageData.data = resp.data.content
                    this.appPageData.number = resp.data.number + 1
                    this.appPageData.size = resp.data.size
                    this.appPageData.totalPages = resp.data.totalPages
                    this.appPageData.totalElements = resp.data.totalElements
                }
            })
        },
        onAppCurrentPageChange(currentPage) {
            if (currentPage && (currentPage -1) != this.appPageQuery.page) {
                this.appPageQuery.page = currentPage - 1
                this.fetchApps(currentPage)
            }
        },
        onQuery() {
            this.fetchApps()
        },
        onAppEdit(app) {
            getById(app.id).then(resp => {
                if(!resp.errCode) {
                    this.appFormData = resp.data
                    this.isShowEditAppDialog = true
                }
            })
        },
        onAppCreate() {
            this.appFormData = {}
            this.isShowEditAppDialog = true
        },
        onDelete(app) {
             this.$confirm('确认删除该 APP 登录方式吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                deleteById(app.id).then(resp => {
                    if (!resp.errCode) {
                        this.$message.success('删除成功')
                        this.fetchApps()
                    }
                })
            })
        },
        onAppSave() {
            if(this.appFormData.id) {
                updateApp(this.appFormData).then(resp => {
                    if (!resp.errCode) {
                        this.$message.success('更新成功')
                        this.isShowEditAppDialog = false
                        this.fetchApps()
                    }
                })
            } else {
                createApp(this.appFormData).then(resp => {
                    if (!resp.errCode) {
                        this.$message.success('创建成功')
                        this.isShowEditAppDialog = false
                        this.fetchApps()
                    }
                })
            }
        },
    }
}

</script>