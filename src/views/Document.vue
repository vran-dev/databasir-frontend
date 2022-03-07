<template>
  <template v-if="isShowNoDataPage">
      <el-empty description="似乎还没有同步过文档" >
          <el-button type="primary" icon='refresh' round size='large' @click="onSyncProjectDocument" :loading="loadings.handleSync">同步</el-button>
      </el-empty>
  </template>
  <template v-else-if="isShowLoadingPage">
    <el-skeleton v-loading="!loadings.init" :rows="12" />
  </template>
  <template  v-else>
    <el-container >
      <el-aside>
          <el-space direction="vertical" :size="26" alignment="left" class="doc-toc-aside">
            <el-switch 
            v-model="tocData.isMultiSelectionMode" 
            active-text="多选模式" 
            inactive-text="单选模式" 
            @change="onMultiSelectionModeChange"
            :loading="loadings.multiSelectionModeChanging"/>
            
              <el-tree 
                ref="treeRef"
                :data="tocData.value" 
                :default-checked-keys="tocData.checkedNodes"
                :show-checkbox="tocData.isMultiSelectionMode"
                node-key="id" 
                highlight-current
                :props="tocData.treeProps"
                @node-click="onTocNodeClick" 
                @check-change="onTocNodeCheckChange" 
              >
                <template #default="{ node }">
                  <span class="span-ellipsis" >
                    <el-tooltip :content='node.comment ? node.label + "("+node.comment+")":node.label' effect="light">
                      <span>{{ node.label }}</span>
                    </el-tooltip>
                  </span>
                </template>
              </el-tree>

          </el-space>
      </el-aside>
      <el-container>
        <el-header>
          <div>
            <el-space :size="28" style="margin-bottom: 33px;">
              <el-button 
                v-require-roles="['SYS_OWNER', 'GROUP_OWNER?groupId='+projectData.groupId, 'GROUP_MEMBER?groupId='+projectData.groupId]"
                type="success" 
                style="width:100%" 
                icon="Refresh" 
                @click="onSyncProjectDocument" 
                :loading="loadings.handleSync">
                同步
              </el-button>
              <el-button 
                v-require-roles="['SYS_OWNER', 'GROUP_OWNER?groupId='+projectData.groupId, 'GROUP_MEMBER?groupId='+projectData.groupId]"
                type="primary" 
                style="width:100%" 
                icon="Download"
                @click="onDocumentExport()" 
                :loading="loadings.export">
                导出
              </el-button>
              <el-select @change="onProjectDocumentVersionChange" v-model="projectData.documentFilter.version" placeholder="历史版本" v-select-more="loadMoreDocumentVersions" v-loading="loadings.loadingVersions" clearable>
                <el-option
                v-for="item in versionData.versions"
                :key="item.version"
                :label="'['+item.createAt +']->'+item.version+''"
                :value="item.version"
                >
                </el-option>
              </el-select>
            </el-space>
          </div>
        </el-header>
        <el-main>
          <el-tabs model-value="tableDocument">
            <!-- multi list documentation -->
            <el-tab-pane label="列表" name="tableDocument">
              <DocumentList 
                :tablesData="documentData.tables"
                :overviewData="documentData.overview"
                @onRemark="showRemarkDrawer"/>
            </el-tab-pane>

            <!-- model UML -->
            <el-tab-pane label="UML" name="umlPanel" style="width: 100%;" :lazy="true">
              <el-row>
                <el-col :span="5">
                  <el-switch v-model="umlData.showComment" active-text="显示注释" inactive-text="隐藏注释"/>
                </el-col>
              </el-row>
              <diagram :model-data="umlData.tables" :show-comment="umlData.showComment"></diagram>
            </el-tab-pane>
          </el-tabs>

          <!-- table / column remark -->
          <document-remark 
            :groupId="documentRemarkData.groupId" 
            :projectId="documentRemarkData.projectId" 
            :tableName="documentRemarkData.tableName" 
            :columnName="documentRemarkData.columnName" 
            :isShowDrawer="documentRemarkData.isShowDrawer"
            @onClose="documentRemarkData.isShowDrawer = false"
          />
        </el-main>
      </el-container>
    </el-container>
  </template>
</template>

<style>

.span-ellipsis {
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 14px;
  flex: 1;
  display: flex;
  align-items: left;
  justify-content: space-between;
  font-size: 14px;
} 

.doc-toc-aside {
  overflow-wrap: break-word;
  text-overflow: ellipsis;
  bottom: 0px;
  top: 100px;
  position: fixed;
  overflow-y: hidden;
  overflow-x: hidden;
  max-width: var(--el-aside-width);
  width: var(--el-aside-width);
  border-width: 0px 1px 0px 0px;
  border-color: #ddd;
  border-style: solid;
}

.doc-toc-aside:hover {
  overflow-y: auto;
  scrollbar-width: thin;
}
</style>

<script>
import { reactive, computed, ref } from 'vue'
import {  useRoute } from 'vue-router'
import { getSimpleOneByProjectId, syncByProjectId, getVersionByProjectId, exportDocument, getTables } from '@/api/Document'
import { ElMessage } from 'element-plus'
import Diagram from '../components/document/Diagram.vue'
import DocumentRemark from '../components/document/DocumentRemark.vue'
import DocumentList from '../components/document/DocumentList.vue'

export default {
  components: {
    Diagram,
    DocumentRemark,
    DocumentList
  },
  setup() {
    const route = useRoute()

    // loading state
    const loadings = reactive({
      handleSync: false,
      loadingVersions: false,
      export: false,
      init: false,
      multiSelectionModeChanging: false,
    })
    // project data
    const projectData = reactive ({
      simpleDocumentData: null,
      documentFilter: {
        version: null
      },
      projectId: route.params.projectId,
      groupId: route.params.groupId,
    })
    // version data
    const versionData = reactive({
      pageFilter: {
        page: 0,
        size: 10
      },
      totalPage: 0,
      versions: []
    })
    // toc
    const tocData = reactive({
      value: [{id: -1, name: '概览'}],
      treeProps: {
        children: 'children',
        label: 'name',
      },
      checkedNodes: [],
      isMultiSelectionMode: false
    })
    // document component
    const documentData = reactive({
      tables: [],
      overview: {}
    })
    // uml component
    const umlData = reactive({
      showComment: false,
      tables: []
    })
    const treeRef = ref()

    const fetchDocumentTables = (tableIds, callback) => {
      let documentId = projectData.simpleDocumentData.id
      getTables(route.params.projectId, documentId, tableIds).then(resp => {
        if (!resp.errCode) {
          callback(resp.data)
        } else {
          messageNotify('warn', '加载数据异常，请稍后再试')
        }
      })
    }

    const onTocNodeClick = (node) => {
      if(tocData.isMultiSelectionMode) {
        console.log('ignore click action when in multi selection mode')
        return
      }

      if (node.id == -1) {
        documentData.overview = projectData.simpleDocumentData
        documentData.tables = []
        umlData.tables = []

      } else {
        fetchDocumentTables([node.id], data => {
          documentData.overview = null
          documentData.tables = data
          umlData.tables = data
        })
      }
    }

    const onTocNodeCheckChange = () => {
      fetchDocumentTables(treeRef.value.getCheckedKeys(), data => {
        if (treeRef.value.getCheckedKeys().some(n => n== -1)) {
          documentData.overview = projectData.simpleDocumentData
        } else {
          documentData.overview = null
        }
        documentData.tables = data
        umlData.tables = data
      })
    }

    const onMultiSelectionModeChange = (val) => {
      loadings.multiSelectionModeChanging = true
      if (val) {
        onTocNodeCheckChange()
      } else {
        const curr = treeRef.value.getCurrentNode()
        if (curr == null) {
          onTocNodeClick({id: -1})
        } else {
          onTocNodeClick(curr)
        }
      }
      loadings.multiSelectionModeChanging = false
    }

    const initPageData = async () => {
      // init version data
      const versionResp = await getVersionByProjectId(route.params.projectId)
      versionData.versions = versionResp.data.content
      versionData.totalPage = versionResp.data.totalPages

      // get simple document
      const documentResp = await getSimpleOneByProjectId(route.params.projectId, projectData.documentFilter)
      if (documentResp.errCode) {
        messageNotify('error', '同步失败：'+documentResp.errMessage)
      } else if (documentResp.data) {
        // init project data
        projectData.simpleDocumentData = documentResp.data
        projectData.groupId = route.params.groupId
        projectData.projectId = route.params.projectId
        // init toc data
        tocData.value = documentResp.data.tables
        tocData.value.unshift({ id: -1, name: '概览'})
        tocData.checkedNodes = tocData.value.map(d => d.id)
        // init document data
        documentData.overview = documentResp.data
        documentData.tables = []
      } else {
        messageNotify('warn', '无可用数据')
      }
      loadings.init = true
    }
    initPageData()

    const isShowNoDataPage = computed(() => !projectData.simpleDocumentData && loadings.init)
    const isShowLoadingPage = computed(() => !projectData.simpleDocumentData && !loadings.init)
    const messageNotify = (type, msg) => {
      ElMessage({
            showClose: true,
            message: msg,
            type: type,
            duration: 3 * 1000
        });
    }

    const onProjectDocumentVersionChange = async () => {
      loadings.loadingVersions = true
      initPageData()
      messageNotify('success', '切换成功')
      loadings.loadingVersions = false
    }

    const onSyncProjectDocument = () => {
      const projectId = route.params.projectId
      loadings.handleSync = true
      syncByProjectId(projectId)
      .then(resp => {
        if (!resp.errCode) {
          initPageData()
          messageNotify('success', '同步成功')
        }
        loadings.handleSync = false
      })
      .catch(() => loadings.handleSync = false)
    }

    const onDocumentExport = () => {
      const projectId = route.params.projectId
      loadings.export = true
      exportDocument(projectId, {
        version: projectData.documentFilter.version
      }, projectData.simpleDocumentData.databaseName, () => loadings.export = false)
    }

    const loadMoreDocumentVersions = debounce(async () => {
        loadings.loadingVersions = true
        if (versionData.pageFilter.page + 1  < versionData.totalPage) {
          versionData.pageFilter.page++
          const versionResp = await  getVersionByProjectId(route.params.projectId, versionData.pageFilter)
          versionData.totalPage = versionResp.data.totalPages
          if (versionResp.data.content.length > 0){
            versionResp.data.content.forEach(element => versionData.versions.push(element))
          }
        }
        loadings.loadingVersions = false
    }, 800)

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

    // Document Remark
    const documentRemarkData = ref({
      tableName: null,
      columnName: null,
      groupId: null,
      projectId: null,
      isShowDrawer: false
    })

    const showRemarkDrawer = (tableName, columnName) => {
      documentRemarkData.value = {
        tableName: tableName,
        columnName: columnName,
        isShowDrawer: true,
        groupId: projectData.groupId,
        projectId: projectData.projectId
      }
    }

    return {
      tocData,
      documentData,
      projectData,
      versionData,
      umlData,
      loadings,
      isShowNoDataPage,
      isShowLoadingPage,
      treeRef,
      onTocNodeClick,
      onTocNodeCheckChange,
      onMultiSelectionModeChange,
      loadMoreDocumentVersions,
      onProjectDocumentVersionChange,
      onSyncProjectDocument,
      onDocumentExport,
      documentRemarkData,
      showRemarkDrawer,
    }
  }
}

</script>