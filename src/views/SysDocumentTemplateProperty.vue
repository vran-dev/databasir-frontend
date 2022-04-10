<template>

    <el-tabs model-value="columnTab" @tab-click="handleClick">
        <el-tab-pane label="列模板" name="columnTab">
            <h1>列字段名配置</h1>
            <el-row>
                <el-col>
                    <el-button type="primary"  @click="saveColumnProperties">保存</el-button>
                    <el-button type="success"  @click="onTemplatePreview">预览</el-button>
                </el-col>
            </el-row>
            <el-row>
                <el-col>
                    <el-table :data="template.columnFieldNameProperties"  border>
                        <el-table-column prop="key" label="属性">
                        </el-table-column>
                        <el-table-column prop="value" label="值">
                            <template v-slot="scope">
                                    <el-input v-model="scope.row.value" placeholder="属性值"></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column prop="defaultValue" label="默认值">
                        </el-table-column>
                    </el-table>
                </el-col>
            </el-row>
        </el-tab-pane>
        <el-tab-pane label="索引模板" name="indexTab">
            <h1>索引字段名配置</h1>
            <el-row>
                <el-col>
                    <el-button type="primary" @click="saveIndexProperties">保存</el-button>
                    <el-button type="success"  @click="onTemplatePreview">预览</el-button>
                </el-col>
            </el-row>
            <el-row>
                <el-col>
                    <el-table :data="template.indexFieldNameProperties"  border>
                        <el-table-column prop="key" label="属性">
                        </el-table-column>
                        <el-table-column prop="value" label="值">
                            <template v-slot="scope">
                                <el-input v-model="scope.row.value" placeholder="属性值"></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column prop="defaultValue" label="默认值">
                        </el-table-column>
                    </el-table>
                </el-col>
            </el-row>
        </el-tab-pane>
        <el-tab-pane label="外键模板" name="foreignKeyTab">
            <h1>外键字段名配置</h1>
            <el-row>
                <el-col>
                    <el-button type="primary" @click="saveForeignKeyProperties">保存</el-button>
                    <el-button type="success"  @click="onTemplatePreview">预览</el-button>
                </el-col>
            </el-row>
            <el-row>
                <el-col>
                    <el-table :data="template.foreignKeyFieldNameProperties"  border>
                        <el-table-column prop="key" label="属性">
                        </el-table-column>
                        <el-table-column prop="value" label="值">
                            <template v-slot="scope">
                                <el-input v-model="scope.row.value" placeholder="属性值"></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column prop="defaultValue" label="默认值">
                        </el-table-column>
                    </el-table>
                </el-col>
            </el-row>
        </el-tab-pane>
        <el-tab-pane label="触发器模板" name="triggerTab">
            <h1>
                触发器字段名配置
            </h1>
            <el-row>
                <el-col>
                    <el-button type="primary" @click="saveTriggerProperties">保存</el-button>
                    <el-button type="success"  @click="onTemplatePreview">预览</el-button>
                </el-col>
            </el-row>
            <el-row>
                <el-col>
                    <el-table :data="template.triggerFieldNameProperties"  border>
                        <el-table-column prop="key" label="属性">
                        </el-table-column>
                        <el-table-column prop="value" label="值">
                            <template v-slot="scope">
                                <el-input v-model="scope.row.value" placeholder="属性值"></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column prop="defaultValue" label="默认值">
                        </el-table-column>
                    </el-table>
                </el-col>
            </el-row>
        </el-tab-pane>
    </el-tabs>

    <el-dialog 
        v-model="showTemplatePreview"
        width="80%"
        title="模板预览">
        <el-row>
            <div class="h2">Column</div>
            <el-col>
                <el-table border>
                    <el-table-column :label="item.value?item.value:item.defaultValue" v-for="(item, index) in template.columnFieldNameProperties" :key="index"></el-table-column>
                </el-table>
            </el-col>
        </el-row>
        <el-row>
            <div class="h2">Index</div>
            <el-col>
                <el-table border>
                    <el-table-column :label="item.value?item.value:item.defaultValue" v-for="(item, index) in template.indexFieldNameProperties" :key="index"></el-table-column>
                </el-table>
            </el-col>
        </el-row>
        <el-row>
            <div class="h2">Foreign Key</div>
            <el-col>
                <el-table border>
                    <el-table-column :label="item.value?item.value:item.defaultValue" v-for="(item, index) in template.foreignKeyFieldNameProperties" :key="index"></el-table-column>
                </el-table>
            </el-col>
        </el-row>
        <el-row>
            <div class="h2">Trigger</div>
            <el-col>
                <el-table border>
                    <el-table-column :label="item.value?item.value:item.defaultValue" v-for="(item, index) in template.triggerFieldNameProperties" :key="index"></el-table-column>
                </el-table>
            </el-col>
        </el-row>
    </el-dialog>
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
                columnFieldNameProperties:[],
                foreignKeyFieldNameProperties:[],
                indexFieldNameProperties:[],
                triggerFieldNameProperties:[]
            },
            showTemplatePreview: false
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
        onTemplatePreview() {
            this.showTemplatePreview = true
        }
    }
}
</script>