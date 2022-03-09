<template>
    <el-row  v-if="overviewData">
        <el-col :span="24">
            <!-- database overview -->
            <h2>Overview</h2>
            <el-descriptions :column="1" size="large" border>
                <el-descriptions-item label="Database Name" label-align="left" width='200px'>{{ overviewData.databaseName }}</el-descriptions-item>
                <el-descriptions-item label="Product Name" label-align="left">{{ overviewData.productName }}</el-descriptions-item>
                <el-descriptions-item label="Product Version" label-align="left">{{ overviewData.productVersion }}</el-descriptions-item>
                <el-descriptions-item label="Document Version" label-align="left">{{ overviewData.documentVersion }}</el-descriptions-item>
                <el-descriptions-item label="Create At" label-align="left">{{ overviewData.createAt }}</el-descriptions-item>
            </el-descriptions>
            <h2>Tables</h2>
            <el-table :data="tableList"  border stripe width='80%'>
                <el-table-column type="index" />
                <el-table-column prop="name" label="Name" min-width="160" resizable />
                <el-table-column prop="type" label="Type" width="200"  resizable />
                <el-table-column prop="comment" label="comment" min-width="160" resizable />
                <el-table-column prop="remark" label="remark" min-width="120" resizable >
                <template v-slot="scope">
                    <el-button @click="onRemark(scope.row.name)" size="small" icon="Edit"></el-button>
                </template>
                </el-table-column>
            </el-table>
        </el-col>
    </el-row>
    <el-row v-for="tableMeta in tablesData" :key="tableMeta.id">
        <el-col :span="24">
            <h2 :id="tableMeta.databaseName + '.' + tableMeta.name">{{ tableMeta.name }}</h2>
            <h3 v-if="tableMeta.columns.length > 0">Columns</h3>
            <el-table :data="tableMeta.columns" border stripe fit width='80%'>
                <el-table-column type="index" />
                <el-table-column prop="name" label="Name" min-width="120" />
                <el-table-column prop="type" :formatter="columnTypeFormat" label="Type" width="140" />
                <el-table-column label="Primary Key" width="120"> 
                    <template v-slot="scope">
                    {{ scope.row.isPrimaryKey? 'YES':''}}
                    </template>
                </el-table-column>
                <el-table-column prop="nullable" label="Is Nullable" width="120">
                    <template v-slot="scope">
                    {{ scope.row.nullable == 'YES' ? 'YES':''}}
                    </template>
                </el-table-column>
                <el-table-column prop="autoIncrement" label="Auto Increment" width="140">
                    <template v-slot="scope">
                    {{ scope.row.autoIncrement == 'YES'? 'YES':''}}
                    </template>
                </el-table-column>
                <el-table-column prop="defaultValue" label="default" min-width="120" />
                <el-table-column prop="comment" label="comment"  />
                <el-table-column prop="remark" label="remark" min-width="60" resizable>
                    <template v-slot="scope">
                        <el-button @click="onRemark(tableMeta.name, scope.row.name)" size="small" icon="Edit"></el-button>
                    </template>
                </el-table-column>
            </el-table>
    
            <div v-if="tableMeta.indexes.length > 0">
                <h3>Indexes</h3>            
                <el-table :data="tableMeta.indexes" border stripe fit width='80%'>
                    <el-table-column type="index" />
                    <el-table-column prop="name" label="Name" min-width="120" />
                    <el-table-column prop="isUnique" label="Is Unique" width="120">
                    <template v-slot="scope">
                        {{ scope.row.isUnique? 'YES':''}}
                    </template>
                    </el-table-column>
                    <el-table-column prop="columnNames" label="Columns" min-width="150" />
                </el-table>
            </div>
            
            <div  v-if="tableMeta.triggers.length > 0">
                <h3>Triggers</h3>
                <el-table :data="tableMeta.triggers" stripe fit border width='80%'>
                    <el-table-column type="index" />
                    <el-table-column prop="name" label="Name" min-width="120" />
                    <el-table-column prop="timing" label="timing" />
                    <el-table-column prop="manipulation" label="manipulation" width="120" />
                    <el-table-column prop="statement" label="statement" />
                    <el-table-column prop="creatAt" label="creatAt" width="150" />
                </el-table>
            </div>
        </el-col>
    </el-row>
</template>

<script>

export default {
    props: ['overviewData', 'tablesData'],
    emits: ['onRemark'],

    computed: {
        tableList() {
            return this.overviewData.tables.filter(d => d.id != -1)
        }
    },
    methods: {

        onRemark(tableName, columnName) {
             this.$emit('onRemark', tableName, columnName)
        },

        columnTypeFormat(column){
            if (column.decimalDigits == null) {
                return column.type + '('+column.size+')' 
            } else {
                return column.type + '('+column.size+', '+column.decimalDigits+')'
            }
        },
    }
}

</script>