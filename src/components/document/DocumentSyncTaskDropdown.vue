<template>
    <el-dropdown v-require-roles="['SYS_OWNER', 'GROUP_OWNER?groupId='+projectData.groupId, 'GROUP_MEMBER?groupId='+projectData.groupId]">
        <el-button 
            v-require-roles="['SYS_OWNER', 'GROUP_OWNER?groupId='+projectData.groupId, 'GROUP_MEMBER?groupId='+projectData.groupId]"
            type="success" 
            style="width:100%" 
            icon="Refresh" 
            @click="onSync()" 
            :loading="loading">
            同步<el-icon style="margin-left:8px"><arrow-down /></el-icon>
        </el-button>
        <template #dropdown>
            <el-dropdown-menu  v-if="projectTaskData.tasks.length > 0" @click="onProgressBarClick(task)">
                <el-dropdown-item v-for="task in projectTaskData.tasks" :key="task.taskId">
                    <el-progress v-if="task.status == 'FINISHED'" :percentage="100" :status="taskStatusToProgressStatus(task)" style="width: 150px">
                        <el-tooltip content="点击刷新文档">
                            <el-icon><circle-check /></el-icon>
                        </el-tooltip>
                    </el-progress>
                    <el-progress v-else-if="task.status == 'FAILED'" :percentage="100" :status="taskStatusToProgressStatus(task)" style="width: 150px">
                        <el-tooltip :content="task.result">
                            <el-icon><warning /></el-icon>
                        </el-tooltip>
                    </el-progress>
                    <el-progress v-else-if="task.status == 'CANCELED'" :percentage="100" :status="taskStatusToProgressStatus(task)" style="width: 150px">
                        <el-tooltip :content="task.result">
                            <el-icon><warning /></el-icon>
                        </el-tooltip>
                    </el-progress>
                    <el-progress v-else 
                        :percentage="100"
                        :indeterminate="true"
                        :duration="5"
                        style="width: 150px" >
                        <el-tooltip content="取消同步">
                            <el-button type="text" icon="CircleCloseFilled" @click="cancelProjectSyncTask(task.taskId)">
                            </el-button>
                        </el-tooltip>
                    </el-progress>
                </el-dropdown-item>
            </el-dropdown-menu>
        </template>
    </el-dropdown>
</template>

<script>
import { cancelProjectTask } from '@/api/Project'
import { ElMessage } from 'element-plus'

export default {
    props: ['projectTaskData', 'projectData', 'loading', 'projectId'],
    emits: ['on-sync', 'on-progress-click', 'on-task-cancel'],
    methods: {
        taskStatusToProgressStatus(task){
            if (task.status == 'NEW') {
                return ''
            } else if (task.status == 'RUNNING') {
                return ''
            } else if (task.status == 'CANCELED') {
                return 'warning'
            } else if (task.status == 'FAILED') {
                return 'exception'
            } else if (task.status == 'FINISHED') {
                return 'success'
            }
        },

        onProgressBarClick(task) {
            this.$emit('on-progress-click', task)
            console.log(cancelProjectTask+','+ElMessage)
        },

        onSync() {
            this.$emit('on-sync')
        },
        cancelProjectSyncTask(taskId) {
            cancelProjectTask(this.projectData.projectId, taskId).then(resp => {
                if (!resp.errCode) {
                    ElMessage({
                        message: "取消成功",
                        type: "success"
                    })
                }
            })
        }
    }
}
</script>
