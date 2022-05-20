<template>
    <el-container>
        <el-header>
            <el-row :gutter="18">
                <el-col :xs="24" :sm="12" :md="6" :lg="4" :xl="4" style="margin-bottom:12px;">
                    <el-tooltip content="创建">
                        <el-button type="plain" style="width:100%;" @click="toEditPage()">+</el-button>
                    </el-tooltip>
                </el-col>
                <el-col :xs="24" :sm="12" :md="10" :lg="6" :xl="6">
                    <el-input @change='onQuery' v-model="pageFilter.databaseTypeContains" placeholder="数据库类型名称搜索" prefix-icon="search"/>
                </el-col>
            </el-row>
        </el-header>
        <el-main>
            <el-row :gutter="12">
                <el-col :xs="24" :sm="12" :md="12" :lg="7" :xl="5" v-for="item in pageData.data" :key="item.id" style="margin-bottom:18px;cursor:pointer;">
                    <el-card shadow="hover" 
                    style="border-style:none;margin:0 auto;text-align:center;" 
                    @click="toEditPage(item)"
                    >
                        <el-space direction="vertical">
                            <div>
                                <img v-if="item.icon && item.icon.trim != ''" :src="item.icon" style="max-width: 65px; height: 65px;"/>
                                <img v-else :src="require('@/assets/database/default.svg')" style="max-width: 65px; height: 65px;">
                            </div>
                            <div>
                                <el-popover
                                :width="300"
                                popper-style="box-shadow: rgb(14 18 22 / 35%) 0px 10px 38px -10px, rgb(14 18 22 / 20%) 0px 10px 20px -15px; padding: 20px;"
                                >
                                <template #reference>
                                    <span>{{item.databaseType }}</span>
                                </template>
                                <template #default>
                                    <div
                                    style="display: flex; gap: 16px; flex-direction: column"
                                    >
                                        <div>
                                            <p
                                            class="demo-rich-content__name"
                                            style="margin: 0; font-weight: 500"
                                            >
                                            {{item.description}}
                                            </p>
                                            <p
                                            class="demo-rich-content__mention"
                                            style="margin: 0; font-size: 14px; color: var(--el-color-info)"
                                            >
                                            存在 {{ item.projectCount }} 个项目引用
                                            </p>
                                        </div>
                                    </div>
                                </template>
                                </el-popover>
                                

                            </div>
                        </el-space>
                    </el-card>
                </el-col>
            </el-row>
            <el-dialog v-model="isShowEditDialog" width="46%" center destroy-on-close>
                <el-tabs v-model="activeTabName"  @tab-click="handleClick">
                    <el-tab-pane label="内置模板" name="urlImportTab">
                        <el-row>
                            <el-col>
                                <el-select placeholder="选择数据库" @change="onImportBySelect" v-model="selectDatabaseTypeTemplate" style="width:90%;">
                                    <el-option
                                        v-for="(item,index) in innerDatabaseTypes"
                                        :key="index"
                                        :value="item.template.databaseType"
                                        :label="item.template.databaseType"
                                        >
                                        <el-tooltip :content="item.template.description" placement="left-start">
                                            <img :src="item.template.icon" style="max-width: 25px; max-height: 25px;"/>
                                        </el-tooltip>
                                        <span
                                            style="
                                            float: right;
                                            color: var(--el-text-color-secondary);
                                            font-size: 13px;
                                            ">
                                            <span style="float: left">{{ item.template.databaseType }}</span>
                                        </span>
                                    </el-option>
                                </el-select>
                            </el-col>
                        </el-row>
                        
                        <el-row style="margin-top: 12px;">
                            <el-col>
                                <el-link icon="Warning" href="https://doc.databasir.com/#/README/database-type-list/index" style="font-size: 12px;">点击查看更多</el-link>
                            </el-col>
                        </el-row>
                    </el-tab-pane>
                    <el-tab-pane label="JSON 导入" name="jsonImportTab">
                        <el-link icon="Warning" href="https://doc.databasir.com/#/README/database-type-list/index" style="font-size: 12px;margin-bottom:6px;">点击查看更多</el-link>
                        <CodeEditor v-model="importJsonData" :languages="[['json','json']]" style="width: 100%"></CodeEditor>
                        <el-button type="plain" icon="Upload" @click="onImportByJson()" style="margin-top:12px;">导入</el-button>
                    </el-tab-pane>
                    <el-tab-pane label="表单创建" name="formTab">
                        <el-form :model="databaseTypeForm" :rules="formDataRule" ref="formDataRef" label-position="top">
                            <h3>基础信息</h3>
                            <el-row :gutter="28">
                                <el-col :span="10">
                                    <el-form-item label="数据库类型"  prop="databaseType">
                                        <el-input v-model="databaseTypeForm.databaseType" placeholder="请输入数据库类型名称"></el-input>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="10">    
                                    <el-form-item label="图标地址" prop="icon">
                                        <el-input v-model="databaseTypeForm.icon"></el-input>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="20">
                                    <el-form-item label="描述" prop="description">
                                        <el-input v-model="databaseTypeForm.description" type="textarea"></el-input>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                            
                            <h3>驱动配置</h3>
                            <el-row>
                                <el-col :span="4">
                                    <el-form-item label="驱动获取方式" required prop="isLocalUpload">
                                        <el-select v-model="databaseTypeForm.isLocalUpload" placeholder="请选择" size="small">
                                            <el-option
                                                v-for="item in loadDriverOptions"
                                                :key="item.isLocalUpload"
                                                :label="item.name"
                                                :value="item.isLocalUpload"
                                                :on-remove="onUploadFileRemoved"
                                            />
                                        </el-select>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                            <el-row>
                                <el-col :span="20" v-if="!databaseTypeForm.isLocalUpload">
                                    <el-form-item label="JDBC 驱动下载地址"  prop="jdbcDriverFileUrl">
                                        <el-input v-model="databaseTypeForm.jdbcDriverFileUrl" placeholder="您可以从 maven 仓库获取 Jar 下载地址">
                                            <template #prefix>
                                                <el-tooltip content="如 https://repo1.maven.org/maven2/mysql/mysql-connector-java/8.0.28/mysql-connector-java-8.0.28.jar" effect="light">
                                                    <el-icon class="el-input__icon"><Link /></el-icon>
                                                </el-tooltip>
                                            </template>
                                            <template #suffix v-if="databaseTypeForm.jdbcDriverFilePath && databaseTypeForm.jdbcDriverFileUrl != ''">
                                                <el-button text icon="SuccessFilled" style="color:#67C23A;"></el-button>
                                            </template>
                                        </el-input>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="20" v-if="databaseTypeForm.isLocalUpload">
                                    <span v-if="uploadedFileList.length != 0">{{ uploadedFileList[0].name}}</span>
                                    <el-upload
                                        drag
                                        :class="{hideUpload: uploadedFileList.length != 0}"
                                        action="#"
                                        :http-request="manualUploadDriver"
                                        :file-list="uploadedFileList"
                                        list-type="picture"
                                        accept=".jar"
                                        limit="1"
                                        style="margin-top:10px;margin-bottom:20px;">
                                        <div>
                                            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                                            <div class="el-upload__text">
                                                拖动文件到此处或点击上传
                                            </div>
                                        </div>
                                    </el-upload>
                                </el-col>
                            </el-row>

                            <el-row :gutter="28">
                                <el-col :span="12">
                                    <el-form-item  label="驱动类名"  prop="jdbcDriverClassName">
                                        <el-input v-model="databaseTypeForm.jdbcDriverClassName">
                                            <template #prefix>
                                                <el-tooltip content="如 com.mysql.jdbc.Driver" effect="light">
                                                    <el-icon class="el-input__icon"><InfoFilled /></el-icon>
                                                </el-tooltip>
                                            </template>
                                            <template #append>
                                                <el-button :loading="loadingClassName" @click="autoObtainDriverClassName()" style="color:#409EFF; font-size: 12px; padding: 3px;">
                                                    自动获取
                                                </el-button>
                                            </template>
                                        </el-input>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="8">
                                    <el-form-item  label="协议头"  prop="jdbcProtocol">
                                        <el-input v-model="databaseTypeForm.jdbcProtocol">
                                            <template #prefix>
                                                <el-tooltip content="如 jdbc:mysql，jdbc:postgresql，jdbc:mariadb 等" effect="light">
                                                    <el-icon class="el-input__icon"><InfoFilled /></el-icon>
                                                </el-tooltip>
                                            </template>
                                        </el-input>
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
                        <el-collapse v-if="databaseTypeForm.id">
                            <el-collapse-item title="删除">
                                <template #title>
                                    <el-icon><info-filled /></el-icon>删除
                                </template>
                                <el-button type="plain" style="width:100%;" icon="Delete" @click="onDelete(databaseTypeForm)">删除</el-button>
                            </el-collapse-item>
                        </el-collapse>
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

.hideUpload .el-upload--picture{
  display:none !important;   /* 上传按钮隐藏 */
}

</style>
<script>

import {createDatabaseType, deleteDatabaseType, updateDatabaseType, listPage, resolveDriverClassName, uploadDriver} from '@/api/DatabaseType'
import { ElMessage, ElNotification } from 'element-plus';
import CodeEditor from 'simple-code-editor';
import {innerDatabaseTypes} from '@/api/Const'
import { token } from '../utils/auth';

export default{
    components: {
        CodeEditor
    },
    data() {
        return {
            innerDatabaseTypes: innerDatabaseTypes,
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
                jdbcDriverFilePath: null,
                jdbcDriverClassName: null,
                jdbcProtocol: null,
                isLocalUpload: false,
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
            selectDatabaseTypeTemplate: null,
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
            loadDriverOptions: [{name:'链接下载', isLocalUpload: false}, {name:'本地导入', isLocalUpload: true}],
            uploadedFileList: []
        }
    },
    created() {
        this.fetchDatabaseTypes();
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
            let msg = "确认删除该数据库类型吗？"
            if (item.projectCount && item.projectCount > 0) {
                msg += "该类型关联了 "+item.projectCount+" 个项目"
            }
            this.$confirm(msg, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                deleteDatabaseType(item.id).then(resp => {
                    if(!resp.errCode) {
                        this.$message.success('删除成功')
                        this.onPageChange(1, true)
                    }
                    this.isShowEditDialog = false
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
            if(this.databaseTypeForm.isLocalUpload) {
                this.databaseTypeForm.jdbcDriverFileUrl = null
            } else {
                this.databaseTypeForm.jdbcDriverFilePath = null;
            }
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
            if(this.databaseTypeForm.isLocalUpload) {
                this.databaseTypeForm.jdbcDriverFileUrl = null
            } else {
                this.databaseTypeForm.jdbcDriverFilePath = null;
            }
            createDatabaseType(this.databaseTypeForm).then(resp => {
                if(!resp.errCode) {
                    this.$message.success('创建成功')
                    this.isShowEditDialog = false
                    this.onPageChange(1, true)
                }
            }).finally(() => this.loadingSave = false)
        },
        requestHeader() {
            return {
                Authorization:'Bearer ' + token.loadAccessToken()
            }
        },
        onQuery(){
            this.fetchDatabaseTypes()
        },
        onUploadFileRemoved(){
            this.databaseTypeForm.jdbcDriverFilePath = null;
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
        manualUploadDriver(params) {
            let fd = new FormData();
            fd.append('file', params.file);
            return uploadDriver(fd)
                .then(resp => {
                    if (!resp.errCode) {
                        this.databaseTypeForm.isLocalUpload = true;
                        this.databaseTypeForm.jdbcDriverFilePath = resp.data;
                        this.$message.success('上传成功')
                        this.uploadedFileList = [{ name: resp.data, url: require('@/assets/common/jar.svg')}]
                    }
                })
                .catch(() => {
                    this.$message.error('上传失败，请重新上传')
                })
        },

        toEditPage(data) {
            if (data && data.id) {
                this.activeTabName = 'formTab'
                this.databaseTypeForm = JSON.parse(JSON.stringify(data));
                this.databaseTypeForm.isLocalUpload = this.databaseTypeForm.jdbcDriverFileUrl == "";
                if (this.databaseTypeForm.jdbcDriverFileUrl == "") {
                    this.uploadedFileList = [{ name: this.databaseTypeForm.jdbcDriverFilePath, url: require('@/assets/common/jar.svg')}]
                } else {
                    this.uploadedFileList = []
                }
            } else {
                this.activeTabName = 'urlImportTab'
                this.databaseTypeForm = {}
                this.databaseTypeForm.urlPattern = this.constData.urlPattern
                this.databaseTypeForm.isLocalUpload = false
                this.uploadedFileList = []
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
            if (!this.databaseTypeForm.jdbcDriverFileUrl && !this.databaseTypeForm.jdbcDriverFilePath) {
                this.$message.warning("请填写驱动下载地址或上传驱动文件")
                return;
            }

            this.loadingClassName = true
            const request = {
                jdbcDriverFileUrl: this.databaseTypeForm.isLocalUpload ? null : this.databaseTypeForm.jdbcDriverFileUrl,
                jdbcDriverFilePath: this.databaseTypeForm.isLocalUpload ? this.databaseTypeForm.jdbcDriverFilePath : null,
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

        onImportBySelect(val) {
            if (!val) {
                this.$message.error('请选择模板')
                return;
            }
            const item = this.innerDatabaseTypes.find(item => item.template.databaseType == val)
            if (!item) {
                this.$message.error('请选择正确的模板')
                return
            }
            this.importJsonData = JSON.stringify(item)
            this.onImportByJson()
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
                if(obj.template.isLocalUpload != true) {
                    obj.template.isLocalUpload = false;
                }
                const id = this.databaseTypeForm.id
                this.databaseTypeForm = obj.template
                this.databaseTypeForm.id = id
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
