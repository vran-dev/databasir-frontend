<template>
    <el-tag v-if="diffType == 'ADDED'">
        新增
    </el-tag>
    <el-tag v-else-if="diffType == 'MODIFIED'" type="warning">
        修改
    </el-tag>
    <el-tag v-else-if="diffType == 'REMOVED'" type="danger">
        删除
    </el-tag>
    <el-tag v-else type="info">
        无变化
    </el-tag>
</template>

<script>
import { ElTag } from "element-plus"
export default {
    props: ['diffType'],
    components: [ElTag],
    data() {
        return 
    }
}
</script>