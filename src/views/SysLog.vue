<template>
    <el-container>
        <el-main>
            <el-table :data="projectOperationLogPageData.data">
                <el-table-column prop="id" label=""/>
                <el-table-column prop="operationModule" label="系统模块" />
                <el-table-column prop="operatorNickname" label="操作人" />
                <el-table-column prop="operationName" label="操作" />
                <el-table-column label="状态" >
                    <template #header>
                        <el-select v-model="projectOperationLogPageQuery.isSuccess" placeholder="状态" @change="onQuery" clearable size="small" tag-type="success">
                            <el-option
                            v-for="item in [true, false]"
                            :key="item"
                            :label="item?'成功':'失败'"
                            :value="item"
                            >
                            </el-option>
                        </el-select>
                    </template>
                    <template v-slot="scope">
                        <span v-if="scope.row.isSuccess">
                            <el-tag type="success">成功</el-tag>
                        </span>
                        <span v-else>
                            <el-tag  type="danger">失败</el-tag>
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
                <el-table-column prop="involvedGroupId" label="涉及分组" />
                <el-table-column prop="involvedProjectId" label="涉及项目" />
                <el-table-column prop="involvedUserId" label="涉及用户" />
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
        }
    }
}

</script>