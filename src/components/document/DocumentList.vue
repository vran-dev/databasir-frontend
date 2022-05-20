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
                :value="overviewData.diffType" 
                :type="diffTagType(overviewData.diffType)" 
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
            <el-table :data="simpleTables"  border width='80%' @row-dblclick="onCellClick" :row-class-name="predicateRowClass" highlight-current-row  row-key="id">
                <el-table-column type="index" />
                <el-table-column :label="tableFieldNameMapping('name')" min-width="160" resizable>
                    <template v-slot="scope">
                        <span> {{scope.row.name}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="type" :label="tableFieldNameMapping('type')" width="200"  resizable />
                <el-table-column prop="comment" :label="tableFieldNameMapping('comment')" min-width="160" resizable />
                <el-table-column :label="tableFieldNameMapping('description')" min-width="160" resizable>
                    <template v-slot="scope">
                        <span v-if="!scope.row.toEditDescription">
                            {{scope.row.description}}
                        </span> 
                        <el-space v-else direction="vertical"  alignment="left" style="width: 100%;">
                            <el-input v-model="scope.row.description" type="textarea" style="width: 100%;" autosize :input-style="style.noBorderInput" @change="onUpdateDescription(scope.row.name, null, scope.row)"/>
                        </el-space>
                    </template>
                </el-table-column>
                <el-table-column prop="remark" label="讨论" min-width="120" resizable >
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
                <div v-if="diffEnabled">
                    <el-badge 
                        :value="tableMeta.diffType" 
                        :type="diffTagType(tableMeta.diffType)" 
                        class="badge-item">
                        <div :id="tableMeta.name+'['+tableMeta.id+']'" class="h2">{{ tableMeta.name }}</div>
                    </el-badge>
                    <div v-if="tableMeta.comment && tableMeta.comment !=''" class="table-quote">
                        <svg t="1649948233819" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7285" width="16" height="16"><path d="M195.2 458.24a259.84 259.84 0 0 1 177.92-160c92.16-29.44 47.04-128-34.56-102.72C146.56 249.28 32 395.52 32 586.56 32 736 117.12 832 249.28 832s215.04-79.68 215.04-203.52c0-177.28-168-219.52-269.12-170.24z m527.68 0a259.84 259.84 0 0 1 177.92-160c91.2-29.12 48-128-34.56-102.72-192 54.08-306.56 200-306.56 391.36 0 149.12 85.44 245.12 217.28 245.12S992 752.32 992 628.48c0-176.64-167.04-219.84-269.12-170.24z" fill="#909399" p-id="7286"></path></svg>
                        {{ tableMeta.comment }}
                    </div>
                    <div v-else-if="tableMeta.description && tableMeta.description !=''" class="table-quote">
                        <svg t="1649948233819" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7285" width="16" height="16"><path d="M195.2 458.24a259.84 259.84 0 0 1 177.92-160c92.16-29.44 47.04-128-34.56-102.72C146.56 249.28 32 395.52 32 586.56 32 736 117.12 832 249.28 832s215.04-79.68 215.04-203.52c0-177.28-168-219.52-269.12-170.24z m527.68 0a259.84 259.84 0 0 1 177.92-160c91.2-29.12 48-128-34.56-102.72-192 54.08-306.56 200-306.56 391.36 0 149.12 85.44 245.12 217.28 245.12S992 752.32 992 628.48c0-176.64-167.04-219.84-269.12-170.24z" fill="#909399" p-id="7286"></path></svg>
                        {{ tableMeta.description }}
                    </div>
                    <!-- original -->
                    <div v-if="diffEnabled && tableMeta.original && tableMeta.original.comment != tableMeta.comment" style="color: #c8c9cc;" class="table-quote">
                        <del>
                        <svg t="1649948233819" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7285" width="16" height="16"><path d="M195.2 458.24a259.84 259.84 0 0 1 177.92-160c92.16-29.44 47.04-128-34.56-102.72C146.56 249.28 32 395.52 32 586.56 32 736 117.12 832 249.28 832s215.04-79.68 215.04-203.52c0-177.28-168-219.52-269.12-170.24z m527.68 0a259.84 259.84 0 0 1 177.92-160c91.2-29.12 48-128-34.56-102.72-192 54.08-306.56 200-306.56 391.36 0 149.12 85.44 245.12 217.28 245.12S992 752.32 992 628.48c0-176.64-167.04-219.84-269.12-170.24z" fill="#909399" p-id="7286"></path></svg>
                            {{tableMeta.original.comment}}
                        </del>
                    </div>
                </div>
                
                <div v-else :id="tableMeta.name+'['+tableMeta.id+']'" class="h2">
                    {{ tableMeta.name }}
                    <el-tooltip content="SQL 测试数据生成">
                        <el-button @click="showMockDataRules(tableMeta)" round size="small">Insert</el-button>
                    </el-tooltip>
                    <div v-if="tableMeta.comment && tableMeta.comment !=''" class="table-quote">
                        <svg t="1649948233819" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7285" width="16" height="16"><path d="M195.2 458.24a259.84 259.84 0 0 1 177.92-160c92.16-29.44 47.04-128-34.56-102.72C146.56 249.28 32 395.52 32 586.56 32 736 117.12 832 249.28 832s215.04-79.68 215.04-203.52c0-177.28-168-219.52-269.12-170.24z m527.68 0a259.84 259.84 0 0 1 177.92-160c91.2-29.12 48-128-34.56-102.72-192 54.08-306.56 200-306.56 391.36 0 149.12 85.44 245.12 217.28 245.12S992 752.32 992 628.48c0-176.64-167.04-219.84-269.12-170.24z" fill="#909399" p-id="7286"></path></svg>
                        {{ tableMeta.comment }}
                        <span v-if="diffEnabled && tableMeta.original && tableMeta.original.comment != tableMeta.comment">
                            <em>{{tableMeta.original.comment}}</em>
                        </span>
                    </div>
                    <div v-else-if="tableMeta.description && tableMeta.description !=''" class="table-quote">
                        <svg t="1649948233819" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7285" width="16" height="16"><path d="M195.2 458.24a259.84 259.84 0 0 1 177.92-160c92.16-29.44 47.04-128-34.56-102.72C146.56 249.28 32 395.52 32 586.56 32 736 117.12 832 249.28 832s215.04-79.68 215.04-203.52c0-177.28-168-219.52-269.12-170.24z m527.68 0a259.84 259.84 0 0 1 177.92-160c91.2-29.12 48-128-34.56-102.72-192 54.08-306.56 200-306.56 391.36 0 149.12 85.44 245.12 217.28 245.12S992 752.32 992 628.48c0-176.64-167.04-219.84-269.12-170.24z" fill="#909399" p-id="7286"></path></svg>
                        {{ tableMeta.description }}
                    </div>
                </div>
            </div>

            <div v-if="tableMeta.columns.length > 0" class="h3">
                Columns
            </div>
            <el-table :data="tableMeta.columns" border fit width='80%' @cell-dblclick="onCellClick" :row-class-name="predicateRowClass"  default-expand-all row-key="id" highlight-current-row>
                <el-table-column type="index" />
                <el-table-column prop="name" :label="columnFieldNameMapping('name')" min-width="120" >
                    <template v-slot="scope">
                        <span> {{scope.row.name}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="type" :label="columnFieldNameMapping('type')" />
                <el-table-column prop="size" :label="columnFieldNameMapping('size')"  />
                <el-table-column prop="decimalDigits" :label="columnFieldNameMapping('decimalDigits')"  />

                <el-table-column width="120" :label="columnFieldNameMapping('isPrimaryKey')"> 
                    <template v-slot="scope">
                        <el-tooltip content="YES" v-if="scope.row.isPrimaryKey">
                            <el-tag>
                                PK
                            </el-tag>
                        </el-tooltip>
                    </template>
                </el-table-column>
                <el-table-column prop="nullable" :label="columnFieldNameMapping('nullable')" width="120">
                    <template v-slot="scope">
                            <el-tag type="primary" v-if="scope.row.nullable == 'YES'">
                                YES
                            </el-tag>
                            <el-tag type="info" v-else>
                                NO
                            </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="autoIncrement" :label="columnFieldNameMapping('autoIncrement')" width="140">
                    <template v-slot="scope">
                        <el-tag v-if="scope.row.autoIncrement == 'YES'">
                            YES
                        </el-tag>
                        <el-tag v-else type="info">
                            NO
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="defaultValue" :label="columnFieldNameMapping('defaultValue')" min-width="120" >
                    <template v-slot="scope">
                        <el-tag v-if="scope.row.nullable == 'YES' && scope.row.defaultValue == null" type="danger">
                            null
                        </el-tag>
                        <span v-else>
                            {{ scope.row.defaultValue}}
                        </span>
                    </template>
                </el-table-column>
                <el-table-column prop="comment" :label="columnFieldNameMapping('comment')" />
                <el-table-column :label="columnFieldNameMapping('description')"  min-width="160" resizable show-overflow-tooltip>
                    <template v-slot="scope">
                        <span v-if="!scope.row.toEditDescription">
                            <pre>{{scope.row.description}}</pre>
                        </span> 
                        <el-space v-else direction="vertical"  alignment="left" style="width: 100%;">
                            <el-input v-model="scope.row.description" type="textarea" style="width: 100%;" autosize :input-style="style.noBorderInput" @change="onUpdateDescription(tableMeta.name, scope.row.name, scope.row)"/>
                        </el-space>
                    </template>
                </el-table-column>
                <el-table-column prop="remark" label="讨论" min-width="60" resizable>
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
                <el-table :data="tableMeta.indexes" border fit width='80%' :row-class-name="predicateRowClass" default-expand-all row-key="id" highlight-current-row>
                    <el-table-column type="index" />
                    <el-table-column prop="name" :label="indexFieldNameMapping('name')" min-width="120" >
                        <template v-slot="scope">
                            <span> {{scope.row.name}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="isUnique" :label="indexFieldNameMapping('isUnique')" width="120">
                    <template v-slot="scope">
                        <el-tooltip content="YES" v-if="scope.row.isUnique">
                            <el-tag>
                                UK
                            </el-tag>
                        </el-tooltip>
                    </template>
                    </el-table-column>
                    <el-table-column :label="indexFieldNameMapping('columnNames')" min-width="150">
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
                <el-table :data="tableMeta.foreignKeys" border fit width='80%' :row-class-name="predicateRowClass"  default-expand-all row-key="id" highlight-current-row>
                    <el-table-column type="index" />
                    <el-table-column prop="fkName" :label="foreignKeyFieldNameMapping('fkName')" min-width="120" >
                        <template v-slot="scope">
                            <span> {{scope.row.fkName}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="fkColumnName" :label="foreignKeyFieldNameMapping('fkColumnName')" min-width="120">
                        <template v-slot="scope">
                            <el-tag type="info">{{scope.row.fkColumnName}}</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="pkName" :label="foreignKeyFieldNameMapping('pkName')" min-width="120" />
                    <el-table-column prop="pkTableName" :label="foreignKeyFieldNameMapping('pkTableName')">
                        <template v-slot="scope">
                            <el-link>
                                {{scope.row.pkTableName}}
                            </el-link>
                        </template>
                        
                    </el-table-column>
                    <el-table-column prop="pkColumnName" :label="foreignKeyFieldNameMapping('pkColumnName')" min-width="120">
                        <template v-slot="scope">
                            <el-tag type="info">{{scope.row.pkColumnName}}</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="updateRule" :label="foreignKeyFieldNameMapping('updateRule')" />
                    <el-table-column prop="deleteRule" :label="foreignKeyFieldNameMapping('deleteRule')" />
                </el-table>
            </div>
            
            <div  v-if="tableMeta.triggers.length > 0">
                <div class="h3">Triggers</div>
                <el-table :data="tableMeta.triggers" fit border width='80%' :row-class-name="predicateRowClass"  default-expand-all row-key="id" highlight-current-row>
                    <el-table-column type="index" />
                    <el-table-column prop="name" :label="triggerFieldNameMapping('name')" min-width="120" >
                    </el-table-column>
                    <el-table-column prop="timing" :label="triggerFieldNameMapping('timing')" />
                    <el-table-column prop="manipulation" :label="triggerFieldNameMapping('manipulation')" width="120" />
                    <el-table-column prop="statement" :label="triggerFieldNameMapping('statement')" />
                    <el-table-column prop="triggerCreateAt" :label="triggerFieldNameMapping('triggerCreateAt')" width="150" />
                </el-table>
            </div>
        </el-col>
    </el-row>
              <el-backtop :right="100" :bottom="100"/>


     <el-dialog
        :title="mockTableName"
        v-model="showMockDataDialog"
        width="60%"
    >
        <el-tabs model-value="mockDataPane" >
            <el-tab-pane label="SQL 测试数据" name="mockDataPane">
                <div style="min-height: 120px;">
                    <highlightjs
                        language="sql"
                        :code="mockDataSql"
                    />
                    <el-tooltip content="点击复制">
                        <el-button 
                            icon="copy-document"
                            type="primary"
                            text
                            class="copy-button"
                             @click="copyMockSql()" 
                            v-clipboard:copy="mockDataSql" 
                            v-clipboard:success="handleCopySuccess" 
                            v-clipboard:error="handleCopyFail">
                        </el-button>
                    </el-tooltip>
                </div>
            </el-tab-pane>
            <el-tab-pane label="生成规则" name="mockRulePane">
                <el-table :data="mockDataRules">
                    <el-table-column prop="columnName" label="名称" />
                    <el-table-column prop="columnType" label="类型">
                        <template v-slot="scope">
                            <el-tag>{{ scope.row.columnType }}</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="mockDataType" label="Mock 类型" >
                        <template v-slot="scope">
                            <el-select v-model="scope.row.mockDataType" placeholder="请选择 Mock 类型">
                                <el-option
                                v-for="item in mockDataTypes"
                                :key="item.value"
                                :label="item.name"
                                :value="item.value"
                                >
                                </el-option>
                            </el-select>
                        </template>
                    </el-table-column>
                    <el-table-column prop="dependentTableName" label="依赖表">
                        <template v-slot="scope">
                            <el-select v-model="scope.row.dependentTableName"  placeholder="选择关联表" @change="scope.row.dependentColumnName = null" v-if="scope.row.mockDataType == 'REF'">
                                <el-option
                                v-for="item in mockRefTables"
                                :key="item.name"
                                :label="item.name"
                                :value="item.name"
                                />
                            </el-select>
                        </template>
                    </el-table-column>
                    <el-table-column prop="dependentColumnName" label="依赖列">
                        <template v-slot="scope">
                            <el-select v-model="scope.row.dependentColumnName"  placeholder="选择关联列" v-if="scope.row.mockDataType == 'REF'">
                                <el-option
                                v-for="item in mockRefColumns(scope.row.dependentTableName)"
                                :key="item.name"
                                :label="item.name"
                                :value="item.name"
                                >
                                </el-option>
                            </el-select>
                        </template>
                    </el-table-column>
                    <el-table-column prop="mockDataScript" label="脚本">
                        <template v-slot="scope">
                            <el-input
                                v-model="scope.row.mockDataScript"
                                :autosize="{ minRows: 2, maxRows: 4 }"
                                type="textarea"
                                placeholder="表达式"
                                v-if="scope.row.mockDataType == 'SCRIPT'"
                            />
                        </template>
                    </el-table-column>
                </el-table>
                <el-button style="margin-top:33px;" @click="saveTableMockRules()">保存</el-button>
            </el-tab-pane>
        </el-tabs>
        
        <template #footer>
        </template>
    </el-dialog>
</template>

<style>

.badge-item {
    margin-top:18px;
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

.copy-button {
    position:absolute;
    right: 12px;
    top: 16px;
    color:#fff;
}

.copy-button:hover {
    position:absolute;
    right: 12px;
    top: 12px;
    color:#67C23A;
}

.table-quote {
    padding-left:8px;
    margin:12px 0 6px 0;
    font-size:16px;
}

pre code.hljs{display:block;overflow-x:auto;padding:1em}code.hljs{padding:3px 5px;min-height: 100px;}/*!
   Theme: Agate
   Author: (c) Taufik Nurrohman <hi@taufik-nurrohman.com>
   Maintainer: @taufik-nurrohman
   Updated: 2021-04-24

   #333
   #62c8f3
   #7bd694
   #888
   #a2fca2
   #ade5fc
   #b8d8a2
   #c6b4f0
   #d36363
   #fc9b9b
   #fcc28c
   #ffa
   #fff
*/.hljs{background:#333;color:#fff}.hljs-doctag,.hljs-meta-keyword,.hljs-name,.hljs-strong{font-weight:700}.hljs-code,.hljs-emphasis{font-style:italic}.hljs-section,.hljs-tag{color:#62c8f3}.hljs-selector-class,.hljs-selector-id,.hljs-template-variable,.hljs-variable{color:#ade5fc}.hljs-meta-string,.hljs-string{color:#a2fca2}.hljs-attr,.hljs-quote,.hljs-selector-attr{color:#7bd694}.hljs-tag .hljs-attr{color:inherit}.hljs-attribute,.hljs-title,.hljs-type{color:#ffa}.hljs-number,.hljs-symbol{color:#d36363}.hljs-bullet,.hljs-template-tag{color:#b8d8a2}.hljs-built_in,.hljs-keyword,.hljs-literal,.hljs-selector-tag{color:#fcc28c}.hljs-code,.hljs-comment,.hljs-formula{color:#888}.hljs-link,.hljs-regexp,.hljs-selector-pseudo{color:#c6b4f0}.hljs-meta{color:#fc9b9b}.hljs-deletion{background:#fc9b9b;color:#333}.hljs-addition{background:#a2fca2;color:#333}.hljs-subst{color:#fff}.hljs a{color:inherit}.hljs a:focus,.hljs a:hover{color:inherit;text-decoration:underline}.hljs mark{background:#555;color:inherit}

</style>

<script>
import { saveDescription } from '@/api/DocumentDescription'
import { documentTemplatePropertiesKey } from '../../api/Const'
import { listProperties } from '../../api/DocumentTemplate'
import { listRules, getMockSql, saveTableRules } from '../../api/MockData'
import { listTables } from '../../api/Document'

export default {
    props: ['overviewData', 'tablesData', 'diffEnabled', 'docVersion'],
    emits: ['onRemark'],
    data() {
        return {
            templateProperties: {
                tableFieldNameMap: new Map(),
                columnFieldNameMap: new Map(),
                indexFieldNameMap:  new Map(),
                triggerFieldNameMap:  new Map(),
                foreignKeyFieldNameMap:  new Map(),
            },
            showMockDataDialog: false,
            mockDataRules: [],
            mockRefTables: [
            ],
            mockDataTypes: [
                {
                    name: "自动",
                    value: "AUTO",
                    icon: "Sunny",
                },
                {
                    name: "关联",
                    value: "REF"
                },
                {
                    name: "脚本",
                    value: "SCRIPT"
                },
                {
                    name: "手机号",
                    value: "PHONE",
                    icon: "cellphone"
                },
                {
                    name: "头像",
                    value: "AVATAR_URL",
                    icon: "avatar"
                },
                {
                    name: "UUID",
                    value: "UUID"
                },
                {
                    name: "邮箱",
                    value: "EMAIL",
                    icon: "box"
                },
                {
                    name: "姓名",
                    value: "FULL_NAME",
                    icon: "credit-card"
                },
                {
                    name: "地址",
                    value: "FULL_ADDRESS"
                }
            ],
            mockTableId: null,
            mockTableName: '',
            mockDataSql: '',
            style: {
                noBorderInput : {
                    border: 'none'
                }
            },
        }
    },
    created(){
        const rawData = sessionStorage.getItem(documentTemplatePropertiesKey)
        if (!rawData) {
            listProperties().then(resp => {
                if(!resp.errCode) {
                    sessionStorage.setItem(documentTemplatePropertiesKey, JSON.stringify(resp.data))
                    const columnFieldNameMap = new Map(resp.data.columnFieldNameProperties.map(prop => [prop.key, prop]))
                    const indexFieldNameMap = new Map(resp.data.indexFieldNameProperties.map(prop => [prop.key, prop]))
                    const triggerFieldNameMap = new Map(resp.data.triggerFieldNameProperties.map(prop => [prop.key, prop]))
                    const foreignKeyFieldNameMap = new Map(resp.data.foreignKeyFieldNameProperties.map(prop => [prop.key, prop]))
                    const tableFieldNameMap = new Map(resp.data.tableFieldNameProperties.map(prop => [prop.key, prop]))
                    const data = {
                        tableFieldNameMap: tableFieldNameMap,
                        columnFieldNameMap: columnFieldNameMap,
                        indexFieldNameMap: indexFieldNameMap,
                        triggerFieldNameMap: triggerFieldNameMap,
                        foreignKeyFieldNameMap: foreignKeyFieldNameMap,
                    }
                    this.templateProperties = data
                }
            });
        } else  {
            const templateData = JSON.parse(sessionStorage.getItem(documentTemplatePropertiesKey))
            const tableFieldNameMap = new Map(templateData.tableFieldNameProperties.map(prop => [prop.key, prop]))
            const columnFieldNameMap = new Map(templateData.columnFieldNameProperties.map(prop => [prop.key, prop]))
            const indexFieldNameMap = new Map(templateData.indexFieldNameProperties.map(prop => [prop.key, prop]))
            const triggerFieldNameMap = new Map(templateData.triggerFieldNameProperties.map(prop => [prop.key, prop]))
            const foreignKeyFieldNameMap = new Map(templateData.foreignKeyFieldNameProperties.map(prop => [prop.key, prop]))
            const data = {
                tableFieldNameMap: tableFieldNameMap,
                columnFieldNameMap: columnFieldNameMap,
                indexFieldNameMap: indexFieldNameMap,
                triggerFieldNameMap: triggerFieldNameMap,
                foreignKeyFieldNameMap: foreignKeyFieldNameMap,
            }
            this.templateProperties = data
        }

    },
    computed: {
        simpleTables() {
            return this.overviewData.tables.map(item => {
                const that = Object.assign({}, item)
                if(item.original) {
                    that.original.isOriginal = true
                    that.children = [that.original]
                }
                return that
            })
        },

        tables() {
            const tables =  this.tablesData.map(table => {
                const newTable = Object.assign({},table);
                if (newTable.diffType == 'MODIFIED') {
                    newTable.columns.forEach(item => {
                        if(item.original) {
                            item.original.isOriginal = true
                            item.children = [item.original]
                        }
                    })
                    newTable.indexes.forEach(item => {
                        if(item.original) {
                            item.original.isOriginal = true
                            item.children = [item.original]
                        }
                    })
                    newTable.triggers.forEach(item => {
                        if(item.original) {
                            item.original.isOriginal = true
                            item.children = [item.original]
                        }
                    })
                    newTable.foreignKeys.forEach(item => {
                        if(item.original) {
                            item.original.isOriginal = true
                            item.children = [item.original]
                        }
                    })
                    return newTable;
                } else {
                    return newTable;
                }
            })
            return tables;
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
            let content = ''
            if (!row.description) {
                content = ''
            } else {
                content = row.description
            }
            const projectId = this.$route.params.projectId
            const groupId = this.$route.params.groupId

            const body = {
                tableName: tableName,
                columnName: columnName,
                content: content,
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
            if(!this.diffEnabled) {
                return ""
            }
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
        tableFieldNameMapping(fieldName) {
            const prop = this.templateProperties.tableFieldNameMap.get(fieldName)
            if (!prop) {
                return fieldName;
            }
            return prop.value ? prop.value : prop.defaultValue
        },
        columnFieldNameMapping(fieldName) {
            const prop = this.templateProperties.columnFieldNameMap.get(fieldName)
            if (!prop) {
                console.log('can not found column field: '+fieldName)
                return fieldName;
            }
            return prop.value ? prop.value : prop.defaultValue
        },
        indexFieldNameMapping(fieldName) {
            const prop = this.templateProperties.indexFieldNameMap.get(fieldName)
            if (!prop) {
                console.log('can not found index field: '+fieldName)
                return fieldName;
            }
            return prop.value ? prop.value : prop.defaultValue
        },
        triggerFieldNameMapping(fieldName) {
            const prop = this.templateProperties.triggerFieldNameMap.get(fieldName)
            if (!prop) {
                console.log('can not found trigger field: '+fieldName)
                return fieldName;
            }
            return prop.value ? prop.value : prop.defaultValue
        },
        foreignKeyFieldNameMapping(fieldName) {
            const prop = this.templateProperties.foreignKeyFieldNameMap.get(fieldName)
            if (!prop) {
                console.log('can not found fk field: '+fieldName)
                return fieldName;
            }
            return prop.value ? prop.value : prop.defaultValue
        },
        showMockDataRules(table) {
            const tableId = table.id
            this.showMockDataDialog = true
            this.mockTableId = table.id
            this.mockTableName = table.name

            const projectId = this.$route.params.projectId
            const groupId = this.$route.params.groupId
            const body = {
                tableId: tableId,
                version: this.docVersion
            }
            listRules(groupId, projectId, body).then(resp => {
                if(!resp.errCode) {
                    this.mockDataRules = resp.data
                }
            })
            this.generateMockSql(tableId)
        },
        generateMockSql(tableId) {
            this.mockDataSql = ''
            const projectId = this.$route.params.projectId
            const groupId = this.$route.params.groupId
            const body = {
                tableId: tableId,
                version: this.docVersion
            }
            getMockSql(groupId, projectId, body).then(resp => {
                if(!resp.errCode) {
                    this.mockDataSql = resp.data
                }
            })
            
            listTables(projectId, {
                version: this.docVersion
            }).then(resp => {
                if(!resp.errCode) {
                    this.mockRefTables = resp.data
                }
            })
        },
        mockRefColumns(tableName) {
            if (!tableName) {
                return []
            }
            if (!this.mockRefTables.find(item => item.name == tableName)) {
                return []
            }
            return this.mockRefTables.find(item => item.name == tableName).columns
        },

        saveTableMockRules() {
            const projectId = this.$route.params.projectId
            const groupId = this.$route.params.groupId

            saveTableRules(groupId, projectId,  this.mockTableId, this.mockDataRules).then(resp => {
                if(!resp.errCode) {
                    this.$message.success("保存成功");
                    this.generateMockSql(this.mockTableId)
                }
            })
        },

        copyMockSql() {
        },  
        handleCopySuccess() {
            this.$message.success("复制成功")
        },
        handleCopyFail() {
            this.$message.success("复制失败，请手动复制")
        },
    }
}

</script>