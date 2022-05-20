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
                placeholder="分组、项目、database、schema 搜索"
                style="width:100%;border:none;"
                @change="onQuery"
            >
                <template #prepend>
                    <el-button :loading="queryLoading" icon="Search"></el-button>
                </template>
            </el-input>
            <div style="margin-top:16px;">
                <el-link :underline="false" v-for="(item, index) in searchSelectHistory" :key="index" @click="jumpToPath(item.path)" style="margin-right: 12px;margin-bottom:12px;">
                    <el-tag closable :type="item.type == 'group'?'primary':'success'" @close="onRemoveSelectHistoryItem(item.label)">
                        {{item.label}}
                    </el-tag>
                </el-link>
            </div>
            <el-divider v-if="queryData.projects.length > 0 || queryData.groups.length > 0"></el-divider>
            
            <div class="search-container">
                <div class="search-item" v-for="(project,index) in queryData.projects" :key="index" @click="jumpToProject(project)">
                    <span>
                        <el-tag type="success">project</el-tag> <el-link :underline="false"> {{project.groupName}} / {{project.projectName}}</el-link>
                    </span>
                    <span class="jump">
                        <el-icon><Right /></el-icon>
                    </span>
                </div>
                <div class="search-item" v-for="(group,index) in queryData.groups" :key="index" @click="jumpToGroup(group)">
                    <span>
                    <el-tag>group</el-tag> <el-link :underline="false"> {{group.name}}</el-link>
                    </span>
                    <span class="jump">
                        <el-icon><Right /></el-icon>
                    </span>
                </div>
            </div>
        </el-dialog>
    </el-container>
</template>

<style>
.search-item {
    padding: 10px;
    width: 99%;
    margin-bottom: 12px;
    margin-right:12px;
    display: flex;
    justify-content: space-between;
    border-radius: 8px;
}
.search-item:hover {
    background-color: #F0F2F5;
}
.search-item .jump {
    margin-right: 8px;
}

.search-container {
    max-height: 420px;
    overflow-y: auto;
    overflow-x: hidden;
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
    color: #606266;
    font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
  'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
    margin-top: 13px;
    margin-bottom: 13px;
}
.h3 {
    font-size: 20px;
    color: #909399;
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
                projects: [],
                groups: []
            },
            queryLoading: false,
            searchSelectHistory: [],
            searchSelectHistoryKey: 'globalSearchSelectHistory'
        }
    },
    mounted() {
        this.loadSearchSelectHistory()
    },
    methods: {
        search() {
            this.showSearchDialog = true
        },
        onQuery(val) {
            this.queryLoading = true;
            query({ query: val })
            .then(resp => {
                if (!resp.errCode) {
                   this.queryData = resp.data
                }
            }).finally(() => this.queryLoading = false)
        },
        jumpToGroup(group) {
            this.showSearchDialog = false
            const path = '/groups/'+group.id+"?groupName="+group.name;
            const select = {
                label: group.name,
                path: path,
                type: 'group'
            }
            const history = this.searchSelectHistory.filter(item => item.label != select.label)
            history.unshift(select)
            history.splice(15)
            this.searchSelectHistory = history
            window.localStorage.setItem(this.searchSelectHistoryKey, JSON.stringify(this.searchSelectHistory))
            window.location=path
        },
        jumpToProject(project) {
            this.showSearchDialog = false
            const path = '/groups/'+project.groupId+'/projects/'+project.projectId+'/documents?groupName='+project.groupName+"&projectName="+project.projectName
            
            const select = {
                label: project.groupName+ ' / '+project.projectName,
                path: path,
                type: 'project'
            }
            const history = this.searchSelectHistory.filter(item => item.label != select.label)
            history.unshift(select)
            history.splice(15)
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