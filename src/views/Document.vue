<template>
  <div v-if="isShowNoDataPage">
      <el-empty description="似乎还没有同步过文档" >
          <el-button type="primary" icon='refresh' round size='large' @click="handleSync" :loading="state.buttonLoading.handleSync">同步</el-button>
      </el-empty>
  </div>
  <div v-else-if="isShowLoadingPage">
    <el-skeleton v-loading="!state.init" :rows="12" />
  </div>
  <div v-else>
    <el-container class="document-content">
      <el-header>
          <el-row :gutter="20">
            <el-col :span="2" v-require-roles="['SYS_OWNER', 'GROUP_OWNER?groupId='+state.groupId, 'GROUP_MEMBER?groupId='+state.groupId]">
              <el-button type="success" style="width:100%" icon="Refresh" @click="handleSync" :loading="state.buttonLoading.handleSync">同步</el-button>
            </el-col>
            <el-col :span="2" v-require-roles="['SYS_OWNER', 'GROUP_OWNER?groupId='+state.groupId, 'GROUP_MEMBER?groupId='+state.groupId]">
                <el-button type="primary" style="width:100%" icon="Download">导出</el-button>
            </el-col>
            <el-col :span="4">
                <el-select @change="handleVersionFilter" v-model="state.databaseDocumentFilter.version" placeholder="历史版本" clearable>
                  <el-option
                  v-for="item in state.databaseDocumentVersions"
                  :key="item.version"
                  :label="'['+item.createAt +']->'+item.version+''"
                  :value="item.version"
                  >
                  </el-option>
              </el-select>
            </el-col>
          </el-row>
      </el-header>
      
      <el-main>
        <el-row>
          <!-- database overview -->
          <el-col>
            <el-descriptions :column="1" size="large" border>
              <el-descriptions-item label="Database Name" label-align="left" width='200px'>{{ state.databaseDocument.databaseName }}</el-descriptions-item>
              <el-descriptions-item label="Product Name" label-align="left">{{ state.databaseDocument.productName }}</el-descriptions-item>
              <el-descriptions-item label="Product Version" label-align="left">{{ state.databaseDocument.productVersion }}</el-descriptions-item>
              <el-descriptions-item label="Document Version" label-align="left">{{ state.databaseDocument.documentVersion }}</el-descriptions-item>
              <el-descriptions-item label="Create At" label-align="left">{{ state.databaseDocument.createAt }}</el-descriptions-item>
            </el-descriptions>
          </el-col>
        </el-row>

        <!-- table overview -->
        <el-row>
          <el-col>
            <h2 :id="state.databaseDocument.name + '.overview'">Overview</h2>
          </el-col>
        </el-row>
        <el-row>
          <el-col>
            <el-table :data="state.databaseDocument.tables"  border width='80%'>
              <el-table-column type="index" :index="indexMethod" />
              <el-table-column prop="name" label="Name" min-width="160" resizable />
              <el-table-column prop="type" label="Type" width="200"  resizable />
              <el-table-column prop="comment" label="comment" min-width="160" resizable />
            </el-table>
          </el-col>
        </el-row>

        <!-- table details -->
        <template v-for="tableMeta in state.databaseDocument.tables" :key="tableMeta">
          <el-row>
            <el-col>
              <h2 :id="state.databaseDocument.name + '.' + tableMeta.name">{{ tableMeta.name }}</h2>
            </el-col>
          </el-row>
          
          <el-row>
            <el-col v-if="tableMeta.columns.length > 0">
              <h3>Columns</h3>
            </el-col>
          </el-row>
          <el-row>
            <el-col >
              <el-table :data="tableMeta.columns" border fit width='80%'>
                <el-table-column type="index" :index="indexMethod" />
                <el-table-column prop="name" label="Name" min-width="120" />
                <el-table-column prop="type" :formatter="columnTypeFormat" label="Type" width="140" />
                <el-table-column prop="nullable" label="Is Nullable" width="120" />
                <el-table-column prop="autoIncrement" label="Auto increment" width="140" />
                <el-table-column prop="defaultValue" label="default" min-width="120" />
                <el-table-column prop="comment" label="comment"  />
              </el-table>
            </el-col>
          </el-row>
        
          <div v-if="tableMeta.indexes.length > 0">
            <el-row>
              <el-col>
                <h3>Indexes</h3>            
              </el-col>
            </el-row>
            <el-row>
              <el-col >
                <el-table :data="tableMeta.indexes" border fit width='80%'>
                  <el-table-column type="index" :index="indexMethod" />
                  <el-table-column prop="name" label="Name" min-width="120" />
                  <el-table-column prop="isPrimary" label="IsPrimary" width="120" />
                  <el-table-column prop="isUnique" label="Is Unique" width="120" />
                  <el-table-column prop="columnNames" label="Columns" min-width="150" />
                </el-table>
              </el-col>
            </el-row>
          </div>
 
          
          <div  v-if="tableMeta.triggers.length > 0">
            <el-row>
              <el-col>
                <h3>Triggers</h3>
              </el-col>
            </el-row>
            <el-row>
              <el-col >
                <el-table :data="tableMeta.triggers" fit border width='80%'>
                  <el-table-column type="index" :index="indexMethod" />
                  <el-table-column prop="name" label="Name" min-width="120" />
                  <el-table-column prop="timing" label="timing" />
                  <el-table-column prop="manipulation" label="manipulation" width="120" />
                  <el-table-column prop="statement" label="statement" />
                  <el-table-column prop="creatAt" label="creatAt" width="150" />
                </el-table>
              </el-col>
            </el-row>
          </div>

        </template>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { reactive, computed } from 'vue'
import {  useRoute } from 'vue-router'
import { getOneByProjectId, syncByProjectId, getVersionByProjectId } from '@/api/Document'
import { ElMessage } from 'element-plus'

export default {
  setup() {

    const route = useRoute()
    const state = reactive({
      databaseDocument: null,
      databaseDocumentVersions: [],
      databaseDocumentFilter: {
        version: null
      },
      init: false,
      buttonLoading: {
        handleSync: false,
      },
      projectId: null,
      groupId: null
    })

    state.projectId = route.params.projectId
    state.groupId = route.params.groupId
    const isShowNoDataPage = computed(() => !state.databaseDocument && state.init)
    const isShowLoadingPage = computed(() => !state.databaseDocument && !state.init)

    const messageNotify = (type, msg) => {
      ElMessage({
            showClose: true,
            message: msg,
            type: type,
            duration: 3 * 1000
        });
    }

    const fetchDatabaseMetaData = async () => {
      // fetch version
      const versionResp = await getVersionByProjectId(route.params.projectId)
      state.databaseDocumentVersions = versionResp.data.content

      // fetch meta
      const resp = await getOneByProjectId(route.params.projectId)
      if (resp.errCode) {
        messageNotify('error', '同步失败：'+resp.errMessage)
      } else if (resp.data) {
        state.databaseDocument = resp.data
      } else {
        messageNotify('warn', '无可用数据')
      }
      state.init = true
    }

    const fetchDatabaseMetaDataByCondition = async () => {
      const resp =  await getOneByProjectId(route.params.projectId, state.databaseDocumentFilter)
      if (resp.data) {
        state.databaseDocument = resp.data
        messageNotify('success', '切换成功')
      } else {
        messageNotify('warn', '无可用数据')
      }
    }

    const columnTypeFormat = (column) => {
      if (column.decimalDigits == null) {
        return column.type + '('+column.size+')' 
      } else {
        return column.type + '('+column.size+', '+column.decimalDigits+')'
      }
    }

    const handleSync = () => {
      const projectId = route.params.projectId
      state.buttonLoading.handleSync = true
      syncByProjectId(projectId).then(resp => {
        if (!resp.errCode) {
          fetchDatabaseMetaData()
          messageNotify('success', '同步成功')
        }
        state.buttonLoading.handleSync = false
      })
      .catch(() => state.buttonLoading.handleSync = false)
    }

    const handleVersionFilter = fetchDatabaseMetaDataByCondition

    fetchDatabaseMetaData()
    return {
      state,
      isShowNoDataPage,
      isShowLoadingPage,
      columnTypeFormat,
      handleVersionFilter,
      handleSync
    }
  }
}

</script>