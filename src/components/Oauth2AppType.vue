<template>
    <template v-if="appType.toLowerCase() == 'github'">
        <el-tooltip :content="appName" effect="light">
            <img :src="appIcon ? appIcon : require('@/assets/app/github.svg')" style="max-width: 20px; max-height: 20px;"/>
        </el-tooltip>
    </template>
    <template v-else-if="appType.toLowerCase() == 'gitlab'">
        <el-tooltip :content="appName"  effect="light">
            <img :src="appIcon ? appIcon : require('@/assets/app/gitlab.svg')" style="max-width: 20px; max-height: 20px;"/>
        </el-tooltip>
    </template>
    <template v-else>
        {{ appType }}
    </template>
</template>


<script>
export default {
    props: {
        appType: String,
        appIcon: String,
        appName: String
    },
}
</script>
