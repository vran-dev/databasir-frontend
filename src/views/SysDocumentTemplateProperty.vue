<template>
    <el-row>
        <el-col>
            <el-switch
                v-model="showSampleData"
                size="large"
                active-text="展示示例数据"
                inactive-text="隐藏示例数据"
                @change="onSwitchShowSampleData"
            />
        </el-col>
    </el-row>
    <el-row>
        <el-col>
            <div class="h3">Tables</div>
        </el-col>
        <el-col>
            <el-table border :data="sampleData.tables" highlight-current-row>
                <el-table-column :label="item.key" v-for="item in template.tableFieldNameProperties" :key="item.key" :prop="item.key">
                    <template #header>
                        <el-input v-model="item.value" :placeholder="item.defaultValue" @change="saveTableProperties()" :input-style="inputStyle">
                        </el-input>
                    </template>
                </el-table-column>
            </el-table>
        </el-col>
    </el-row>
    <el-row>
        <el-col>
            <div class="h3">Columns</div>
        </el-col>
        <el-col>
            <el-table border :data="sampleData.columns" highlight-current-row>
                <el-table-column :label="item.key" v-for="item in template.columnFieldNameProperties" :key="item.key" :prop="item.key">
                    <template #header>
                        <el-input v-model="item.value" :placeholder="item.defaultValue" @change="saveColumnProperties()" :input-style="inputStyle"/>
                    </template>
                </el-table-column>
            </el-table>
        </el-col>
    </el-row>

    <el-row>
        <el-col>
            <div class="h3">Indexes</div>
        </el-col>
        <el-col>
            <el-table border :data="sampleData.indexes">
                <el-table-column :label="item.key" v-for="item in template.indexFieldNameProperties" :key="item.key" :prop="item.key">
                    <template #header>
                        <el-input v-model="item.value" :placeholder="item.defaultValue" @change="saveIndexProperties()" :input-style="inputStyle"/>
                    </template>
                </el-table-column>
            </el-table>
        </el-col>
    </el-row>

    <el-row>
        <el-col>
            <div class="h3">Foreign Keys</div>
        </el-col>
        <el-col>
            <el-table border :data="sampleData.foreignKeys">
                <el-table-column :label="item.key" v-for="item in template.foreignKeyFieldNameProperties" :key="item.key" :prop="item.key">
                    <template #header>
                        <el-input v-model="item.value" :placeholder="item.defaultValue" @change="saveForeignKeyProperties()" :input-style="inputStyle"/>
                    </template>
                </el-table-column>
            </el-table>
        </el-col>
    </el-row>

    <el-row>
        <el-col>
            <div class="h3">Trigger</div>
        </el-col>
        <el-col>
            <el-table border :data="sampleData.triggers">
                <el-table-column :label="item.key" v-for="item in template.triggerFieldNameProperties" :key="item.key" :prop="item.key">
                    <template #header>
                        <el-input v-model="item.value" :placeholder="item.key" @change="saveTriggerProperties()" :input-style="inputStyle"/>
                    </template>
                </el-table-column>
            </el-table>
        </el-col>
    </el-row>
</template>
<style>
.el-row {
    margin-bottom: 12px;
}
</style>
<script>
import { listProperties, updateProperties } from '../api/DocumentTemplate'
import { documentTemplatePropertiesKey } from '../api/Const'

export default {
    data() {
        return {
            template: {
                tableFieldNameProperties:[],
                columnFieldNameProperties:[],
                foreignKeyFieldNameProperties:[],
                indexFieldNameProperties:[],
                triggerFieldNameProperties:[]
            },

            sampleData: {
                tables: [],
                columns: [],
                indexes: [],
                foreignKeys: [],
                triggers: []
            },
            showSampleData: false,

            inputStyle: {
                border: 'none'
            }
        }
    },
    watch: {

    },
    created() {
        this.fetchDocumentTemplateProperties()
    },
    methods: {
        fetchDocumentTemplateProperties() {
            listProperties().then(resp => {
                if(!resp.errCode) {
                    this.template = resp.data
                }
            })
        },
        clearPropertyCache() {
            sessionStorage.removeItem(documentTemplatePropertiesKey)
        },
        saveTableProperties() {
            const body = {
                type: "TABLE_FIELD_NAME",
                properties: this.template.tableFieldNameProperties,
            }
            updateProperties(body).then(resp => {
                if (!resp.errCode) {
                    this.$message.success('保存成功')
                    this.clearPropertyCache()
                }
            })
        },
        saveColumnProperties() {
            const body = {
                type: "COLUMN_FIELD_NAME",
                properties: this.template.columnFieldNameProperties,
            }
            updateProperties(body).then(resp => {
                if (!resp.errCode) {
                    this.$message.success('保存成功')
                    this.clearPropertyCache()
                }
            })
        },
        saveIndexProperties() {
            const body = {
                type: "INDEX_FIELD_NAME",
                properties: this.template.indexFieldNameProperties,
            }
            updateProperties(body).then(resp => {
                if (!resp.errCode) {
                    this.$message.success('保存成功')
                    this.clearPropertyCache()
                }
            })
        },
        saveTriggerProperties() {
            const body = {
                type: "TRIGGER_FIELD_NAME",
                properties: this.template.triggerFieldNameProperties,
            }
            updateProperties(body).then(resp => {
                if (!resp.errCode) {
                    this.$message.success('保存成功')
                    this.clearPropertyCache()
                }
            })
        },
        saveForeignKeyProperties() {
            const body = {
                type: "FOREIGN_KEY_FIELD_NAME",
                properties: this.template.foreignKeyFieldNameProperties,
            }
            updateProperties(body).then(resp => {
                if (!resp.errCode) {
                    this.$message.success('保存成功')
                    this.clearPropertyCache()
                }
            })
        },
        onSwitchShowSampleData(isShow) {
            if (isShow) {
                this.sampleData.tables = [{name:"demo", type: "TABLE", comment: "demo", description:"this is a demo"},{name:"user", type: "TABLE", comment: "user", description:"this is a user"}]
                const columnJsonData = '[{"id":409,"name":"id","type":"INT","size":10,"decimalDigits":1,"comment":"id comment","description":"this is id","isPrimaryKey":true,"nullable":"NO","autoIncrement":"YES","defaultValue":"1","discussionCount":null,"createAt":"2022-04-10 13:45:06"},{"id":410,"name":"email","type":"VARCHAR","size":512,"decimalDigits":null,"comment":"","description":null,"isPrimaryKey":false,"nullable":"NO","autoIncrement":"NO","defaultValue":null,"discussionCount":null,"createAt":"2022-04-10 13:45:06"},{"id":411,"name":"username","type":"VARCHAR","size":128,"decimalDigits":null,"comment":"","description":null,"isPrimaryKey":false,"nullable":"NO","autoIncrement":"NO","defaultValue":null,"discussionCount":null,"createAt":"2022-04-10 13:45:06"},{"id":412,"name":"password","type":"TEXT","size":65535,"decimalDigits":null,"comment":"","description":null,"isPrimaryKey":false,"nullable":"NO","autoIncrement":"NO","defaultValue":null,"discussionCount":null,"createAt":"2022-04-10 13:45:06"}]'
                this.sampleData.columns = JSON.parse(columnJsonData)
                const indexJsonData = '[{"id":96,"name":"uk_email","isUnique":true,"columnNames":["email","deleted_token"],"createAt":"2022-04-10 13:45:06"},{"id":97,"name":"uk_username","isUnique":true,"columnNames":["username","deleted_token"],"createAt":"2022-04-10 13:45:06"},{"id":98,"name":"PRIMARY","isUnique":true,"columnNames":["id"],"createAt":"2022-04-10 13:45:06"}]'
                this.sampleData.indexes = JSON.parse(indexJsonData)
                const foreignKeyJsonData = '[{"fkName":"dept_manager_ibfk_2","fkTableName":"dept_manager","fkColumnName":"dept_no","pkName":"PRIMARY","pkTableName":"departments","pkColumnName":"dept_no","updateRule":"CASCADE","deleteRule":"CASCADE"},{"fkName":"dept_manager_ibfk_1","fkTableName":"dept_manager","fkColumnName":"emp_no","pkName":"PRIMARY","pkTableName":"employees","pkColumnName":"emp_no","updateRule":"CASCADE","deleteRule":"CASCADE"}]'
                this.sampleData.foreignKeys = JSON.parse(foreignKeyJsonData)
                const triggerJsonData = '[{"id":1,"name":"custom trigger","timing":"before","manipulation":"insert","statement":"sql","triggerCreateAt":"1970-01-01 00:00:00"}]'
                this.sampleData.triggers = JSON.parse(triggerJsonData)
            } else {
                this.sampleData.tables = []
                this.sampleData.columns = []
                this.sampleData.indexes = []
                this.sampleData.foreignKeys = []
                this.triggers = []
            }
        }
    }
}
</script>