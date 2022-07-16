<template>
  <el-row v-if="diffEnabled" style="margin-bottom: 12px">
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
  <el-row v-if="overviewData" style="margin-top: 0px !important; margin-bottom: 20px">
    <el-col :span="24">
      <!-- database overview -->
      <el-badge v-if="diffEnabled" :value="overviewData.diffType" :type="diffTagType(overviewData.diffType)"
        class="badge-item">
        <div id="overview[-1]" class="h2">Overview</div>
      </el-badge>
      <el-descriptions :column="1" size="large" border>
        <el-descriptions-item label="Database Name" label-align="left" width="200px">{{ overviewData.databaseName }}
        </el-descriptions-item>
        <el-descriptions-item label="Schema Name" label-align="left" width="200px">{{ overviewData.schemaName }}
        </el-descriptions-item>
        <el-descriptions-item label="Product Name" label-align="left">{{
            overviewData.productName
        }}</el-descriptions-item>
        <el-descriptions-item label="Product Version" label-align="left">{{
            overviewData.productVersion
        }}</el-descriptions-item>
        <el-descriptions-item label="Document Version" label-align="left">{{
            overviewData.documentVersion
        }}</el-descriptions-item>
        <el-descriptions-item label="Create At" label-align="left">{{
            overviewData.createAt
        }}</el-descriptions-item>
      </el-descriptions>

      <div class="h3">Tables</div>
      <vxe-table v-if="overviewData.tables.length > useVirtualTableThreshold" border="inner"
        :data="filteralbeSimpleTables" max-height="800" :tree-config="{
          transform: true,
          expandAll: false,
          rowField: 'id',
          parentField: 'parentId',
        }" :row-class-name="predicateRowClass" :row-config="{ isHover: true, height: 60 }"
        :edit-config="{ trigger: 'dblclick', mode: 'cell' }">
        <vxe-column type="seq" width="60"></vxe-column>
        <vxe-column field="name" :title="tableFieldNameMapping('name')" tree-node>
          <template #header>
            <el-input v-model="simpleTablesFilterText" placeholder="表名" class="search-input">
              <template #prefix>
                <el-icon>
                  <Search />
                </el-icon>
              </template>
            </el-input>
          </template>
          <template #default="{ row }">
            <span> {{ row.name }}</span>
          </template>
        </vxe-column>
        <vxe-column field="type" :title="tableFieldNameMapping('type')"></vxe-column>
        <vxe-column field="comment" :title="tableFieldNameMapping('comment')"></vxe-column>
        <vxe-column field="description" :title="tableFieldNameMapping('description')"
          :edit-render="{ name: 'textarea' }">
          <template #edit="{ row }">
            <el-input v-model="row.description" type="textarea" style="width: 100%; z-index: 1000" autosize :rows="10"
              :input-style="style.noBorderInput" @change="onUpdateDescription(row.name, null, row)" />
          </template>
        </vxe-column>
        <vxe-column field="remark" title="讨论">
          <template #default="{ row }">
            <el-badge :value="row.discussionCount" :max="99" class="item" v-if="row.discussionCount" type="info">
              <el-button @click="onRemark(row.name)" size="small" icon="chat-line-round"></el-button>
            </el-badge>
            <el-button v-else @click="onRemark(row.name)" size="small" icon="chat-line-round"></el-button>
          </template>
        </vxe-column>
      </vxe-table>

      <el-table v-else :data="filteralbeSimpleTables" border width="80%" @row-dblclick="onCellClick"
        :row-class-name="predicateRowClass" highlight-current-row row-key="id">
        <el-table-column type="index" label="#" />
        <el-table-column :label="tableFieldNameMapping('name')" min-width="160" resizable>
          <template #header>
            <el-input v-model="simpleTablesFilterText" placeholder="表名" class="search-input">
              <template #prefix>
                <el-icon>
                  <Search />
                </el-icon>
              </template>
            </el-input>
          </template>
          <template v-slot="scope">
            <span> {{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="type" :label="tableFieldNameMapping('type')" width="200" resizable />
        <el-table-column prop="comment" :label="tableFieldNameMapping('comment')" min-width="160" resizable />
        <el-table-column :label="tableFieldNameMapping('description')" min-width="160" resizable>
          <template v-slot="scope">
            <span v-if="!scope.row.toEditDescription">
              {{ scope.row.description }}
            </span>
            <el-space v-else direction="vertical" alignment="left" style="width: 100%">
              <el-input v-model="scope.row.description" type="textarea" style="width: 100%" autosize
                :input-style="style.noBorderInput" @change="onUpdateDescription(scope.row.name, null, scope.row)" />
            </el-space>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="讨论" min-width="120" resizable fixed="right">
          <template v-slot="scope">
            <el-badge :value="scope.row.discussionCount" :max="99" class="item" v-if="scope.row.discussionCount"
              type="info">
              <el-button @click="onRemark(scope.row.name)" size="small" icon="chat-line-round"></el-button>
            </el-badge>
            <el-button v-else @click="onRemark(scope.row.name)" size="small" icon="chat-line-round"></el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-col>
  </el-row>

  <!-- table documentation -->
  <el-row v-for="tableMeta in tables" :key="tableMeta.id">
    <el-col :span="24">
      <div>
        <div style="margin-bottom: 36px">
          <div v-if="diffEnabled">
            <el-badge :value="tableMeta.diffType" :type="diffTagType(tableMeta.diffType)" class="badge-item">
              <div :id="tableMeta.name + '[' + tableMeta.id + ']'" class="h2">
                <img :src="require('@/assets/icon/doc-table.svg')" style="height: 20px; margin-right: 6px" />{{
                    tableMeta.name
                }}
              </div>
            </el-badge>
            <div v-if="tableMeta.comment && tableMeta.comment != ''" class="table-quote">
              {{ tableMeta.comment }}
            </div>
            <div v-else-if="tableMeta.description && tableMeta.description != ''" class="table-quote">
              {{ tableMeta.description }}
            </div>
            <!-- original -->
            <div v-if="
              diffEnabled &&
              tableMeta.original &&
              tableMeta.original.comment != tableMeta.comment
            " style="color: #c8c9cc" class="table-quote">
              <del>
                {{ tableMeta.original.comment }}
              </del>
            </div>
          </div>

          <div v-else :id="tableMeta.name + '[' + tableMeta.id + ']'" class="h2">
            <span style="
                margin-right: 6px;
                display: inline-block;
                vertical-align: middle;
              ">
              <img :src="require('@/assets/icon/doc-table.svg')" style="height: 20px; margin-right: 6px" />
              {{ tableMeta.name }}</span>
            <el-tooltip content="SQL 测试数据生成">
              <el-button @click="showMockDataRules(tableMeta)" round size="small">Insert</el-button>
            </el-tooltip>
            <el-button @click="onRemark(tableMeta.name)" size="small" round icon="chat-line-round"></el-button>

            <div v-if="tableMeta.comment && tableMeta.comment != ''" class="table-quote">
              {{ tableMeta.comment }}
              <span v-if="
                diffEnabled &&
                tableMeta.original &&
                tableMeta.original.comment != tableMeta.comment
              ">
                <em>{{ tableMeta.original.comment }}</em>
              </span>
            </div>
            <div v-else-if="tableMeta.description && tableMeta.description != ''" class="table-quote">
              {{ tableMeta.description }}
            </div>
          </div>
        </div>

        <div class="table-document-block">
          <div v-if="tableMeta.columns.length > 0" class="h3">Columns</div>
          <el-table :data="tableMeta.columns" :flexible="true" width="80%" @cell-dblclick="onCellClick"
            :row-class-name="predicateRowClass" default-expand-all row-key="id" highlight-current-row>
            <el-table-column type="index" fixed="left" />
            <el-table-column prop="name" :label="columnFieldNameMapping('name')" min-width="200">
              <template v-slot="scope">
                <el-space wrap>
                  <span> {{ scope.row.name }}</span>
                  <el-tooltip content="主键" v-if="scope.row.isPrimaryKey">
                    <el-tag size="small"> PK </el-tag>
                  </el-tooltip>
                  <el-tooltip content="自增" v-if="scope.row.autoIncrement == 'YES'">
                    <el-tag type="danger" size="small"> INCR </el-tag>
                  </el-tooltip>
                </el-space>
              </template>
            </el-table-column>
            <el-table-column prop="type" :label="columnFieldNameMapping('type')" min-width="120" />
            <el-table-column prop="size" :label="columnFieldNameMapping('size')" />
            <el-table-column prop="decimalDigits" :label="columnFieldNameMapping('decimalDigits')" />
            <el-table-column prop="nullable" :label="columnFieldNameMapping('nullable')" width="80">
              <template v-slot="scope">
                <el-tag type="primary" v-if="scope.row.nullable == 'YES'">
                  YES
                </el-tag>
                <el-tag type="info" v-else> NO </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="defaultValue" :label="columnFieldNameMapping('defaultValue')" min-width="120">
              <template v-slot="scope">
                <el-tag v-if="
                  scope.row.nullable == 'YES' &&
                  scope.row.defaultValue == null
                " type="danger">
                  null
                </el-tag>
                <span v-else>
                  {{ scope.row.defaultValue }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="comment" :label="columnFieldNameMapping('comment')" min-width="180" />
            <el-table-column :label="columnFieldNameMapping('description')" min-width="160" resizable
              show-overflow-tooltip>
              <template v-slot="scope">
                <span v-if="!scope.row.toEditDescription">
                  <pre>{{ scope.row.description }}</pre>
                </span>
                <el-space v-else direction="vertical" alignment="left" style="width: 100%">
                  <el-input v-model="scope.row.description" type="textarea" style="width: 100%" autosize
                    :input-style="style.noBorderInput" @change="
                      onUpdateDescription(
                        tableMeta.name,
                        scope.row.name,
                        scope.row
                      )
                    " />
                </el-space>
              </template>
            </el-table-column>
            <!-- <el-table-column prop="remark" label="讨论" min-width="60" resizable>
                            <template v-slot="scope">
                                <el-badge :value="scope.row.discussionCount" :max="99" class="item" v-if="scope.row.discussionCount" type="info">
                                    <el-button @click="onRemark(tableMeta.name, scope.row.name)" size="small" icon="chat-line-round"></el-button>
                                </el-badge>
                                <el-button v-else @click="onRemark(tableMeta.name, scope.row.name)" size="small" icon="chat-line-round"></el-button>
                            </template>
                        </el-table-column> -->
          </el-table>
        </div>

        <div v-if="tableMeta.indexes.length > 0" class="table-document-block">
          <div class="h3">Indexes</div>
          <el-table :data="tableMeta.indexes" fit width="80%" :row-class-name="predicateRowClass" default-expand-all
            row-key="id" highlight-current-row>
            <el-table-column type="index" fixed="left" />
            <el-table-column prop="name" :label="indexFieldNameMapping('name')" min-width="120">
              <template v-slot="scope">
                <span> {{ scope.row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="isUnique" :label="indexFieldNameMapping('isUnique')" width="120">
              <template v-slot="scope">
                <el-tooltip content="YES" v-if="scope.row.isUnique">
                  <el-tag> UK </el-tag>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column :label="indexFieldNameMapping('columnNames')" min-width="150">
              <template v-slot="scope">
                <el-tag v-for="(item, index) in scope.row.columnNames" :key="index" type="info"
                  style="margin-right: 12px; margin-bottom: 6px">
                  <span>{{ item }}</span>
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div v-if="tableMeta.foreignKeys.length > 0" class="table-document-block">
          <div class="h3">Foreign Keys</div>
          <el-table :data="tableMeta.foreignKeys" fit width="80%" :row-class-name="predicateRowClass" default-expand-all
            row-key="id" highlight-current-row>
            <el-table-column type="index" fixed="left" />
            <el-table-column prop="fkName" :label="foreignKeyFieldNameMapping('fkName')" min-width="120">
              <template v-slot="scope">
                <span> {{ scope.row.fkName }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="fkColumnName" :label="foreignKeyFieldNameMapping('fkColumnName')" min-width="120">
              <template v-slot="scope">
                <el-tag type="info">{{ scope.row.fkColumnName }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="pkName" :label="foreignKeyFieldNameMapping('pkName')" min-width="120" />
            <el-table-column prop="pkTableName" :label="foreignKeyFieldNameMapping('pkTableName')">
              <template v-slot="scope">
                <el-link>
                  {{ scope.row.pkTableName }}
                </el-link>
              </template>
            </el-table-column>
            <el-table-column prop="pkColumnName" :label="foreignKeyFieldNameMapping('pkColumnName')" min-width="120">
              <template v-slot="scope">
                <el-tag type="info">{{ scope.row.pkColumnName }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="updateRule" :label="foreignKeyFieldNameMapping('updateRule')" />
            <el-table-column prop="deleteRule" :label="foreignKeyFieldNameMapping('deleteRule')" />
          </el-table>
        </div>

        <div v-if="tableMeta.triggers.length > 0" class="table-document-block">
          <div class="h3">Triggers</div>
          <el-table :data="tableMeta.triggers" fit width="80%" :row-class-name="predicateRowClass" default-expand-all
            row-key="id" highlight-current-row>
            <el-table-column type="index" fixed="left" />
            <el-table-column prop="name" :label="triggerFieldNameMapping('name')" min-width="120">
            </el-table-column>
            <el-table-column prop="timing" :label="triggerFieldNameMapping('timing')" />
            <el-table-column prop="manipulation" :label="triggerFieldNameMapping('manipulation')" width="120" />
            <el-table-column prop="statement" :label="triggerFieldNameMapping('statement')" />
            <el-table-column prop="triggerCreateAt" :label="triggerFieldNameMapping('triggerCreateAt')" width="150" />
          </el-table>
        </div>
      </div>
    </el-col>
  </el-row>

  <el-backtop :right="100" :bottom="100" />
  <el-dialog :title="mockTableName" v-model="showMockDataDialog" width="60%">
    <el-tabs model-value="mockDataPane">
      <el-tab-pane label="SQL 测试数据" name="mockDataPane">
        <div style="min-height: 120px">
          <highlightjs language="sql" :code="mockDataSql" />
          <el-tooltip content="点击复制">
            <el-button icon="copy-document" type="primary" text class="copy-button" @click="copyMockSql()"
              v-clipboard:copy="mockDataSql" v-clipboard:success="handleCopySuccess" v-clipboard:error="handleCopyFail">
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
          <el-table-column prop="mockDataType" label="Mock 类型">
            <template v-slot="scope">
              <el-select v-model="scope.row.mockDataType" placeholder="请选择 Mock 类型">
                <el-option v-for="item in mockDataTypes" :key="item.value" :label="item.name" :value="item.value">
                </el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="dependentTableName" label="依赖表">
            <template v-slot="scope">
              <el-select v-model="scope.row.dependentTableName" placeholder="选择关联表"
                @change="scope.row.dependentColumnName = null" v-if="scope.row.mockDataType == 'REF'">
                <el-option v-for="item in mockRefTables" :key="item.name" :label="item.name" :value="item.name" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="dependentColumnName" label="依赖列">
            <template v-slot="scope">
              <el-select v-model="scope.row.dependentColumnName" placeholder="选择关联列"
                v-if="scope.row.mockDataType == 'REF'">
                <el-option v-for="item in mockRefColumns(scope.row.dependentTableName)" :key="item.name"
                  :label="item.name" :value="item.name">
                </el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="mockDataScript" label="脚本">
            <template v-slot="scope">
              <el-input v-model="scope.row.mockDataScript" :autosize="{ minRows: 2, maxRows: 4 }" type="textarea"
                placeholder="表达式" v-if="scope.row.mockDataType == 'SCRIPT'" />
            </template>
          </el-table-column>
        </el-table>
        <el-button style="margin-top: 33px" @click="saveTableMockRules()">保存</el-button>
      </el-tab-pane>
    </el-tabs>

    <template #footer> </template>
  </el-dialog>
</template>

<style>
.badge-item {
  margin-top: 18px;
}

.removed-item {
  background-color: #fef0f0 !important;
  color: #f56c6c;
}

.added-item {
  background-color: #f0f9eb !important;
  color: #67c23a;
}

.modified-item {
  background-color: #fdf6ec !important;
  color: #e6a23c;
}

.modified-original-item {
  background-color: #fdf6ec !important;
  color: #a8abb2;
}

.copy-button {
  position: absolute;
  right: 12px;
  top: 16px;
  color: #fff;
}

.copy-button:hover {
  position: absolute;
  right: 12px;
  top: 12px;
  color: #67c23a;
}

.table-quote {
  padding-left: 8px;
  margin-top: 1.25rem;
  margin-bottom: 6px;
  font-size: 16px;
  color: #909399;
}

.table-document-block {
  margin-bottom: 48px;
}

.row-item {
  margin-right: 8px;
  margin-bottom: 3px;
}

pre code.hljs {
  display: block;
  overflow-x: auto;
  padding: 1em;
}

code.hljs {
  padding: 3px 5px;
  min-height: 100px;
}

/*!
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
*/
.hljs {
  background: #333;
  color: #fff;
}

.hljs-doctag,
.hljs-meta-keyword,
.hljs-name,
.hljs-strong {
  font-weight: 700;
}

.hljs-code,
.hljs-emphasis {
  font-style: italic;
}

.hljs-section,
.hljs-tag {
  color: #62c8f3;
}

.hljs-selector-class,
.hljs-selector-id,
.hljs-template-variable,
.hljs-variable {
  color: #ade5fc;
}

.hljs-meta-string,
.hljs-string {
  color: #a2fca2;
}

.hljs-attr,
.hljs-quote,
.hljs-selector-attr {
  color: #7bd694;
}

.hljs-tag .hljs-attr {
  color: inherit;
}

.hljs-attribute,
.hljs-title,
.hljs-type {
  color: #ffa;
}

.hljs-number,
.hljs-symbol {
  color: #d36363;
}

.hljs-bullet,
.hljs-template-tag {
  color: #b8d8a2;
}

.hljs-built_in,
.hljs-keyword,
.hljs-literal,
.hljs-selector-tag {
  color: #fcc28c;
}

.hljs-code,
.hljs-comment,
.hljs-formula {
  color: #888;
}

.hljs-link,
.hljs-regexp,
.hljs-selector-pseudo {
  color: #c6b4f0;
}

.hljs-meta {
  color: #fc9b9b;
}

.hljs-deletion {
  background: #fc9b9b;
  color: #333;
}

.hljs-addition {
  background: #a2fca2;
  color: #333;
}

.hljs-subst {
  color: #fff;
}

.hljs a {
  color: inherit;
}

.hljs a:focus,
.hljs a:hover {
  color: inherit;
  text-decoration: underline;
}

.hljs mark {
  background: #555;
  color: inherit;
}
</style>

<script>
import { saveDescription } from "@/api/DocumentDescription";
import { documentTemplatePropertiesKey } from "../../api/Const";
import { listProperties } from "../../api/DocumentTemplate";
import { listRules, getMockSql, saveTableRules } from "../../api/MockData";
import { listTables } from "../../api/Document";

export default {
  props: ["overviewData", "tablesData", "diffEnabled", "docVersion"],
  emits: ["onRemark"],
  data() {
    return {
      templateProperties: {
        tableFieldNameMap: new Map(),
        columnFieldNameMap: new Map(),
        indexFieldNameMap: new Map(),
        triggerFieldNameMap: new Map(),
        foreignKeyFieldNameMap: new Map(),
      },
      showMockDataDialog: false,
      mockDataRules: [],
      mockRefTables: [],
      mockDataTypes: [
        {
          name: "自动",
          value: "AUTO",
          icon: "Sunny",
        },
        {
          name: "关联",
          value: "REF",
        },
        {
          name: "脚本",
          value: "SCRIPT",
        },
        {
          name: "手机号",
          value: "PHONE",
          icon: "cellphone",
        },
        {
          name: "头像",
          value: "AVATAR_URL",
          icon: "avatar",
        },
        {
          name: "UUID",
          value: "UUID",
        },
        {
          name: "邮箱",
          value: "EMAIL",
          icon: "box",
        },
        {
          name: "姓名",
          value: "FULL_NAME",
          icon: "credit-card",
        },
        {
          name: "地址",
          value: "FULL_ADDRESS",
        },
      ],
      mockTableId: null,
      mockTableName: "",
      mockDataSql: "",
      style: {
        noBorderInput: {
          border: "none",
        },
      },
      useVirtualTableThreshold: 200,
      simpleTablesFilterText: null,
    };
  },
  created() {
    const rawData = sessionStorage.getItem(documentTemplatePropertiesKey);
    if (!rawData) {
      listProperties().then((resp) => {
        if (!resp.errCode) {
          sessionStorage.setItem(
            documentTemplatePropertiesKey,
            JSON.stringify(resp.data)
          );
          const columnFieldNameMap = new Map(
            resp.data.columnFieldNameProperties.map((prop) => [prop.key, prop])
          );
          const indexFieldNameMap = new Map(
            resp.data.indexFieldNameProperties.map((prop) => [prop.key, prop])
          );
          const triggerFieldNameMap = new Map(
            resp.data.triggerFieldNameProperties.map((prop) => [prop.key, prop])
          );
          const foreignKeyFieldNameMap = new Map(
            resp.data.foreignKeyFieldNameProperties.map((prop) => [
              prop.key,
              prop,
            ])
          );
          const tableFieldNameMap = new Map(
            resp.data.tableFieldNameProperties.map((prop) => [prop.key, prop])
          );
          const data = {
            tableFieldNameMap: tableFieldNameMap,
            columnFieldNameMap: columnFieldNameMap,
            indexFieldNameMap: indexFieldNameMap,
            triggerFieldNameMap: triggerFieldNameMap,
            foreignKeyFieldNameMap: foreignKeyFieldNameMap,
          };
          this.templateProperties = data;
        }
      });
    } else {
      const templateData = JSON.parse(
        sessionStorage.getItem(documentTemplatePropertiesKey)
      );
      const tableFieldNameMap = new Map(
        templateData.tableFieldNameProperties.map((prop) => [prop.key, prop])
      );
      const columnFieldNameMap = new Map(
        templateData.columnFieldNameProperties.map((prop) => [prop.key, prop])
      );
      const indexFieldNameMap = new Map(
        templateData.indexFieldNameProperties.map((prop) => [prop.key, prop])
      );
      const triggerFieldNameMap = new Map(
        templateData.triggerFieldNameProperties.map((prop) => [prop.key, prop])
      );
      const foreignKeyFieldNameMap = new Map(
        templateData.foreignKeyFieldNameProperties.map((prop) => [
          prop.key,
          prop,
        ])
      );
      const data = {
        tableFieldNameMap: tableFieldNameMap,
        columnFieldNameMap: columnFieldNameMap,
        indexFieldNameMap: indexFieldNameMap,
        triggerFieldNameMap: triggerFieldNameMap,
        foreignKeyFieldNameMap: foreignKeyFieldNameMap,
      };
      this.templateProperties = data;
    }
  },
  computed: {
    filteralbeSimpleTables() {
      const raw = this.overviewData.tables;
      if (raw.length > this.useVirtualTableThreshold) {
        const d = raw
          .filter((item) => item.id != -1)
          .filter((item) => {
            if (this.simpleTablesFilterText) {
              return item.name.indexOf(this.simpleTablesFilterText) >= 0;
            } else {
              return true;
            }
          })
          .flatMap((item, index) => {
            const that = Object.assign({}, item);
            that.index = index + 1;
            if (item.original) {
              that.original.isOriginal = true;
              that.original.parentId = that.id;
              that.children = [that.original];
              return [that, that.original];
            } else {
              return [that];
            }
          });
        return d;
      } else {
        return raw
          .filter((item) => item.id != -1)
          .filter((item) => {
            if (this.simpleTablesFilterText) {
              return item.name.indexOf(this.simpleTablesFilterText) >= 0;
            } else {
              return true;
            }
          })
          .map((item, index) => {
            const that = Object.assign({}, item);
            if (item.original) {
              that.original.isOriginal = true;
              that.children = [that.original];
            }
            that.index = index + 1;
            return that;
          });
      }
    },

    simpleTableColumns() {
      const columns = [
        {
          key: 0,
          dataKey: "index",
          title: "",
          width: 100,
        },
        {
          key: 1,
          dataKey: "name",
          title: this.tableFieldNameMapping("name"),
          width: 350,
        },
        {
          key: 2,
          dataKey: "type",
          title: this.tableFieldNameMapping("type"),
          width: 180,
        },
        {
          key: 3,
          dataKey: "comment",
          title: this.tableFieldNameMapping("comment"),
          width: 450,
        },
        {
          key: 4,
          dataKey: "description",
          title: this.tableFieldNameMapping("description"),
          width: 450,
        },
        {
          key: 5,
          dataKey: "remark",
          title: "讨论",
          width: 150,
        },
      ];
      return columns;
    },

    tables() {
      const tables = this.tablesData.map((table) => {
        const newTable = Object.assign({}, table);
        if (newTable.diffType == "MODIFIED") {
          newTable.columns.forEach((item) => {
            if (item.original) {
              item.original.isOriginal = true;
              item.children = [item.original];
            }
          });
          newTable.indexes.forEach((item) => {
            if (item.original) {
              item.original.isOriginal = true;
              item.children = [item.original];
            }
          });
          newTable.triggers.forEach((item) => {
            if (item.original) {
              item.original.isOriginal = true;
              item.children = [item.original];
            }
          });
          newTable.foreignKeys.forEach((item) => {
            if (item.original) {
              item.original.isOriginal = true;
              item.children = [item.original];
            }
          });
          return newTable;
        } else {
          return newTable;
        }
      });
      return tables;
    },
  },
  methods: {
    onRemark(tableName, columnName) {
      this.$emit("onRemark", tableName, columnName);
    },

    columnNameArray(columnNames) {
      if (columnNames) {
        return columnNames.split(",");
      } else {
        return [];
      }
    },

    columnTypeFormat(column) {
      if (column.decimalDigits == null) {
        return column.type + "(" + column.size + ")";
      } else {
        return (
          column.type + "(" + column.size + ", " + column.decimalDigits + ")"
        );
      }
    },

    onCellClick(row) {
      if (row.diffType == "REMOVED" || row.isOriginal || row.id == -1) {
        return;
      }
      if (row.toEditDescription == true) {
        row.toEditDescription = false;
      } else {
        row.toEditDescription = true;
      }
    },

    onUpdateDescription(tableName, columnName, row) {
      let content = "";
      if (!row.description) {
        content = "";
      } else {
        content = row.description;
      }
      const projectId = this.$route.params.projectId;
      const groupId = this.$route.params.groupId;

      const body = {
        tableName: tableName,
        columnName: columnName,
        content: content,
      };
      saveDescription(groupId, projectId, body).then((resp) => {
        if (!resp.errCode) {
          this.$message.success("修改成功");
          row.toEditDescription = false;
        }
      });
    },

    diffTagType(diffType) {
      if (diffType == "REMOVED") {
        return "danger";
      } else if (diffType == "MODIFIED") {
        return "warning";
      } else if (diffType == "ADDED") {
        return "success";
      } else {
        return "info";
      }
    },

    predicateRowClass({ row }) {
      const diffType = row.diffType;
      if (!this.diffEnabled) {
        return "";
      }
      if (diffType == "REMOVED") {
        return "removed-item";
      } else if (diffType == "MODIFIED" || row.isOriginal) {
        if (row.isOriginal) {
          return "modified-original-item";
        }
        return "modified-item";
      } else if (diffType == "ADDED") {
        return "added-item";
      } else {
        return "";
      }
    },
    tableFieldNameMapping(fieldName) {
      const prop = this.templateProperties.tableFieldNameMap.get(fieldName);
      if (!prop) {
        return fieldName;
      }
      return prop.value ? prop.value : prop.defaultValue;
    },
    columnFieldNameMapping(fieldName) {
      const prop = this.templateProperties.columnFieldNameMap.get(fieldName);
      if (!prop) {
        console.log("can not found column field: " + fieldName);
        return fieldName;
      }
      return prop.value ? prop.value : prop.defaultValue;
    },
    indexFieldNameMapping(fieldName) {
      const prop = this.templateProperties.indexFieldNameMap.get(fieldName);
      if (!prop) {
        console.log("can not found index field: " + fieldName);
        return fieldName;
      }
      return prop.value ? prop.value : prop.defaultValue;
    },
    triggerFieldNameMapping(fieldName) {
      const prop = this.templateProperties.triggerFieldNameMap.get(fieldName);
      if (!prop) {
        console.log("can not found trigger field: " + fieldName);
        return fieldName;
      }
      return prop.value ? prop.value : prop.defaultValue;
    },
    foreignKeyFieldNameMapping(fieldName) {
      const prop =
        this.templateProperties.foreignKeyFieldNameMap.get(fieldName);
      if (!prop) {
        console.log("can not found fk field: " + fieldName);
        return fieldName;
      }
      return prop.value ? prop.value : prop.defaultValue;
    },
    showMockDataRules(table) {
      const tableId = table.id;
      this.showMockDataDialog = true;
      this.mockTableId = table.id;
      this.mockTableName = table.name;

      const projectId = this.$route.params.projectId;
      const groupId = this.$route.params.groupId;
      const body = {
        tableId: tableId,
        version: this.docVersion,
      };
      listRules(groupId, projectId, body).then((resp) => {
        if (!resp.errCode) {
          this.mockDataRules = resp.data;
        }
      });
      this.generateMockSql(tableId);
    },
    generateMockSql(tableId) {
      this.mockDataSql = "";
      const projectId = this.$route.params.projectId;
      const groupId = this.$route.params.groupId;
      const body = {
        tableId: tableId,
        version: this.docVersion,
      };
      getMockSql(groupId, projectId, body).then((resp) => {
        if (!resp.errCode) {
          this.mockDataSql = resp.data;
        }
      });

      listTables(projectId, {
        version: this.docVersion,
      }).then((resp) => {
        if (!resp.errCode) {
          this.mockRefTables = resp.data;
        }
      });
    },
    mockRefColumns(tableName) {
      if (!tableName) {
        return [];
      }
      if (!this.mockRefTables.find((item) => item.name == tableName)) {
        return [];
      }
      return this.mockRefTables.find((item) => item.name == tableName).columns;
    },

    saveTableMockRules() {
      const projectId = this.$route.params.projectId;
      const groupId = this.$route.params.groupId;

      saveTableRules(
        groupId,
        projectId,
        this.mockTableId,
        this.mockDataRules
      ).then((resp) => {
        if (!resp.errCode) {
          this.$message.success("保存成功");
          this.generateMockSql(this.mockTableId);
        }
      });
    },

    copyMockSql() { },
    handleCopySuccess() {
      this.$message.success("复制成功");
    },
    handleCopyFail() {
      this.$message.success("复制失败，请手动复制");
    },
  },
};
</script>