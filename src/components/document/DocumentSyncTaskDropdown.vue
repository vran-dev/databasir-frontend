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
            <el-dropdown-menu  v-if="projectTaskData.tasks.length > 0">
                <el-dropdown-item v-for="task in projectTaskData.tasks" :key="task.taskId" @click="onProgressBarClick(task)">
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
                    <el-progress v-else 
                        :percentage="100"
                        :indeterminate="true"
                        :duration="5"
                        style="width: 150px" >
                        <el-icon><loading /></el-icon>
                    </el-progress>
                </el-dropdown-item>
            </el-dropdown-menu>
        </template>
    </el-dropdown>
</template>

<script>

export default {
    props: ['projectTaskData', 'projectData', 'loading'],
    emits: ['onSync', 'onProgressBarClick'],
    methods: {
        taskStatusToProgressStatus(task){
            if (task.status == 'NEW') {
                return ''
            } else if (task.status == 'RUNNING') {
                return ''
            } else if (task.status == 'FAILED') {
                return 'exception'
            } else if (task.status == 'FINISHED') {
                return 'success'
            }
        },

        onProgressBarClick(task) {
            this.$emit('onProgressBarClick', task)
        },

        onSync() {
            this.$emit('onSync')
        }
    }
}
</script>
