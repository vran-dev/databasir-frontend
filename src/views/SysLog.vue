<template>
    <el-container>
        <el-main>
            <el-table :data="projectOperationLogPageData.data">
                <el-table-column prop="id" label=""/>
                <el-table-column label="系统模块" >
                    <template #header>
                        <el-dropdown>
                            <span>
                                {{logModuleColumnLabel}}
                            <el-icon>
                                <arrow-down />
                            </el-icon>
                            </span>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item v-for="(item, index) in logModuleMap" :key="index" @click="onLogModuleFilter(item)" :icon="item.icon">{{ item.text }}</el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    
                    <template v-slot="scope">
                        {{ scope.row.operationModule }}
                    </template>
                </el-table-column>
                <el-table-column prop="operatorNickname" label="操作人" />
                <el-table-column prop="operationName" label="操作" />
                <el-table-column label="状态" >
                    <template #header>
                        <el-dropdown>
                            <span>
                                {{logStatusColumnLabel}}
                            <el-icon>
                                <arrow-down />
                            </el-icon>
                            </span>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item v-for="(item, index) in logStatusMap" :key="index" @click="onLogStatusFilter(item)" :icon="item.icon">{{ item.text }}</el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    
                    <template v-slot="scope">
                        <span v-if="scope.row.isSuccess">
                            <el-tag type="success">成功</el-tag>
                        </span>
                        <span v-else>
                            <el-tag type="danger">失败</el-tag>
                        </span>
                    </template>
                </el-table-column>

                <el-table-column label="错误信息" >
                    <template v-slot="scope">
                        <span v-if="scope.row.isSuccess">
                        </span>
                        <span v-else>
                            {{ scope.row.operationResponse.errMessage }}
                        </span>
                    </template>
                </el-table-column>
                <el-table-column label="涉及分组">
                    <template v-slot="scope">
                        <el-link v-if="scope.row.involvedGroup">{{ scope.row.involvedGroup.name }}</el-link>
                        <span v-else>
                            -
                        </span>
                    </template>
                </el-table-column>
                <el-table-column label="涉及项目">
                    <template v-slot="scope">
                        <el-link v-if="scope.row.involvedProject">{{ scope.row.involvedProject.name }}</el-link>
                        <span v-else>
                            -
                        </span>
                    </template>
                </el-table-column>

                <el-table-column label="涉及用户">
                    <template v-slot="scope">
                        <el-link v-if="scope.row.involvedUser">{{ scope.row.involvedUser.nickname }}</el-link>
                        <span v-else>
                            -
                        </span>
                    </template>
                </el-table-column>
                <el-table-column prop="createAt" label="记录时间" />
            </el-table>
        </el-main>
        <el-footer>
            <el-pagination layout="prev, pager, next" 
                :hide-on-single-page="false"
                :currentPage="projectOperationLogPageData.number" 
                :page-size="projectOperationLogPageData.size" 
                :page-count="projectOperationLogPageData.totalPages"
                @current-change="onProjectOperationLogCurrentPageChange">

            </el-pagination>
        </el-footer>
    </el-container>
</template>

<script>
import { listOperationLogs } from "../api/OperationLog"

export default {
    data() {
        return {
            projectOperationLogPageData: {
                data: [],
                number: 1,
                size: 10,
                totalElements:0,
                totalPages: 1
            },

            projectOperationLogPageQuery: {
                page: 0,
                size: 10,
                isSuccess: null,
                involveProjectId: null,
                module: null,
            },
            logStatusColumnLabel: '状态',
            logStatusMap: [{text: '全部', icon:'List', value: null }, {text: '成功', icon:'CircleCheck', value: true },{text: '失败', icon:'CircleClose', value: false },],
            logModuleColumnLabel: '模块',
            logModuleMap: [
                { text: '全部', icon:'List', value: null },
                { text: '项目', icon:'Filter', value: 'project' },
                { text: '分组', icon:'Filter', value: 'group' },
                { text: '用户', icon:'Filter', value: 'user' },
                { text: 'OAuth2', icon:'Filter', value: 'login_app' },
                { text: '设置', icon:'Filter', value: 'setting' },
                { text: '数据库扩展', icon:'Filter', value: 'database_type' },
                { text: '登录', icon:'Filter', value: 'login' },
                { text: '未知', icon:'Filter', value: 'UNKNOWN' },
            ],

        }
    },

    created() {
        this.fetchProjectOperationLogs()
    },

    methods: {
        fetchProjectOperationLogs(currentPage) {
            if (currentPage) {
                this.projectOperationLogPageQuery.page = currentPage - 1
            } else {
                this.projectOperationLogPageQuery.page = null
            }
            listOperationLogs(this.projectOperationLogPageQuery).then(resp => {
                if (!resp.errCode) {
                    this.projectOperationLogPageData.data = resp.data.content
                    this.projectOperationLogPageData.number = resp.data.number + 1
                    this.projectOperationLogPageData.size = resp.data.size
                    this.projectOperationLogPageData.totalPages = resp.data.totalPages
                    this.projectOperationLogPageData.totalElements = resp.data.totalElements
                }
            })
        },
        onProjectOperationLogCurrentPageChange(currentPage) {
            if (currentPage && (currentPage -1) != this.projectOperationLogPageQuery.page) {
                this.projectOperationLogPageQuery.page = currentPage - 1
                this.fetchProjectOperationLogs(currentPage)
            }
        },
        onQuery() {
            this.fetchProjectOperationLogs()
        },
        onLogStatusFilter(item) {
            this.projectOperationLogPageQuery.isSuccess = item.value
            if (item.value == null){
                this.logStatusColumnLabel = '状态'
            } else {
                this.logStatusColumnLabel = item.text
            }
            this.onQuery();
        },
        onLogModuleFilter(item) {
            this.projectOperationLogPageQuery.module = item.value
            if (item.value == null){
                this.logModuleColumnLabel = '模块'
            } else {
                this.logModuleColumnLabel = item.text
            }
            this.onQuery();
        }
    }
}

</script>