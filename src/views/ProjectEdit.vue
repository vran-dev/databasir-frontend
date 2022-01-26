<template>  
    <el-continer>
        <el-main>
            <el-form :model="form" label-position="top" :rules="formRules" ref="ruleFormRef">
                <el-tabs type="border-card">
                    <el-tab-pane label="基础配置">
                        <!-- basic -->
                        <h2>基础信息</h2>
                        <el-form-item label="名称" prop="name">
                            <el-input v-model="form.name" placeholder="项目名称"></el-input>
                        </el-form-item>

                        <el-form-item label="描述" prop="description">
                            <el-input v-model="form.description" type="textarea" placeholder="项目描述"></el-input>
                        </el-form-item>

                        <!-- connection -->
                        <h2>连接配置</h2>
                        <el-form-item label="用户名" prop="dataSource.username">
                            <el-input v-model="form.dataSource.username" placeholder="root"></el-input>
                        </el-form-item>
                        <el-form-item label="密码"  prop="dataSource.password">
                            <el-input v-model="form.dataSource.password" placeholder="**********"  :type="password" show-password></el-input>
                        </el-form-item>
                        <el-form-item label="地址" prop="dataSource.url">
                            <el-input v-model="form.dataSource.url" placeholder="127.0.0.1:3306"></el-input>
                        </el-form-item>
                        <el-row>
                            <el-col :span="8">
                                <el-form-item label="数据库" prop="dataSource.databaseName">
                                    <el-input v-model="form.dataSource.databaseName" placeholder="需要同步的数据库名称"></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="8" :offset="1">
                                <el-form-item label="数据库类型" prop="dataSource.databaseType">
                                    <el-select v-model="form.dataSource.databaseType" placeholder="选择数据库类型" clearable>
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
                       
                        <el-form-item :label="index > 0 ? '':'属性'" v-for="(item, index) in form.dataSource.properties" :key="index">
                            <el-col :span="8">
                                <el-input v-model.trim="item.key" placeholder="Key"></el-input>
                            </el-col>
                            <el-col  :offset="1" :span="8">
                                <el-input v-model.trim="item.value" placeholder="Value" />
                            </el-col>
                            <el-col :offset="1" :span="6">
                                <el-button type="danger" size="small" @click="removeDataSourceProperty(index)">- 删除</el-button>
                                <el-button type="primary" size="small" @click="addDataSourceProperty" v-if="(index+1) == form.dataSource.properties.length">+ 添加</el-button>
                            </el-col>
                        </el-form-item>
                        <el-form-item label="属性" v-if="form.dataSource.properties.length == 0">
                            <el-button type="text" size="small" @click="addDataSourceProperty" >+ 添加</el-button>
                        </el-form-item>

                        <el-form-item>
                            <el-col>
                                <el-button v-if="testConnectionState.isTest" plain circle :type="testConnectionState.buttonType" size="small">
                                    <el-icon v-if="testConnectionState.success"><check /></el-icon>
                                    <el-icon v-else><close /></el-icon>
                                </el-button>
                                <el-button :type="testConnectionState.buttonType" plain size="small" @click="onTestConnection" :loading="loading.testConnection">
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
                                <el-switch v-model="form.projectSyncRule.isAutoSync"></el-switch>
                                <el-input 
                                    v-model="form.projectSyncRule.autoSyncCron" 
                                    v-if="form.projectSyncRule.isAutoSync" 
                                    placeholder="CRON 表达式" 
                                    >
                                </el-input>    
                            </el-space>
                        </el-form-item>

                        <!-- ignore table name regex -->
                        <el-form-item :label="index > 0 ? '': '忽略表名称（支持正则表达式）'" v-for="(item, index) in form.projectSyncRule.ignoreTableNameRegexes" :key="index">
                            <el-col :span="6">
                                <el-input v-model="form.projectSyncRule.ignoreTableNameRegexes[index]" placeholder="name regex"></el-input>
                            </el-col>
                            <el-col :span="6" :offset="1">
                                <el-button type="danger" size="small" @click="removeIgnoreTableName(index)">- 删除</el-button>
                                <el-button type="primary" size="small" @click="addIgnoreTableName" v-if="(index+1) == form.projectSyncRule.ignoreTableNameRegexes.length">+ 添加</el-button>
                            </el-col>
                        </el-form-item>
                        <el-form-item label="忽略表名称（支持正则表达式）" v-if="form.projectSyncRule.ignoreTableNameRegexes.length == 0">
                            <el-button type="text" size="small" @click="addIgnoreTableName" >+ 添加</el-button>
                        </el-form-item>

                        <!-- ignore column name regex -->
                        <el-form-item :label="index > 0 ? '' : '忽略列名称（支持正则表达式）'" v-for="(item, index) in form.projectSyncRule.ignoreColumnNameRegexes" :key="index">
                            <el-col :span="6">
                                <el-input v-model="form.projectSyncRule.ignoreColumnNameRegexes[index]" placeholder="name regex"></el-input>
                            </el-col>
                            <el-col :span="6"  :offset="1">
                                <el-button type="danger" size="small" @click="removeIgnoreColumnName(index)">- 删除</el-button>
                                <el-button type="primary" size="small" @click="addIgnoreColumnName" v-if="(index+1) == form.projectSyncRule.ignoreColumnNameRegexes.length">+ 添加</el-button>
                            </el-col>
                        </el-form-item>
                        <el-form-item label="忽略列名称（支持正则表达式）" v-if="form.projectSyncRule.ignoreColumnNameRegexes.length == 0">
                            <el-button type="text" size="small" @click="addIgnoreColumnName" >+ 添加</el-button>
                        </el-form-item>
                    </el-tab-pane>
                </el-tabs>
                <el-form-item>
                    <el-divider content-position="center"></el-divider>
                    <el-button type="primary" @click="onSubmit">保存</el-button>
                    <el-button @click="onCancel">取消</el-button>
                </el-form-item>
            </el-form>
        </el-main>
    </el-continer>
</template>

<script>
import { reactive, onMounted, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElForm } from 'element-plus'
import { getProjectById, createOrUpdateProject, testConnection } from '@/api/Project'
import { databaseTypes } from '../api/Const'


export default {
    components: {},
    setup() {
        const router = useRouter()
        const route = useRoute()
        const form = reactive({
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
        })
        const loading = reactive({
            testConnection: false
        })
        const testConnectionState = reactive({
            buttonType: 'primary',
            isTest: false,
            success: false,
            message: null,
        })
        watch(
            () => form.dataSource,
            () => {
                testConnectionState.isTest = false
                testConnectionState.buttonType = 'primary'
            },
            { deep: true }
        )
        onMounted(async () => {
            router.isReady().then(async () => {
                if (route.params.projectId){
                    form.id = route.params.projectId
                    getProjectById(route.params.projectId).then(resp => {
                        const res = resp.data
                        form.name = res.name
                        form.groupId = res.groupId
                        form.description = res.description
                        form.dataSource = res.dataSource
                        form.projectSyncRule = res.projectSyncRule
                    })
                } else {
                     form.groupId = route.params.groupId
                }
            })
        });
        const requiredInputValidRule = (message) => {
            return {
                required: true,
                message: message,
                trigger: 'blur',
            }
        }
        const formRules = reactive({
            name: [
                requiredInputValidRule('名称不能为空'),
            ],
            description: [
                requiredInputValidRule('说明不能为空'),
            ],
            dataSource: {
                username: [requiredInputValidRule('数据库用户名不能为空')],
                url: [requiredInputValidRule('数据库连接地址不能为空')],
                databaseName: [requiredInputValidRule('数据库名称不能为空')],
                databaseType: [
                    {
                        required: true,
                        message: '请选择数据库类型',
                        trigger: 'change',
                    }
                ],
            }
        })
        const ruleFormRef = ref(ElForm)
        const onSubmit = () => {
            ruleFormRef.value.validate((valid) => {
                if(!valid) {
                    message('请填写表单必填项', 'error')
                    return false
                } 

                if (!form.id && !form.dataSource.password) {
                    message('请填写数据库连接密码', 'error')
                    return false
                }

                createOrUpdateProject(form).then(resp => {
                    if (!resp.errCode) {
                        message('保存成功', 'success', () => router.push({path: '/groups/'+route.params.groupId}))
                        router.push({path: '/groups/'+route.params.groupId})
                    }
                    return true;
                })
            })
            
        }

        const message = (msg, type, callback) => {
            ElMessage({
                showClose: true,
                message: msg,
                type: type,
                duration: 1.8 * 1000,
                onClose: callback
            })
        }

        const onCancel = () => {
            router.push({path: '/groups/'+route.params.groupId})
        }

        const addDataSourceProperty = () => {
            form.dataSource.properties.push({key:"", value:""})
        }

        const removeDataSourceProperty = (index) => {
            form.dataSource.properties.splice(index, 1)
        }

        const addIgnoreTableName = () => {
            form.projectSyncRule.ignoreTableNameRegexes.push("")
        }

        const removeIgnoreTableName = (index) => {
            form.projectSyncRule.ignoreTableNameRegexes.splice(index, 1)
        }

        const addIgnoreColumnName = () => {
            form.projectSyncRule.ignoreColumnNameRegexes.push("")
        }

        const removeIgnoreColumnName = (index) => {
            form.projectSyncRule.ignoreColumnNameRegexes.splice(index, 1)
        }

        const onTestConnection = () => {
            loading.testConnection = true
            ruleFormRef.value.validate((valid) => {
                if(!valid) {
                    message('请填写表单必填项', 'error')
                    return false
                } 

                if (!form.id && !form.dataSource.password) {
                    message('请填写数据库连接密码', 'error')
                    return false
                }
                const request = {
                    projectId: form.id,
                    databaseType: form.dataSource.databaseType,
                    databaseName: form.dataSource.databaseName,
                    username: form.dataSource.username,
                    password: form.dataSource.password,
                    url: form.dataSource.url,
                    properties: form.dataSource.properties
                }
                testConnection(request).then(resp => {
                    if (!resp.errCode) {
                        testConnectionState.success = true
                        testConnectionState.buttonType = 'success'
                        message('连接成功', 'success')
                    } else {
                        testConnectionState.success = false
                        testConnectionState.buttonType = 'danger'
                    }
                    testConnectionState.isTest = true
                    testConnectionState.message = resp.errMessage
                }).finally(() => loading.testConnection = false)
            })
            
        }

        return {
            form,
            loading,
            testConnectionState,
            formRules,
            databaseTypes,
            ruleFormRef,
            onSubmit,
            onCancel,
            addDataSourceProperty,
            removeDataSourceProperty,
            addIgnoreTableName,
            removeIgnoreTableName,
            addIgnoreColumnName,
            removeIgnoreColumnName,
            onTestConnection
        }
    }
}


</script>