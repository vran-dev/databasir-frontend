<template>
    <el-row v-if="diffEnabled" style="margin-bottom: 12px;">
        <el-col>
            <el-space>
                <el-tag type="success">新增</el-tag>
                <el-tag type="danger">删除</el-tag>
                <el-tag type="warning">修改</el-tag>
                <el-tag type="info">无变化</el-tag>
            </el-space>
        </el-col>
    </el-row>
    <!-- overview -->
    <el-row  v-if="overviewData" style="margin-top:0px !important;">
        <el-col :span="24">
            <!-- database overview -->
            <el-badge 
                v-if="diffEnabled"
                :value="overviewDiff.diffType" 
                :type="diffTagType(overviewDiff.diffType)" 
                class="badge-item">
                <div id="overview[-1]" class="h2">Overview</div>
            </el-badge>
            <div v-else id="overview[-1]" class="h2">Overview</div>
            <el-descriptions :column="1" size="large" border>
                <el-descriptions-item label="Database Name" label-align="left" width='200px'>{{ overviewData.databaseName }}</el-descriptions-item>
                <el-descriptions-item label="Schema Name" label-align="left" width='200px'>{{ overviewData.schemaName }}</el-descriptions-item>
                <el-descriptions-item label="Product Name" label-align="left">{{ overviewData.productName }}</el-descriptions-item>
                <el-descriptions-item label="Product Version" label-align="left">{{ overviewData.productVersion }}</el-descriptions-item>
                <el-descriptions-item label="Document Version" label-align="left">{{ overviewData.documentVersion }}</el-descriptions-item>
                <el-descriptions-item label="Create At" label-align="left">{{ overviewData.createAt }}</el-descriptions-item>
            </el-descriptions>

            <div class="h3">Tables</div>
            <el-table :data="simpleTables"  border width='80%' @cell-dblclick="onCellClick" :row-class-name="predicateRowClass">
                <el-table-column type="index" />
                <el-table-column label="Name" min-width="160" resizable>
                    <template v-slot="scope">
                        <span> {{scope.row.name}}</span>
                    </template>
                </el-table-column>
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

    <!-- table documentation -->
    <el-row v-for="tableMeta in tables" :key="tableMeta.id" style="margin-top:0px !important;">
        <el-col :span="24">
            <div>
                <el-badge 
                    v-if="diffEnabled"
                    :value="tableMeta.diffType" 
                    :type="diffTagType(tableMeta.diffType)" 
                    class="badge-item">
                    <div :id="tableMeta.name+'['+tableMeta.id+']'" class="h2">{{ tableMeta.name }}</div>
                </el-badge>
                <div v-else :id="tableMeta.name+'['+tableMeta.id+']'" class="h2">{{ tableMeta.name }}</div>
            </div>

            <div v-if="tableMeta.columns.length > 0" class="h3">Columns</div>
            <el-table :data="tableMeta.columns" border fit width='80%' @cell-dblclick="onCellClick" :row-class-name="predicateRowClass"  default-expand-all row-key="id">
                <el-table-column type="index" />
                <el-table-column prop="name" label="Name" min-width="120" >
                    <template v-slot="scope">
                        <span> {{scope.row.name}}</span>
                    </template>
                </el-table-column>
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
                <div class="h3">Indexes</div>
                <el-table :data="tableMeta.indexes" border fit width='80%' :row-class-name="predicateRowClass" default-expand-all row-key="id">
                    <el-table-column type="index" />
                    <el-table-column prop="name" label="Name" min-width="120" >
                        <template v-slot="scope">
                            <span> {{scope.row.name}}</span>
                        </template>
                    </el-table-column>
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
                <div class="h3">Foreign Keys</div>
                <el-table :data="tableMeta.foreignKeys" border fit width='80%' :row-class-name="predicateRowClass"  default-expand-all row-key="id">
                    <el-table-column type="index" />
                    <el-table-column prop="fkName" label="FK Name" min-width="120" >
                        <template v-slot="scope">
                            <span> {{scope.row.fkName}}</span>
                        </template>
                    </el-table-column>
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
                <div class="h3">Triggers</div>
                <el-table :data="tableMeta.triggers" fit border width='80%' :row-class-name="predicateRowClass"  default-expand-all row-key="id">
                    <el-table-column type="index" />
                    <el-table-column prop="name" label="Name" min-width="120" >
                        <template v-slot="scope">
                            <span> {{scope.row.name}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="timing" label="timing" />
                    <el-table-column prop="manipulation" label="manipulation" width="120" />
                    <el-table-column prop="statement" label="statement" />
                    <el-table-column prop="creatAt" label="creatAt" width="150" />
                </el-table>
            </div>
        </el-col>
    </el-row>
</template>

<style>

.badge-item {
    margin-top:18px;
    margin-bottom: 6px;
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

.removed-item {
    background-color: #fef0f0 !important;
    color: #F56C6C;
}

.added-item {
    background-color:  #f0f9eb !important;
    color: #67C23A;
}

.modified-item {
    background-color: #fdf6ec !important;
    color: #E6A23C;
}

.modified-original-item {
    background-color: #fdf6ec !important;
    color: #A8ABB2;
}

</style>

<script>
import { saveDescription } from '@/api/DocumentDescription'
export default {
    props: ['overviewData', 'tablesData', 'overviewDiff',"tablesDiff", 'diffEnabled'],
    emits: ['onRemark'],
    computed: {
        simpleTables() {
            const tables = this.overviewData.tables.filter(d => d.id != -1).map(item => {
                if (this.diffEnabled) {
                    if (this.overviewDiff.tableDiffMap && this.overviewDiff.tableDiffMap.get(item.name)) {
                        item.diffType = this.overviewDiff.tableDiffMap.get(item.name).diffType
                    } else {
                        item.diffType = null
                    }
                } else {
                    item.diffType = null
                }
                return item;
            })
            if (this.diffEnabled) {
                this.overviewDiff.tableDiffMap.forEach(value => {
                    if (value.diffType == 'REMOVED') {
                        const item = value.original
                        item.diffType = 'REMOVED'
                        tables.push(item)
                    }
                })
            }
            return tables
        },

        tables() {
            if (this.diffEnabled) {
                const tableDiffMap = this.tablesDiff.tableDiffMap
                const injectRemovedItem = (container, diffMap) => {
                    diffMap.forEach(value => {
                        if (value.diffType == 'REMOVED') {
                            const item = value.original
                            item.diffType = 'REMOVED'
                            container.push(item)
                        }
                    })
                }
                const injectModifiedField = (target, source) => {
                    if (source.diffType == 'MODIFIED') {
                        const original = Object.assign({}, source.original)
                        original.isOriginal = true
                        target.children = [original]
                    }
                }
                const diffObjMapping = (arr, diffMap) => {
                    return arr.map(item => {
                            const newObj = Object.assign({},item);
                            if (diffMap.get(item.name)) {
                                const data = diffMap.get(item.name)
                                newObj.diffType = data.diffType
                                injectModifiedField(newObj, data)
                            }
                            return newObj
                        })
                }
                return this.tablesData.map(table => {

                    const newTable = Object.assign({},table);
                    if (tableDiffMap.get(table.name)) {
                        const tableDiff = tableDiffMap.get(table.name)

                        const cols = diffObjMapping(table.columns, tableDiff.columnDiffMap)
                        injectRemovedItem(cols, tableDiff.columnDiffMap)

                        const idxes = diffObjMapping(table.indexes, tableDiff.indexDiffMap)
                        injectRemovedItem(idxes, tableDiff.indexDiffMap)

                        const triggers = diffObjMapping(table.triggers, tableDiff.triggerDiffMap)
                        injectRemovedItem(triggers, tableDiff.triggerDiffMap)

                        const foreignKeys = diffObjMapping(table.foreignKeys, tableDiff.foreignKeyDiffMap)
                        injectRemovedItem(foreignKeys, tableDiff.foreignKeyDiffMap)
                        
                        newTable.diffType =  tableDiff.diffType
                        newTable.columns = cols
                        newTable.indexes = idxes
                        newTable.triggers = triggers
                        newTable.foreignKeys = foreignKeys
                    }
                    return newTable
                })
            } else {
                return this.tablesData
            }
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
            if (row.diffType == 'REMOVED' || row.isOriginal) {
                return
            }
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
        },

        diffTagType(diffType) {
            if (diffType == 'REMOVED') {
                return "danger"
            } else if (diffType == 'MODIFIED') {
                return "warning"
            } else if (diffType == 'ADDED') {
                return "success"
            } else {
                return "info"
            }
        },

        predicateRowClass( {row}) {
            const diffType = row.diffType
            if (diffType == 'REMOVED') {
                return "removed-item"
            } else if (diffType == 'MODIFIED' || row.isOriginal) {
                if (row.isOriginal) {
                    return "modified-original-item"
                } 
                return "modified-item"
            } else if (diffType == 'ADDED') {
                return "added-item"
            } else {
                return ""
            }
        },
    }
}

</script>