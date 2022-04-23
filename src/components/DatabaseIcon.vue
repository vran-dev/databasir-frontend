<template>
    <template v-if="databaseType.toLowerCase() == 'mysql'">
        <el-tooltip :content="databaseType" placement="left">
            <img :src="require('@/assets/database/MySQL.svg')" style="max-width: 33px; max-height: 33px;"/>
        </el-tooltip>
    </template>
    <template v-else-if="databaseType.toLowerCase() == 'postgresql'">
        <el-tooltip :content="databaseType" placement="left">
            <img :src="require('@/assets/database/PostgreSQL.svg')" style="max-width: 33px; max-height: 33px;"/>
        </el-tooltip>
    </template>
    <template v-else-if="databaseType.toLowerCase() == 'oracle'">
        <el-tooltip :content="databaseType" placement="left">
            <img :src="require('@/assets/database/Oracle.svg')" style="max-width: 33px; max-height: 33px;"/>
        </el-tooltip>
    </template>
    <template v-else-if="databaseType.toLowerCase() == 'mariadb'">
        <el-tooltip :content="databaseType" placement="left">
            <img :src="require('@/assets/database/MariaDB.svg')" style="max-width: 33px; max-height: 33px;"/>
        </el-tooltip>
    </template>
    <template v-else-if="databaseType.toLowerCase() == 'sqlserver'">
        <el-tooltip :content="databaseType" placement="left">
            <img :src="require('@/assets/database/Sqlserver.svg')" style="max-width: 33px; max-height: 33px;"/>
        </el-tooltip>
    </template>
    <template v-else-if="icon">
        <el-tooltip :content="databaseType" placement="left">
            <img :src="icon" style="max-width: 33px; max-height: 33px;"/>
        </el-tooltip>
    </template>
    <template v-else>
        {{ databaseType }}
    </template>
</template>


<script>

export default {
    props: {
        databaseType: String,
        icon: String,
    },
}
</script>
