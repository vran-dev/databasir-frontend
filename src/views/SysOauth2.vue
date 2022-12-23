<template>
    <el-container>
        <el-main>
            <el-row :gutter="12">
                <el-col :xs="24" :sm="6" :md="6" :lg="3" :xl="3">
                    <el-tooltip content="创建应用" placement="top">
                        <el-button type="primary"  icon="plus" style="width: 100%" @click="onAppCreate()"></el-button>
                    </el-tooltip>
                </el-col>
                <el-col :xs="24" :sm="10" :md="10" :lg="6" :xl="4">
                    <el-input @change='onQuery' v-model="appPageQuery.appNameContains" label="应用名称" placeholder="应用名称搜素" prefix-icon="search"/>
                </el-col>
                <el-col :xs="24" :sm="8" :md="8" :lg="6" :xl="4">
                    <el-select v-model="appPageQuery.appType" placeholder="应用类型" @change="onQuery" clearable style="width:100%;">
                        <el-option
                        v-for="item in appTypes"
                        :key="item"
                        :label="item.name"
                        :value="item.type"
                        >
                        </el-option>
                    </el-select>
                </el-col>
                <el-col :span="24">
                    <el-divider></el-divider>
                </el-col>
            </el-row>
            <el-row :gutter="33">
                <el-col :xs="24" :sm="24" :md="12" :lg="8" :xl="6" v-for="item in appPageData.data" :key="item.id" >
                    <el-card shadow="hover">
                        <el-divider content-position="left">
                            <oauth2-app-type :app-type="item.appType" :app-name="item.appName"/>
                            <span style="margin-left: 12px;">
                                {{item.appName}}
                            </span>
                        </el-divider>

                        <div>
                            <el-descriptions
                                :column="1"
                                :size="size"
                                border
                            >   
                                <el-descriptions-item label="appId">
                                    <template #label>
                                        应用 ID
                                    </template>
                                    {{ item.registrationId }}
                                </el-descriptions-item>
                                <el-descriptions-item label="appType">
                                    <template #label>
                                        应用类型
                                    </template>
                                    <el-tag>
                                    {{ item.appType }}
                                    </el-tag>
                                </el-descriptions-item>
                                <el-descriptions-item label="创建时间">
                                    <template #label>
                                        创建时间
                                    </template>
                                    {{item.createAt}}
                                </el-descriptions-item>
                            </el-descriptions>
                        </div>
                        
                        <div style="margin-top:20px;">
                            <el-space>
                                <el-button type="primary" size="small" icon="Edit" @click="onAppEdit(item)">
                                    编辑
                                </el-button>
                                <el-button type="danger" @click="onDelete(item)" size="small" icon="Delete">
                                    删除
                                </el-button>
                            </el-space>
                        </div>
                    </el-card>
                </el-col>
            </el-row>
            <el-empty :image-size="200" v-if="appPageData.data.length == 0" description="暂无数据"/>

            <el-dialog v-model="isShowEditAppDialog" width="38%" center destroy-on-close>
                <el-form :model="appFormData" :rules="appFormDataRule" ref="appFormDataRef" label-position="top">
                    <el-row :gutter="28">
                        <el-col :xs="24" :sm="24" :md="12" :lg="10" >
                            <el-form-item label="应用 ID"  prop="registrationId">
                                <el-input v-model="appFormData.registrationId" placeholder="建议输入全英文字符"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :xs="24" :sm="24" :md="12" :lg="10">    
                            <el-form-item label="应用名称" prop="appName">
                                <el-input v-model="appFormData.appName" placeholder="用户可理解的登陆应用名"></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-form-item label="应用类型" prop="appName">
                        <el-select v-model="appFormData.appType" placeholder="请选择应用类型" size="default" @change="onAppTypeChange()">
                            <el-option
                            v-for="item in appTypes"
                            :key="item"
                            :label="item.name"
                            :value="item.type"
                            >
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-row :gutter="28">
                        <el-col :xs="24" :sm="24" :md="12" :lg="10" v-for="item in selectedPlatform.properties" :key="item.authAppType">
                            <el-form-item :label="item.label" :prop="item.name">
                                <el-input v-model="item.value" :placeholder="item.description"></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row style="margin-bottom: 33px">
                        <el-col>
                            <el-divider>
                                <el-icon color="#000"><info-filled /></el-icon>
                                请在 {{ appFormData.appType }} 中配置回调地址
                            </el-divider>
                            <el-link type="primary">{{ redirectUri }}{{ appFormData.registrationId }}</el-link>
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

<style>
.el-col {
    margin-bottom:20px;
}
</style>

<script>

import { pageList, deleteById, updateApp, createApp, getById, listPlatforms } from '../api/OAuthApp'
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
                totalPages: 0
            },
            appPageQuery: {
                page: 0,
                size: 10,
                appNameContains: null,
                appType: null
            },

            isShowEditAppDialog: false,
            redirectUri: '',
            appFormData: {
                id: null,
            },
            appFormDataRule: {
                registrationId: [                    
                    { required: true,message: '请为应用配置唯一 ID', trigger: 'blur'},
                ],
                appName: [                    
                    { required: true,message: '请输入应用名称', trigger: 'blur'},
                ],
                appType: [
                    { required: true,message: '请选择应用类型', trigger: 'blur'},
                ],
                authUrl: [
                    { required: true,message: '请配置请求授权地址', trigger: 'blur'},
                ],
                resourceUrl: [
                    { required: true,message: '请配置资源 API 地址', trigger: 'blur'},
                ],
                clientId: [
                    { required: true,message: '请配置申请的 clientId', trigger: 'blur'},
                ],
                clientSecret: [
                    { required: true,message: '请配置申请的 clientSecret', trigger: 'blur'},
                ]
            },
            appTypes: [],
            platforms:[],
            selectedPlatform:{}
        }
    },

    created() {
        this.redirectUri = window.location.protocol + "//" +window.location.host+"/login/oauth2/"
        this.fetchPlatforms()
        this.onAppCurrentPageChange(1)
    },
    methods: {
        fetchApps(currentPage) {
            if (currentPage) {
                this.appPageQuery.page = currentPage - 1
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
        fetchPlatforms() {
            listPlatforms().then(resp => {
                if(!resp.errCode) {
                    this.platforms = resp.data,
                    this.appTypes = resp.data.map(d => {
                        return {
                            type: d.authAppType,
                            name: d.authAppName
                        }
                    })
                }
            })
        },
        onAppCurrentPageChange(currentPage) {
            if (currentPage) {
                this.fetchApps(currentPage - 1)
            }
        },
        onQuery() {
            this.fetchApps()
        },
        onAppEdit(app) {
            getById(app.id).then(resp => {
                if(!resp.errCode) {
                    this.appFormData = resp.data
                    this.onAppTypeChange()
                    this.isShowEditAppDialog = true
                }
            })
        },
        onAppCreate() {
            this.appFormData = {}
            this.selectedPlatform = {}
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
            this.$refs.appFormDataRef.validate(valid => {
                if (valid) {
                    this.appFormData.properties = this.selectedPlatform.properties.map(item => {
                        return {
                            name: item.name,
                            value: item.value
                        }
                    })
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
                } else {
                    this.$message.error('请填写表单必填项')
                }
            })
            
        },
        onAppTypeChange() {
            const currentAppType = this.appFormData.appType
            if (currentAppType) {
                // eslint-disable-next-line
                const formData = this.appFormData
                const selected =  this.platforms.find(item => item.authAppType == currentAppType)
                selected.properties.forEach(item => {
                    if (item.defaultValue && item.defaultValue.startsWith("javaScript:")) {
                        item.value = eval(item.defaultValue.substr("javaScript:".length))
                    } else {
                        item.value = item.defaultValue
                    }
                })

                if (this.appFormData.properties) {
                    const propertyMapByName = new Map(this.appFormData.properties.map(item => [item.name, item]))
                    selected.properties.forEach(item => {
                        item.value = item.defaultValue
                        if (propertyMapByName.has(item.name)) {
                            item.value = propertyMapByName.get(item.name).value
                        }
                    })
                }
                
                this.selectedPlatform = selected;
            } else {
                this.selectedPlatform = {}
            }
        }
    }
}

</script>