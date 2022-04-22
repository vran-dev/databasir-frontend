<template>
    <el-container>
        <el-header>
            <el-space>
                <el-tooltip content="创建">
                    <el-button type="primary" style="min-width: 100px" @click="toEditPage()">+</el-button>
                </el-tooltip>
                <el-input @change='onQuery' v-model="pageFilter.databaseTypeContains" placeholder="数据库类型名称搜索" prefix-icon="search"/>
            </el-space>
        </el-header>
        <el-main>
            <el-table :data="pageData.data" border stripe>
                <el-table-column prop="id" label="ID" width="50"/>
                <el-table-column prop="databaseType" label="数据库类型" resizable>
                    <template v-slot="scope">
                        {{ scope.row.databaseType }}
                    </template>
                </el-table-column>
                <el-table-column prop="icon" label="图标" >
                    <template v-slot="scope">
                        <img :src="scope.row.icon" style="max-width: 25px; max-height: 25px;"/>
                    </template>
                </el-table-column>
                <el-table-column prop="description" label="描述" resizable/>
                <el-table-column prop="jdbcDriverFileUrl" label="驱动下载地址">
                    <template v-slot="scope">
                        <el-link :underline="false">
                        {{ scope.row.jdbcDriverFileUrl }}
                        </el-link> 
                    </template>
                </el-table-column>
                <el-table-column prop="jdbcDriverClassName" label="驱动类名" resizable/>
                <el-table-column label="协议头">
                    <template v-slot="scope">
                        <el-tag size="large">
                        {{ scope.row.jdbcProtocol }}
                        </el-tag> 
                    </template>
                </el-table-column>
                <el-table-column prop="projectCount" label="引用项目数" width="100"/>
                <el-table-column prop="urlPattern" label="URL 表达式" resizable>
                    <template v-slot="scope">
                        <el-tooltip :content="tableUrlSample(scope.row)">
                            <el-link :underline="false" type="success">
                            {{ scope.row.urlPattern }}
                            </el-link> 
                        </el-tooltip>
                    </template>
                </el-table-column>
                <el-table-column prop="updateAt" label="更新时间" />
                <el-table-column prop="createAt" label="创建时间" />
                <el-table-column  label="操作" resizable fixed="right">
                    <template v-slot="scope">
                        <el-space alignment="left" direction="vertical">
                            <el-button type="primary" size="small" icon="Edit" @click="toEditPage(scope.row)">编辑</el-button>
                            <el-button type="danger" size="small" icon="Delete" @click="onDelete(scope.row)">删除</el-button>
                        </el-space>
                    </template>
                </el-table-column>
            </el-table>

            <el-dialog v-model="isShowEditDialog" width="46%" center destroy-on-close>
                <el-tabs v-model="activeTabName"  @tab-click="handleClick">
                    <el-tab-pane label="链接导入" name="urlImportTab">
                        <el-input v-model="importUrl" @change="onImportByUrl">
                            <template #append>
                                <el-button type="success" :loading="loadingFromUrl" @click="onImportByUrl()" style="color:#409EFF;">导入</el-button>
                            </template>
                        </el-input>
                        <el-row style="margin-top: 12px;">
                            <el-col>
                                <el-link icon="Warning" href="http://doc.databasir.com/#/README/database-type-list/index" style="font-size: 12px;">点击查看模板</el-link>
                            </el-col>
                        </el-row>
                    </el-tab-pane>
                    <el-tab-pane label="JSON 导入" name="jsonImportTab">
                        <el-link icon="Warning" href="http://doc.databasir.com/#/README/database-type-list/index" style="font-size: 12px;margin-bottom:6px;">点击查看模板</el-link>
                        <CodeEditor v-model="importJsonData" :languages="[['json','json']]" style="width: 100%"></CodeEditor>
                        <el-button type="plain" icon="Upload" @click="onImportByJson()" style="margin-top:12px;">导入</el-button>
                    </el-tab-pane>
                    <el-tab-pane label="表单创建" name="formTab">
                        <el-form :model="databaseTypeForm" :rules="formDataRule" ref="formDataRef" label-position="top">
                            <el-row :gutter="28">
                                <el-col :span="10">
                                    <el-form-item label="数据库类型"  prop="databaseType">
                                        <el-input v-model="databaseTypeForm.databaseType" placeholder="请输入数据库类型名称"></el-input>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="10">    
                                    <el-form-item label="图标地址" prop="icon">
                                        <el-input v-model="databaseTypeForm.icon" placeholder="图标地址"></el-input>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                            
                            <el-row>
                                <el-col :span="20">
                                    <el-form-item label="描述" prop="description">
                                        <el-input v-model="databaseTypeForm.description" type="textarea"></el-input>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                            <el-row>
                                <el-col :span="20">
                                    <el-form-item label="JDBC 驱动下载地址"  prop="jdbcDriverFileUrl">
                                        <el-input v-model="databaseTypeForm.jdbcDriverFileUrl" placeholder="jdbc 驱动下载地址，如 https://repo1.maven.org/maven2/mysql/mysql-connector-java/8.0.28/mysql-connector-java-8.0.28.jar"></el-input>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                            
                            <el-row :gutter="28">
                                <el-col :span="10">
                                    <el-form-item  label="驱动类名"  prop="jdbcDriverClassName">
                                        <el-input v-model="databaseTypeForm.jdbcDriverClassName" placeholder="jdbc 驱动类名，如 com.mysql.jdbc.Driver" >
                                            <template #append>
                                                <el-button type="text" :loading="loadingClassName" @click="autoObtainDriverClassName()" style="color:#409EFF; font-size: 12px; padding: 3px;">
                                                    自动获取
                                                </el-button>
                                            </template>
                                        </el-input>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="10">
                                    <el-form-item  label="协议头"  prop="jdbcProtocol">
                                        <el-input v-model="databaseTypeForm.jdbcProtocol" placeholder="协议头，如 jdbc:mysql，jdbc:postgresql，jdbc:mariadb 等"></el-input>
                                    </el-form-item>    
                                </el-col>
                            </el-row>

                            <el-row>
                                <el-col :span="20">
                                    <el-form-item label="URL 生成表达式"  prop="urlPattern">
                                        <el-col>
                                            <el-input v-model="databaseTypeForm.urlPattern" placeholder="支持变量 {{jdbc.protocol}}, {{db.url}}, {{db.name}}">
                                            </el-input>
                                        </el-col>
                                    </el-form-item>
                                </el-col>
                                <el-col>
                                    <el-space>
                                        <span>内置变量：</span>
                                        <el-tooltip  v-for="(item, index) in constData.availableVariables" :key="index" :content="item.description">
                                            <el-tag>{{item.name}}</el-tag>
                                        </el-tooltip>
                                    </el-space>
                                </el-col>
                            </el-row>
                            <el-row style="margin-top: 20px">
                                <el-col>
                                    结果示例：<el-link type="success">{{urlSample}}</el-link>
                                </el-col>
                            </el-row>
                            <el-form-item style="margin-top: 33px">
                                <el-button type="primary" @click="onFormSave('formDataRef')" :loading="loadingSave">保存</el-button>
                                <el-button @click="isShowEditDialog = false">取消</el-button>
                            </el-form-item>
                        </el-form>
                    </el-tab-pane>
                </el-tabs>
            </el-dialog>
        </el-main>
        <el-footer>
            <el-pagination layout="prev, pager, next" 
                :hide-on-single-page="false"
                :currentPage="pageData.number" 
                :page-size="pageData.size" 
                :page-count="pageData.totalPages"
                @current-change="onPageChange">
            </el-pagination>
        </el-footer>
    </el-container>
</template>

<style>
.prism-editor__textarea:focus {
  outline: none;
}
</style>
<script>

import {createDatabaseType, deleteDatabaseType, updateDatabaseType, listPage, resolveDriverClassName} from '@/api/DatabaseType'
import axios from 'axios';
import { ElMessage, ElNotification } from 'element-plus';
import CodeEditor from 'simple-code-editor';

export default{
    components: {
        CodeEditor
    },
    data() {
        return {
            databaseTypes: [],
            pageData: {
                data: [],
                page: 0,
                number: 1,
                size: 15,
                totalElements:0,
                totalPages: 1
            },
            pageFilter: {
                page: 0,
                size: 10,
                databaseTypeContains: null
            },
            databaseTypeForm: {
                id: null,
                databaseType: null,
                icon: null,
                description: null,
                jdbcDriverFileUrl: null,
                jdbcDriverClassName: null,
                jdbcProtocol: null,
                urlPattern: "",
            },
            formDataRule: {
                databaseType: [                    
                    { required: true,message: '请输入数据库类型名称', trigger: 'blur'},
                ],
                description: [                    
                    { required: true,message: '请输入描述内容', trigger: 'blur'},
                ],
                jdbcDriverFileUrl: [                    
                    { required: true,message: '请输入合法的驱动下载地址', trigger: 'blur'},
                ],
                jdbcDriverClassName: [                    
                    { required: true,message: '请输入合法的驱动类名', trigger: 'blur'},
                ],
                jdbcProtocol: [                    
                    { required: true,message: '请输入合法的 JDBC 协议头', trigger: 'blur'},
                ],
                urlPattern: [                    
                    { required: true,message: '请输入合法的 URL 模式', trigger: 'blur'},
                ]
            },
            isShowEditDialog: false,
            constData: {
                urlPattern: '{{jdbc.protocol}}://{{db.url}}/{{db.name}}',
                availableVariables: [
                    {
                        name: '{{jdbc.protocol}}',
                        description: '协议头，如 jdbc:mysql'
                    },
                    {
                        name: '{{db.name}}',
                        description: '数据库名称，如 public'
                    },
                    {
                        name: '{{db.url}}',
                        description: '数据库地址，如 127.0.0.1:3306'
                    },
                    {
                        name: '{{db.schema}}',
                        description: 'schema 名称，如 user'
                    }
                ]
            },
            activeTabName: 'urlImportTab',
            importJsonData: '',
            importUrl: null,
            loadingFromUrl: false,
            loadingClassName: false,
            loadingSave: false,
            cmOptions: {
                mode: "text/javascript", // 语言模式
                theme: "dracula", // 主题
                lineNumbers: false, // 显示行号
                smartIndent: true, // 智能缩进
                indentUnit: 4, // 智能缩进单位为4个空格长度
                foldGutter: false, // 启用行槽中的代码折叠
                styleActiveLine: false, // 显示选中行的样式
            },
        }
    },
    created() {
        this.fetchDatabaseTypes();
        const ele = document.getElementsByClassName('CodeMirror-gutter > CodeMirror-linenumbers')
        if (ele) {
            ele.style = 'width:29px;';
        }
    },
    computed: {
        urlSample() {
            const url = '127.0.0.1:3306'
            const dbName = 'databasir'
            const schemaNmae = 'public'
            const jdbcProtocol = this.databaseTypeForm.jdbcProtocol ? this.databaseTypeForm.jdbcProtocol : 'jdbc:mysql'
            return this.databaseTypeForm.urlPattern
            .replace('{{jdbc.protocol}}', jdbcProtocol)
            .replace('{{db.name}}', dbName)
            .replace('{{db.schema}}', schemaNmae)
            .replace('{{db.url}}', url)
        }
    },
    methods: {
        async fetchDatabaseTypes() {
            const jsonData = await listPage(this.pageFilter)
            this.pageData.data = jsonData.data.content
            this.pageData.number = jsonData.data.number + 1
            this.pageData.size = jsonData.data.size
            this.pageData.totalPages = jsonData.data.totalPages
            this.pageData.totalElements = jsonData.data.totalElements
        },

        onDelete(item) {
            this.$confirm('确认删除该数据库类型吗？这将导致数据同步失败', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                deleteDatabaseType(item.id).then(resp => {
                    if(!resp.errCode) {
                        this.$message.success('删除成功')
                        this.onPageChange(1, true)
                    }
                })
            })
            
        },

        onFormSave() {
            this.$refs.formDataRef.validate(valid => {
                if (valid) {
                    if(this.databaseTypeForm.id) {
                        this.onUpdate(this.databaseTypeForm)
                    } else {
                        this.onCreate(this.databaseTypeForm)
                    }
                } else {
                    this.$message.error('请填写表单必填项')
                }
            })
        },

        onUpdate() {
            this.loadingSave = true
            updateDatabaseType(this.databaseTypeForm).then(resp => {
                if(!resp.errCode) {
                    this.$message.success('更新成功')
                    this.isShowEditDialog = false
                    this.fetchDatabaseTypes()
                }
            }).finally(() => this.loadingSave = false)
        },

        onCreate() {
            this.loadingSave = true
            createDatabaseType(this.databaseTypeForm).then(resp => {
                if(!resp.errCode) {
                    this.$message.success('创建成功')
                    this.isShowEditDialog = false
                    this.onPageChange(1, true)
                }
            }).finally(() => this.loadingSave = false)
        },

        onQuery(){
            this.fetchDatabaseTypes()
        },

        onPageChange(currentPage, force) {
             if (currentPage && (currentPage -1) != this.pageFilter.page) {
                this.pageFilter.page = currentPage - 1
                this.fetchDatabaseTypes()
            } else if(force) {
                this.pageFilter.page = currentPage - 1
                this.fetchDatabaseTypes()
            }
        },

        toEditPage(data) {
            if (data && data.id) {
                this.activeTabName = 'formTab'
                this.databaseTypeForm = JSON.parse(JSON.stringify(data));
            } else {
                this.activeTabName = 'urlImportTab'
                this.databaseTypeForm = {}
                this.databaseTypeForm.urlPattern = this.constData.urlPattern
            }
            this.isShowEditDialog = true
        },

        tableUrlSample(row) {
            const url = '127.0.0.1:3306'
            const dbName = 'databasir'
            return row.urlPattern
            .replace('{{jdbc.protocol}}', row.jdbcProtocol)
            .replace('{{db.name}}', dbName)
            .replace('{{db.url}}', url)
        },

        autoObtainDriverClassName() {
            if (!this.databaseTypeForm.jdbcDriverFileUrl) {
                this.$message.warning("请求填写 JDBC 驱动下载地址")
                return;
            }

            this.loadingClassName = true
            const request = {
                jdbcDriverFileUrl: this.databaseTypeForm.jdbcDriverFileUrl 
            }
            resolveDriverClassName(request)
            .then(resp => {
                if (!resp.errCode) {
                    this.databaseTypeForm.jdbcDriverClassName = resp.data
                    this.$message.success("获取成功")
                }
            })
            .finally(() => {
                this.loadingClassName = false
            })
        },

        onImportByUrl() {
            if (!this.importUrl) {
                this.$message.error('请填写合法的 URL')
                return;
            }
            this.loadingFromUrl = true
            axios.get(this.importUrl).then(resp => {
                this.importJsonData = JSON.stringify(resp)
            }).finally(() => this.loadingFromUrl = false)
        },

        onImportByJson() {
            if (!this.importJsonData) {
                ElMessage({
                    message: 'JSON 不能为空',
                    type: 'error',
                    grouping: true
                })
                return;
            }
            try {
                const obj = JSON.parse(this.importJsonData);
                if (!obj.template) {
                    ElMessage({
                        message: 'JSON 不合法，缺少 template 参数',
                        type: 'error',
                        grouping: true
                    })
                    return;
                }

                if(!obj.template.urlPattern) {
                     ElMessage({
                        message: 'JSON 不合法，缺少 urlPattern 参数',
                        type: 'error',
                        grouping: true
                    })
                    return;
                }
                this.databaseTypeForm = obj.template
                this.activeTabName = 'formTab'
                ElNotification({
                    message: '模板导入成功',
                    type: 'success'
                })
            } catch(err) {
                console.log(err)
                ElMessage({
                    message: 'JSON 格式有误，请重新检查',
                    type: 'error',
                    grouping: true
                })
            }
            
        },
    }
}
</script>
