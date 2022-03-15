<template>
    <el-row  v-if="overviewData" style="margin-top:0px !important;">
        <el-col :span="24">
            <!-- database overview -->
            <h2 id="overview[-1]">Overview</h2>
            <el-descriptions :column="1" size="large" border>
                <el-descriptions-item label="Database Name" label-align="left" width='200px'>{{ overviewData.databaseName }}</el-descriptions-item>
                <el-descriptions-item label="Schema Name" label-align="left" width='200px'>{{ overviewData.schemaName }}</el-descriptions-item>
                <el-descriptions-item label="Product Name" label-align="left">{{ overviewData.productName }}</el-descriptions-item>
                <el-descriptions-item label="Product Version" label-align="left">{{ overviewData.productVersion }}</el-descriptions-item>
                <el-descriptions-item label="Document Version" label-align="left">{{ overviewData.documentVersion }}</el-descriptions-item>
                <el-descriptions-item label="Create At" label-align="left">{{ overviewData.createAt }}</el-descriptions-item>
            </el-descriptions>
            <h3>Tables</h3>
            <el-table :data="tableList"  border stripe width='80%' @cell-dblclick="onCellClick">
                <el-table-column type="index" />
                <el-table-column prop="name" label="Name" min-width="160" resizable />
                <el-table-column prop="type" label="Type" width="200"  resizable />
                <el-table-column prop="comment" label="comment" min-width="160" resizable />
                <el-table-column label="description" min-width="160" resizable>
                    <template v-slot="scope">
                        <span v-if="!scope.row.toEditDescription">
                            {{scope.row.description}}
                        </span> 
                        <el-space v-else direction="vertical"  alignment="left" style="width: 100%;">
                            <el-input v-model="scope.row.description" type="textarea" style="width: 100%;" autosize/>
                            <el-button size="small" @click="onUpdateDescription(scope.row.name, null, scope.row)">提交</el-button>
                        </el-space>
                    </template>
                </el-table-column>
                <el-table-column prop="remark" label="discussion" min-width="120" resizable >
                    <template v-slot="scope">
                        <el-badge :value="scope.row.discussionCount" :max="99" class="item" v-if="scope.row.discussionCount" type="info">
                            <el-button @click="onRemark(scope.row.name)" size="small" icon="chat-line-round"></el-button>
                        </el-badge>
                        <el-button v-else @click="onRemark(scope.row.name)" size="small" icon="chat-line-round"></el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-col>
    </el-row>
    <el-row v-for="tableMeta in tablesData" :key="tableMeta.id" style="margin-top:0px !important;">
        <el-col :span="24">
            <h2 :id="tableMeta.name+'['+tableMeta.id+']'">{{ tableMeta.name }}</h2>
            <h3 v-if="tableMeta.columns.length > 0">Columns</h3>
            <el-table :data="tableMeta.columns" border stripe fit width='80%' @cell-dblclick="onCellClick">
                <el-table-column type="index" />
                <el-table-column prop="name" label="Name" min-width="120" />
                <el-table-column prop="type" :formatter="columnTypeFormat" label="Type" width="140" />
                <el-table-column label="Primary Key" width="120"> 
                    <template v-slot="scope">
                        <el-tooltip content="YES" v-if="scope.row.isPrimaryKey">
                            <el-tag>
                                PK
                            </el-tag>
                        </el-tooltip>
                    </template>
                </el-table-column>
                <el-table-column prop="nullable" label="Is Nullable" width="120">
                    <template v-slot="scope">
                    <!-- {{ scope.row.nullable == 'YES' ? 'YES':''}} -->
                        <el-tooltip content="NO" v-if="scope.row.nullable != 'YES'">
                            <el-tag type="info">
                                <del><em>null</em></del>
                            </el-tag>
                        </el-tooltip>
                        <el-tooltip content="YES" v-else>
                            <el-tag type="danger">
                                <em>null</em>
                            </el-tag>
                        </el-tooltip>
                    </template>
                </el-table-column>
                <el-table-column prop="autoIncrement" label="Auto Increment" width="140">
                    <template v-slot="scope">
                        <el-tag v-if="scope.row.autoIncrement == 'YES'">
                            YES
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="defaultValue" label="default" min-width="120" />
                <el-table-column prop="comment" label="comment"  />
                <el-table-column label="description" min-width="160" resizable show-overflow-tooltip>
                    <template v-slot="scope">
                        <span v-if="!scope.row.toEditDescription">
                            <pre>{{scope.row.description}}</pre>
                        </span> 
                        <el-space v-else direction="vertical"  alignment="left" style="width: 100%;">
                            <el-input v-model="scope.row.description" type="textarea" style="width: 100%;" autosize/>
                            <el-button size="small" @click="onUpdateDescription(tableMeta.name, scope.row.name, scope.row)">提交</el-button>
                        </el-space>
                    </template>
                </el-table-column>
                <el-table-column prop="remark" label="discussion" min-width="60" resizable>
                    <template v-slot="scope">
                        <el-badge :value="scope.row.discussionCount" :max="99" class="item" v-if="scope.row.discussionCount" type="info">
                            <el-button @click="onRemark(tableMeta.name, scope.row.name)" size="small" icon="chat-line-round"></el-button>
                        </el-badge>
                        <el-button v-else @click="onRemark(tableMeta.name, scope.row.name)" size="small" icon="chat-line-round"></el-button>
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
                        <el-tooltip content="YES" v-if="scope.row.isUnique">
                            <el-tag>
                                UK
                            </el-tag>
                        </el-tooltip>
                    </template>
                    </el-table-column>
                    <el-table-column label="Columns" min-width="150">
                        <template v-slot="scope">
                            <el-space>
                                <el-tag v-for="(item, index) in scope.row.columnNames" :key="index" type="info">
                                    {{ item }}
                                </el-tag>
                            </el-space>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

            <div v-if="tableMeta.foreignKeys.length > 0">
                <h3>Foreign Keys</h3>            
                <el-table :data="tableMeta.foreignKeys" border stripe fit width='80%'>
                    <el-table-column type="index" />
                    <el-table-column prop="fkName" label="FK Name" min-width="120" />
                    <el-table-column prop="fkColumnName" label="FK Column" min-width="120">
                        <template v-slot="scope">
                            <el-tag type="info">{{scope.row.fkColumnName}}</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="pkName" label="PK Name" min-width="120" />
                    <el-table-column prop="pkTableName" label="PK Table">
                        <template v-slot="scope">
                            <el-link>
                                {{scope.row.pkTableName}}
                            </el-link>
                        </template>
                        
                    </el-table-column>
                    <el-table-column prop="pkColumnName" label="PK Column" min-width="120">
                        <template v-slot="scope">
                            <el-tag type="info">{{scope.row.pkColumnName}}</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="updateRule" label="Update Rule" />
                    <el-table-column prop="deleteRule" label="Delete Rule" />
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
import { saveDescription } from '@/api/DocumentDescription'
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

        columnNameArray(columnNames) {
            if (columnNames) {
                return columnNames.split(',')
            } else {
                return []
            }
        },

        columnTypeFormat(column){
            if (column.decimalDigits == null) {
                return column.type + '('+column.size+')' 
            } else {
                return column.type + '('+column.size+', '+column.decimalDigits+')'
            }
        },

        onCellClick(row) {
            if (row.toEditDescription == true) {
                row.toEditDescription = false
            } else {
                row.toEditDescription = true
            }
        },

        onUpdateDescription(tableName, columnName, row) {
            if (!row.description) {
                this.$message.error("内容不能为空")
                return;
            }
            const projectId = this.$route.params.projectId
            const groupId = this.$route.params.groupId

            const body = {
                tableName: tableName,
                columnName: columnName,
                content: row.description,
            }
            saveDescription(groupId, projectId, body).then(resp => {
                if(!resp.errCode) {
                    this.$message.success('修改成功')
                    row.toEditDescription = false
                }
            })
        }
    }
}

</script>