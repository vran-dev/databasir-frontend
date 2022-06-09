<template>
    <el-container class="databasir">
        <el-aside>
            <AppNav class="databasir-nav" @on-search="search()"></AppNav>
        </el-aside>
        <el-header class="databasir-main-header">
            <Breadcrumb></Breadcrumb>
            <Avatar></Avatar>
        </el-header>
        <el-main class="databasir-main">
            <el-container>
                <el-main class="databasir-main-content">
                    <router-view></router-view>
                </el-main>
            </el-container>
        </el-main>
        <el-dialog
            v-model="showSearchDialog"
            title="搜索"
            :width="dialogWidth()"
        >
            <el-input
                v-model="queryKeyword"
                placeholder="支持分组、项目、数据库、表、列、描述"
                style="width:100%;border:none;"
                :autofocus="true"
                @change="onQuery"
                ref="queryInputRef"
            >
                <template #prepend>
                    <el-button :loading="queryLoading" icon="Search"></el-button>
                </template>
            </el-input>
            <div style="margin-top:16px;">
                <el-link :underline="false" v-for="(item, index) in searchSelectHistory" :key="index" @click="jumpToPath(item.path)" style="margin-right: 12px;margin-bottom:12px;">
                    <el-tag closable :type="historyItemTypeToTagType(item.type)" @close="onRemoveSelectHistoryItem(item.label)">
                        {{item.label}}
                    </el-tag>
                </el-link>
            </div>
            <div v-if="!hasMatchData && showEmpty && !queryLoading">
                <el-empty :image-size="60" />
            </div>
            <div v-if="queryLoading">
                <el-skeleton :rows="5" :animated="queryLoading" :throttle="500"/>
            </div>
            <div class="search-container" v-if="hasMatchData && !queryLoading">
                <el-tabs v-model="activeSearchTabName">
                    <!-- projects -->
                    <el-tab-pane label="项目" name="projects" v-if="queryData.projectPageData.numberOfElements > 0">
                        <template #label>
                            <el-badge :value="queryData.projectPageData.totalElements" :max="50" class="badge">
                                <el-button type="plain" text>项目</el-button>
                            </el-badge>
                        </template>
                        <div v-for="(item,index) in queryData.projectPageData.content" :key="index" @click="jumpToProject(item)" class="search-item" >
                            <div class="header" @click="jumpToProject(item)">
                                <span >
                                    <el-tag type="success" style="margin-right: 8px;">项目</el-tag>
                                    <el-link>
                                        {{item.groupName}} / {{item.projectName}}
                                    </el-link>
                                </span>
                                <span class="jump">
                                    <el-icon><Right /></el-icon>
                                </span>
                            </div>
                            <div class="content" style="color:#909399">
                                <p>
                                    <el-tooltip content="数据库类型" v-if="item.databaseProductName">
                                        <el-tag size="small" type="info" effect="plain" class="item">
                                            {{ item.databaseProductName }}
                                        </el-tag>
                                    </el-tooltip>
                                    <el-tooltip content="database" v-if="item.databaseName">
                                        <el-tag size="small" type="info" effect="plain" class="item">
                                            {{ item.databaseName }}
                                        </el-tag>
                                    </el-tooltip>
                                    <el-tooltip content="schema" v-if="item.schemaName">
                                        <el-tag size="small" type="info" effect="plain" class="item">
                                            {{ item.schemaName }}
                                        </el-tag>
                                    </el-tooltip>
                                </p>
                                <p v-if="item.projectDescription && item.projectDescription != ''" >
                                    <span>
                                        {{ item.projectDescription }}
                                    </span> 
                                </p>
                            </div>
                        </div>
                    </el-tab-pane>

                    <!-- tables -->
                    <el-tab-pane label="表" name="tables" v-if="queryData.tablePageData.numberOfElements > 0">
                        <template #label>
                            <el-badge :value="queryData.tablePageData.totalElements" :max="50" class="badge">
                                <el-button type="plain" text>表</el-button>
                            </el-badge>
                        </template>
                        <div v-for="(item,index) in queryData.tablePageData.content" :key="index" @click="jumpToProject(item)" class="search-item">
                            <div class="header">
                                <span>
                                    <el-tag type="primary" style="margin-right: 8px;"> 表</el-tag>
                                    <el-link>
                                        {{ item.groupName }} / {{ item.projectName }} / {{ item.tableName }}
                                    </el-link>
                                </span>
                                <span class="jump">
                                    <el-icon><Right /></el-icon>
                                </span>
                            </div>
                            <div class="content">
                                <p>
                                    <el-tooltip content="数据库发行商" v-if="item.databaseProductName">
                                        <el-tag size="small" type="info" effect="plain" class="item">
                                            {{ item.databaseProductName }}
                                        </el-tag>
                                    </el-tooltip>
                                    <el-tooltip content="database" v-if="item.databaseName">
                                        <el-tag size="small" type="info" effect="plain" class="item">
                                            {{ item.databaseName }}
                                        </el-tag>
                                    </el-tooltip>
                                    <el-tooltip content="schema" v-if="item.schemaName">
                                        <el-tag size="small" type="info" effect="plain" class="item">
                                            {{ item.schemaName }}
                                        </el-tag>
                                    </el-tooltip>
                                </p>
                                <p v-if="item.tableComment"  style="color:#909399">
                                    <pre>{{ item.tableComment }}</pre> 
                                </p>
                                <p v-if="item.tableDescription" style="color:#909399">
                                    <span class="second-title">描述</span> 
                                    <pre>{{ item.tableDescription }}</pre>
                                </p>
                            </div>
                        </div>
                    </el-tab-pane>

                    <!-- columns -->
                    <el-tab-pane label="列" name="columns" v-if="queryData.columnPageData.numberOfElements > 0">
                        <template #label>
                            <el-badge :value="queryData.columnPageData.totalElements" :max="50" class="badge">
                                <el-button type="plain" text>列</el-button>
                            </el-badge>
                        </template>
                        <div v-for="(item,index) in queryData.columnPageData.content" :key="index" @click="jumpToProject(item)" class="search-item">
                            <div class="header">
                                <span>
                                    <el-tag type="warning" style="margin-right: 8px;">列</el-tag>
                                    <el-link>
                                        {{ item.groupName }} / {{ item.projectName }} / {{ item.tableName }} / {{ item.colName}}
                                    </el-link>
                                </span>
                                <span class="jump">
                                    <el-icon><Right /></el-icon>
                                </span>
                            </div>
                            <div class="content">
                                <p>
                                    <el-tooltip content="数据库类型" v-if="item.databaseProductName">
                                        <el-tag size="small" type="info" effect="plain" class="item">
                                            {{ item.databaseProductName }}
                                        </el-tag>
                                    </el-tooltip>
                                    <el-tooltip content="database" v-if="item.databaseName">
                                        <el-tag size="small" type="info" effect="plain" class="item">
                                            {{ item.databaseName }}
                                        </el-tag>
                                    </el-tooltip>
                                    <el-tooltip content="schema" v-if="item.schemaName">
                                        <el-tag size="small" type="info" effect="plain" class="item">
                                            {{ item.schemaName }}
                                        </el-tag>
                                    </el-tooltip>
                                </p>
                                <p v-if="item.colComment" style="color:#909399">
                                    <pre>{{ item.colComment }}</pre> 
                                </p>
                                <p v-if="item.colDescription" style="color:#909399">
                                    <span class="second-title">描述</span> 
                                    <pre>{{ item.colDescription }}</pre> 
                                </p>
                            </div>
                        </div>
                    </el-tab-pane>

                    <!-- groups -->
                    <el-tab-pane label="组" name="groups" v-if="queryData.groupPageData.numberOfElements > 0">
                        <template #label>
                            <el-badge :value="queryData.groupPageData.totalElements" :max="99" class="badge">
                                <el-button type="plain" text>组</el-button>
                            </el-badge>
                        </template>
                        <div v-for="(item,index) in queryData.groupPageData.content" :key="index" @click="jumpToGroup(item)" class="search-item">
                            <div class="header">
                                <span>
                                    <el-tag type="info" style="margin-right: 8px;">组</el-tag>
                                    <el-link>
                                        {{ item.groupName }}
                                    </el-link>
                                </span>
                                <span class="jump">
                                    <el-icon><Right /></el-icon>
                                </span>
                            </div>
                            <div class="content" v-if="item.groupDescription && item.groupDescription != ''">
                                <p style="color:#909399">
                                    <pre>{{ item.groupDescription }}</pre>
                                </p>
                            </div>
                        </div>
                    </el-tab-pane>
                </el-tabs>
                
            </div>
        </el-dialog>
    </el-container>
</template>

<style>
.search-item {
    padding: 10px;
    width: 95%;
    margin-bottom: 12px;
    margin-right: 12px;
    border-radius: 8px;
    border-width: 0 0 1px 0;
    border-color: #DDD;
    border-style: solid;
}

.search-item:hover {
    background-color: #F0F2F5;
    border-color: transparent;
}
.search-item .jump {
    margin-right: 8px;
}

.search-item .header {
    display: flex;
    justify-content: space-between;
}

.search-item .content {
    padding: 10px;
}

.search-item .content .item{
    margin-right: 8px;
}

.search-container {
    max-height: 420px;
    margin-top: 12px;
    overflow-y: auto;
    overflow-x: hidden;
}

.badge{
    margin-top:12px;
    margin-right: 20px;
}

.search-container .el-tabs__item {
    line-height: unset;
}

.second-title {
    color:#909399;
    font-size: 14px;
}

.databasir-nav {
    position: fixed;
    transform: scale(1, 1);
    left: 0;
    bottom: 0;
    top: 0;
}

.databasir-main-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: fixed;
    transform: scale(1, 1);
    top: 0px;
    right: 0px;
    left: 50px;
    padding: 30px;
    margin-left: 33px;
    background: #FFF;
    z-index: 100;
    border-color: #EEE;
    border-width: 0px 0px 1px 0px;
    border-style: solid;
}

.databasir {
    display: block;
}

.databasir-main {
    position: relative;
    margin-left: 60px;
    margin-top: 80px;
    --el-main-padding: 0px 20px 20px 20px;
}

.databasir-main-expand {
    margin-left: 50px;
}

.databasir-main-content {
    max-width: 95%;
    --el-main-padding: 0px 20px 20px 20px;
}

.h2 {
    font-size: 24px;
    color: #303133;
    font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
  'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
    margin-top: 13px;
    margin-bottom: 13px;
}
.h3 {
    font-size: 20px;
    color: #303133;
    font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
  'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
    margin-top: 18px;
    margin-bottom: 18px;
}

</style>
<script>
import AppNav from '../components/AppNav.vue'
import Breadcrumb from '../components/Breadcrumb.vue'
import Avatar from '../components/Avatar.vue'
import { query } from '@/api/Search.js'
import { dialogPercentWidth } from "@/utils/DialogWidthCalculator"


export default {
    components: { AppNav, Breadcrumb, Avatar },
    data() {
        return {
            showSearchDialog: false,
            queryKeyword: '',
            queryData: {
                projectPageData: {},
                tablePageData: {},
                groupPageData: {},
                columnPageData: {},
            },
            queryLoading: false,
            searchSelectHistory: [],
            searchSelectHistoryKey: 'globalSearchSelectHistory',
            showEmpty: false,
        }
    },
    mounted() {
        this.loadSearchSelectHistory()
    },
    computed: {
        hasMatchData() {
            return this.queryData.projectPageData.numberOfElements > 0
            || this.queryData.tablePageData.numberOfElements > 0
            || this.queryData.groupPageData.numberOfElements > 0
            || this.queryData.columnPageData.numberOfElements > 0
        },
        activeSearchTabName() {
            if (this.queryData.tablePageData.numberOfElements > 0) {
                return "tables"
            }
            if (this.queryData.columnPageData.numberOfElements > 0) {
                return "columns"
            }
            if (this.queryData.projectPageData.numberOfElements > 0) {
                return "projects"
            }
            if (this.queryData.groupPageData.numberOfElements > 0) {
                return "groups"
            }
            return ""
        },

    },

    created() {
        document.onkeydown = (e) => {
            if(e.code == 'KeyK' && (e.ctrlKey || e.metaKey)){
                this.search()
                e.preventDefault()
            }
        }
    },
    methods: {
        search() {
            this.showSearchDialog = true
            this.$nextTick(() => {
                this.$refs.queryInputRef.focus()
            })
            
        },
        onQuery(val) {
            this.queryLoading = true;
            query({ query: val })
            .then(resp => {
                if (!resp.errCode) {
                   this.queryData = resp.data
                }
            }).finally(() => {
                this.queryLoading = false
                this.showEmpty = true
            })
        },
        jumpToGroup(group) {
            this.showSearchDialog = false
            const path = '/groups/'+group.groupId+"?groupName="+group.groupName;
            const select = {
                label: group.groupName,
                path: path,
                type: 'group'
            }
            const history = this.searchSelectHistory.filter(item => item.label != select.label)
            history.unshift(select)
            history.splice(10)
            this.searchSelectHistory = history
            window.localStorage.setItem(this.searchSelectHistoryKey, JSON.stringify(this.searchSelectHistory))
            window.location=path
        },
        jumpToProject(project) {
            this.showSearchDialog = false
            const tableDocumentParam = project.tableDocumentId ? '&tableDocumentId='+project.tableDocumentId:""
            const path = '/groups/'+project.groupId+'/projects/'+project.projectId+'/documents?groupName='+project.groupName+"&projectName="+project.projectName+tableDocumentParam;
            
            const tablePath = project.tableName ? ' / ' + project.tableName : ''
            const columnPath = project.colName ? ' / ' +project.colName : ''
            let type = 'project'
            if (project.tableName) {
                type = 'table'
            }
            if (project.colName) {
                type = 'column'
            }
            const label = project.groupName+ ' / '+project.projectName + tablePath + columnPath
            const select = {
                label: label,
                path: path,
                type: type
            }
            const history = this.searchSelectHistory.filter(item => item.label != select.label)
            history.unshift(select)
            history.splice(10)
            this.searchSelectHistory = history

            window.localStorage.setItem(this.searchSelectHistoryKey, JSON.stringify(this.searchSelectHistory))
            window.location=path
        },
        jumpToPath(path) {
            window.location=path
        },
        loadSearchSelectHistory() {
            const key = this.searchSelectHistoryKey
            if (window.localStorage.getItem(key) != null) {
                const obj = JSON.parse(window.localStorage.getItem(key));
                this.searchSelectHistory = obj
            }
        },
        
        historyItemTypeToTagType(type) {
            if (type == 'group') {
                return 'info'
            } else  if (type == 'table') {
                return 'primary'
            } else if (type == 'column') {
                return 'warning'
            } else if (type == 'project') {
                return 'success'
            }
        },
        onRemoveSelectHistoryItem(label) {
            const history = this.searchSelectHistory.filter(item => item.label != label)
            this.searchSelectHistory = history
            window.localStorage.setItem(this.searchSelectHistoryKey, JSON.stringify(this.searchSelectHistory))
        },
        dialogWidth() {
            return dialogPercentWidth()
        }
    }
}

</script>