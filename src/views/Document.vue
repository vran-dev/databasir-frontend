<template>
  <div v-if="isShowNoDataPage">
      <el-empty description="似乎还没有同步过文档" >
          <el-button type="primary" icon='refresh' round size='large' @click="onSyncProjectDocument" :loading="state.loadings.handleSync">同步</el-button>
      </el-empty>
  </div>
  <div v-else-if="isShowLoadingPage">
    <el-skeleton v-loading="!state.init" :rows="12" />
  </div>
  <div v-else>
    <el-container class="document-container">
      <el-header>
          <el-row :gutter="20">
            <el-col :span="2" v-require-roles="['SYS_OWNER', 'GROUP_OWNER?groupId='+state.groupId, 'GROUP_MEMBER?groupId='+state.groupId]">
              <el-button type="success" style="width:100%" icon="Refresh" @click="onSyncProjectDocument" :loading="state.loadings.handleSync">同步</el-button>
            </el-col>
            <el-col :span="2" v-require-roles="['SYS_OWNER', 'GROUP_OWNER?groupId='+state.groupId, 'GROUP_MEMBER?groupId='+state.groupId]">
                <el-button type="primary" style="width:100%" icon="Download" @click="onDocumentExport()" :loading="state.loadings.export">导出</el-button>
            </el-col>
            <el-col :span="4">
                <el-select @change="onProjectDocumentVersionChange" v-model="state.databaseDocumentFilter.version" placeholder="历史版本" v-select-more="loadMoreDocumentVersions" v-loading="state.loadings.loadingVersions" clearable>
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
      
      <el-main class="document-content-wrapper">
        
        <div class="document-content">
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
            <h2 :id="state.databaseDocument.databaseName + '.overview'">Overview</h2>
          </el-col>
        </el-row>
        <el-row>
          <el-col>
            <el-table :data="state.databaseDocument.tables"  border stripe width='80%'>
              <el-table-column type="index" />
              <el-table-column prop="name" label="Name" min-width="160" resizable />
              <el-table-column prop="type" label="Type" width="200"  resizable />
              <el-table-column prop="comment" label="comment" min-width="160" resizable />
              <el-table-column prop="remark" label="remark" min-width="120" resizable >
                <template v-slot="scope">
                    <el-button @click="showRemarkDrawer(scope.row.name)" size="small" :icon="Edit"></el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-col>
        </el-row>

        <!-- table details -->
        <template v-for="tableMeta in state.databaseDocument.tables" :key="tableMeta">
          <el-row>
            <el-col>
              <h2 :id="state.databaseDocument.databaseName + '.' + tableMeta.name">{{ tableMeta.name }}</h2>
            </el-col>
          </el-row>
          
          <el-row>
            <el-col v-if="tableMeta.columns.length > 0">
              <h3>Columns</h3>
            </el-col>
          </el-row>
          <el-row>
            <el-col >
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
                <el-table-column prop="remark" label="remark" min-width="100" resizable fixed="right">
                  <template v-slot="scope">
                      <el-button @click="showRemarkDrawer(tableMeta.name, scope.row.name)" size="small" :icon="Edit"></el-button>
                  </template>
                </el-table-column>
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
                <el-table :data="tableMeta.triggers" stripe fit border width='80%'>
                  <el-table-column type="index" />
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
        </div>
        <div class="toc-wrapper">
          <div class="toc">
            <ul>
              <li v-for="(item, index) in state.toc" :key="index">
                <el-link :underline="false" @click="onClickToc(state.databaseDocument.databaseName +'.'+ item.name)">
                  {{ item.name }}
                </el-link>
                <ul>
                  <li v-for="(childItem, childIndex) in item.child" :key="index+'-'+childIndex"><el-link :underline="false">{{ childItem.name }}</el-link></li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
        <el-tooltip
          content="回到顶部"
          placement="top"
        >
          <el-backtop :bottom="100"></el-backtop>
        </el-tooltip>

        <!-- remarks -->
        <el-drawer
          v-model="remarkData.isShowDrawer"
          title="更多"
          size="50%"
        >

          <el-row v-for="(remark, index) in remarkData.pageData.content" :key="index">
            <el-col>
              <el-card shadow="never" class="remark-card"> 
                <template #header>
                <div class="remark-header">
                  <span>
                    <span class="remark-user">{{remark.remarkBy.nickname}}</span>  
                    <span class="remark-time">{{remark.createAt}}</span>
                  </span>
                  <span v-require-roles="['SYS_OWNER', 'GROUP_OWNER?groupId='+state.groupId, 'GROUP_MEMBER?groupId='+state.groupId]">
<el-popconfirm
                    confirm-button-text="确定"
                    cancel-button-text="取消"
                    icon="InfoFilled"
                    icon-color="red"
                    title="确定要删除该记录吗？"
                    @confirm="onDeleteRemark(remark.id)"
                    
                    >
                      <template #reference>
                        <el-button type="danger" :icon="Delete" circle plain size="small"></el-button>
                      </template>
                    </el-popconfirm>
                  </span>
                    
                  
                </div>
                </template>
                  <div class="item text remark-content">
                    {{ remark.remark }}
                  </div>
              </el-card>
            </el-col>
          </el-row>
          <el-row v-if="remarkData.pageData.content.length == 0">
            <el-col>
              <el-empty></el-empty>
            </el-col>
          </el-row>

          <el-row>
            <el-col>
              <el-pagination layout="prev, pager, next" 
                :hide-on-single-page="false"
                :currentPage="remarkData.pageData.page" 
                :page-size="remarkData.pageData.size" 
                :page-count="remarkData.pageData.totalPages"
                @current-change="onRemarkPageChange">
              </el-pagination>
            </el-col>
          </el-row>
          <el-divider></el-divider>
          <el-row v-require-roles="['SYS_OWNER', 'GROUP_OWNER?groupId='+state.groupId, 'GROUP_MEMBER?groupId='+state.groupId]">
            <el-col>
              <el-input
                v-model="remarkData.formData.remark"
                :rows="5"
                type="textarea" 
                placeholder="请输入内容"
              />
            </el-col>
          </el-row>
          <el-divider></el-divider>

          <el-row v-require-roles="['SYS_OWNER', 'GROUP_OWNER?groupId='+state.groupId, 'GROUP_MEMBER?groupId='+state.groupId]">
            <el-col>
              <el-button @click="onCreateRemark">提交</el-button>
            </el-col>
          </el-row>
        </el-drawer>
      </el-main>
    </el-container>
  </div>
</template>

<style>

.remark-card {
  margin-bottom: 30px;
}

.remark-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.remark-header .remark-user {
  color: rgb(109, 109, 109);
}

.remark-header .remark-time {
  color: rgb(109, 109, 109);
  font-size: 0.8rem;
  margin-left: 10px;
}


.remark-content {
  white-space: pre-wrap;
  text-align: left;
}

.text {
  font-size: 14px;
  line-height: 1.3rem;
}

.item {
  margin-top: 10px;
  margin-right: 40px;
}

.toc-wrapper {
  right:0;
  top: 60;
  z-index: 0;
  bottom: auto;
  padding-left: 33px;
  margin-left: 10px;
}

.toc {
  top: 130px;
  position: fixed;
  margin-left: 0;
  transform: scale(1, 1);
  bottom:0;
  position:fixed;
  overflow-y:hidden;
  overflow-x:hidden;
}

.toc:hover {
  overflow-y: auto;
}

.toc-wrapper .toc ul {
    list-style: none;
    line-height: 1.7;
    inline-size: 200px;
    overflow-wrap: break-word;
}

.toc-wrapper .toc a {
    display: inherit;
}

.document-content-wrapper {
  display: flex;
  margin: 0;
  min-width: 1060px;
  max-width: 1260px;
}

.document-content {
  min-width: 1060px;
}


</style>

<script>
import { reactive, computed } from 'vue'
import {  useRoute } from 'vue-router'
import { getOneByProjectId, syncByProjectId, getVersionByProjectId, exportDocument } from '@/api/Document'
import { ElMessage } from 'element-plus'
import { Delete, More, Edit } from '@element-plus/icons'
import { listRemarks, createRemark, deleteRemark } from '@/api/DocumentRemark'

export default {
  setup() {
    const route = useRoute()
    const state = reactive({
      databaseDocumentVersionFilter: {
        page: 0,
        size: 10,
      },
      databaseDocumentVersions: [],
      databaseDocumentVersionTotalPages: 0,
      databaseDocumentFilter: {
        version: null
      },
      databaseDocument: null,
      toc: [],
      init: false,
      loadings: {
        handleSync: false,
        loadingVersions: false,
        export: false,
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
      state.databaseDocumentVersionTotalPages = versionResp.data.totalPages

      // fetch meta
      const resp = await getOneByProjectId(route.params.projectId)
      if (resp.errCode) {
        messageNotify('error', '同步失败：'+resp.errMessage)
      } else if (resp.data) {
        state.databaseDocument = resp.data
        initTocByDocumentData(resp.data)
      } else {
        messageNotify('warn', '无可用数据')
      }
      state.init = true
    }

    const initTocByDocumentData = (data) => {
      const toc = []
      toc.push({ name: 'overview', child: [] })
      data.tables.forEach(item => {
        const child = []
        toc.push({ name: item.name, child: child })
      })
      state.toc = toc
    }

    const onClickToc = (id) => {
      const ele = document.getElementById(id)
      if (ele) {
        var headerOffset = -100;
        var actualTop = ele.offsetTop;
        var current = ele.offsetParent;
          while (current !== null){
          actualTop += current.offsetTop;
          current = current.offsetParent;
        }
        window.scrollTo({
          top: actualTop + headerOffset,
          behavior: "smooth"
        })
      }
    }

    const columnTypeFormat = (column) => {
      if (column.decimalDigits == null) {
        return column.type + '('+column.size+')' 
      } else {
        return column.type + '('+column.size+', '+column.decimalDigits+')'
      }
    }

    const onProjectDocumentVersionChange = async () => {
      state.loadings.loadingVersions = true
      const resp =  await getOneByProjectId(route.params.projectId, state.databaseDocumentFilter)
      if (resp.data) {
        state.databaseDocument = resp.data
        initTocByDocumentData(resp.data)
        messageNotify('success', '切换成功')
      } else {
        messageNotify('warn', '无可用数据')
      }
      state.loadings.loadingVersions = false
    }

    const onSyncProjectDocument = () => {
      const projectId = route.params.projectId
      state.loadings.handleSync = true
      syncByProjectId(projectId)
      .then(resp => {
        if (!resp.errCode) {
          fetchDatabaseMetaData()
          messageNotify('success', '同步成功')
        }
        state.loadings.handleSync = false
      })
      .catch(() => state.loadings.handleSync = false)
    }

    const onDocumentExport = () => {
      const projectId = route.params.projectId
      state.loadings.export = true
      exportDocument(projectId, {
        version: state.databaseDocumentFilter.version
      }, state.databaseDocument.databaseName, () => state.loadings.export = false)
    }

    const loadMoreDocumentVersions = debounce(async () => {
        state.loadings.loadingVersions = true
        if (state.databaseDocumentVersionFilter.page + 1  < state.databaseDocumentVersionTotalPages) {
          state.databaseDocumentVersionFilter.page++
          const versionResp = await  getVersionByProjectId(route.params.projectId, state.databaseDocumentVersionFilter)
          state.databaseDocumentVersionTotalPages = versionResp.data.totalPages
          if (versionResp.data.content.length > 0){
            versionResp.data.content.forEach(element => state.databaseDocumentVersions.push(element))
          }
        }
        state.loadings.loadingVersions = false
    }, 800)

    fetchDatabaseMetaData()

    // 节流
    function debounce(fn, delay) {
      let timer = null
      return function () {
        let context = this
        let args = arguments
        if(timer) {
            clearTimeout(timer)
        }
        timer = setTimeout(function () {
          fn.apply(context, args)
        }, delay)
      }
    }

    // remarks
    const remarkData = reactive({
      isShowDrawer: false,
      formData: {
        remark: null,
      },
      pageFilter: {
        page: 0,
        size: 5,
        tableName: null,
        columnName: null
      },
      pageData: {
        content: [],
        page: 0,
        size: 10,
        totalPages: 0
      },
    })
    const showRemarkDrawer = (tableName, columnName) => {
      remarkData.isShowDrawer = true
      if (tableName) {
        remarkData.pageFilter.tableName = tableName
      } else {
        remarkData.pageFilter.tableName = null
      }
      if(columnName) {
        remarkData.pageFilter.columnName = columnName
      } else {
        remarkData.pageFilter.columnName = null
      }
      const projectId = route.params.projectId
      const groupId = route.params.groupId
      listRemarks(groupId, projectId, remarkData.pageFilter).then(resp => {
        remarkData.pageData = resp.data
        remarkData.pageData.page = resp.data.number + 1
      })
    }

    const onRemarkPageChange = (currentPage) => {
      remarkData.pageFilter.page = currentPage - 1
      const projectId = route.params.projectId
      const groupId = route.params.groupId
      listRemarks(groupId, projectId, remarkData.pageFilter).then(resp => {
        remarkData.pageData = resp.data
        remarkData.pageData.page = resp.data.number + 1
      })
    }

    const onCreateRemark = () => {
      if(!remarkData.formData.remark || remarkData.formData.remark == '') {
        messageNotify('warning', '内容不能为空')
        return
      }
      const projectId = route.params.projectId
      const groupId = route.params.groupId
      const body  = {
        tableName: remarkData.pageFilter.tableName,
        columnName: remarkData.pageFilter.columnName,
        remark: remarkData.formData.remark
      }
      createRemark(groupId, projectId, body).then(resp => {
        if(!resp.errCode) {
          remarkData.formData.remark = null
          messageNotify('success', '提交成功')
          onRemarkPageChange(1)
        }
      })
    }

    const onDeleteRemark = (remarkId) => {
      const projectId = route.params.projectId
      const groupId = route.params.groupId
      deleteRemark(groupId, projectId, remarkId).then(resp => {
        if(!resp.errCode) {
          messageNotify('success', '删除成功')
          onRemarkPageChange(1)
        }
      })
    }

    return {
      Delete,
      More,
      Edit,
      state,
      isShowNoDataPage,
      isShowLoadingPage,
      onClickToc,
      columnTypeFormat,
      loadMoreDocumentVersions,
      onProjectDocumentVersionChange,
      onSyncProjectDocument,
      onDocumentExport,
      remarkData,
      showRemarkDrawer,
      onRemarkPageChange,
      onCreateRemark,
      onDeleteRemark
    }
  }
}

</script>