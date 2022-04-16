<template>
  <template v-if="isShowNoDataPage">
      <el-empty description="似乎还没有同步过文档" >
          <document-sync-task-dropdown 
                :projectData="projectData" 
                :projectTaskData="projectTaskData" 
                :loading="loadings.handleSync"
                @onSync="onSyncProjectDocument"
                @onProgressBarClick="onClickTaskProgress"
                />
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

            <input type="text" class="search-input" placeholder="输入表名、注释进行搜索" v-model="searchTableText">

            <el-tree
              ref="treeRef"
              :data="tocData.value" 
              :show-checkbox="tocData.isMultiSelectionMode"
              :default-checked-keys="defaultCheckedKeys"
              node-key="id" 
              highlight-current
              @node-click="onTocNodeClick" 
              @check-change="onTocNodeCheckChange" 
              :filter-node-method="searchTables"
            >
              <template #default="{ data }">
                <span class="span-ellipsis" >
                  <el-tooltip :content='data.comment && data.comment != "" ? data.name + " /*"+data.comment+"*/":data.name' effect="light">
                    <span>{{ data.name }}
                      <span v-if="data.comment && data.comment != ''" style="color:#b1b3b8;">
                        {{ '/*'+data.comment+'*/' }}
                      </span>
                      <span v-else-if="data.description && data.description != ''" style="color: #b1b3b8;">
                        {{ '/*'+data.description+'*/' }}
                      </span>
                    </span>
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
              <document-sync-task-dropdown 
                :projectData="projectData" 
                :projectTaskData="projectTaskData" 
                :loading="loadings.handleSync"
                @onSync="onSyncProjectDocument"
                @onProgressBarClick="onClickTaskProgress"
                />
              <el-dropdown v-require-roles="['SYS_OWNER', 'GROUP_OWNER?groupId='+projectData.groupId, 'GROUP_MEMBER?groupId='+projectData.groupId]">
                <el-button 
                  type="primary" 
                  style="width:100%" 
                  icon="Download"
                  :loading="loadings.export">
                  导出<el-icon style="margin-left:8px"><arrow-down /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="onMarkdownExport()">Markdown</el-dropdown-item>
                    <el-dropdown-item @click="onUmlExport()">UML PNG</el-dropdown-item>
                    <!-- <el-dropdown-item>Excel</el-dropdown-item> -->
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
              
              <el-select @change="onProjectDocumentVersionChange" v-model="projectData.documentFilter.version" placeholder="当前版本" v-select-more="loadMoreDocumentVersions" v-loading="loadings.loadingVersions" clearable>
                <el-option
                v-for="item in versionData.versions"
                :key="item.version"
                :label="'['+item.createAt +']->'+item.version+''"
                :value="item.version"
                >
                </el-option>
              </el-select>
              <el-select 
                v-if="documentDiffData.diffModeEnabled"
                @change="onProjectDocumentCompareVersionChange"
                v-model="documentDiffData.originalVersion" 
                placeholder="对比版本" 
                v-select-more="loadMoreDocumentVersions" 
                v-loading="loadings.loadingVersions" 
                clearable>
                <el-option
                v-for="item in versionData.versions"
                :key="item.version"
                :label="'['+item.createAt +']->'+item.version+''"
                :value="item.version"
                >
                </el-option>
              </el-select>
              <el-switch 
              v-model="documentDiffData.diffModeEnabled" 
              :before-change="onDiffModeChange"
              v-if="activeTab == 'tableDocument'" 
              active-text="显示版本差异"/>
            </el-space>
          </div>
        </el-header>
        <el-main>
          <el-tabs model-value="tableDocument" @tab-click="onTabClick">
            <!-- multi list documentation -->
            <el-tab-pane label="列表" name="tableDocument">
              <DocumentList 
                :tablesData="documentData.tables"
                :overviewData="documentData.overview"
                :overviewDiff="documentDiffData.overviewDiff"
                :tablesDiff="documentDiffData.tablesDiff"
                :diffEnabled="documentDiffData.diffModeEnabled"
                :docVersion="projectData.documentFilter.version"
                @onRemark="showDiscussionDrawer"/>
            </el-tab-pane>

            <!-- model UML -->
            <el-tab-pane label="UML" name="umlPanel" style="width: 100%;" :lazy="true">
              <el-row>
                <el-col :span="5">
                  <el-switch v-model="umlData.showComment" active-text="显示注释" inactive-text="隐藏注释"/>
                </el-col>
              </el-row>
              <diagram :model-data="umlData.tables" :show-comment="umlData.showComment" ref="umlDiagramComponentRef"></diagram>
            </el-tab-pane>
          </el-tabs>

          <!-- table / column discussion -->
          <document-discussion
            :groupId="documentDiscussionData.groupId" 
            :projectId="documentDiscussionData.projectId" 
            :tableName="documentDiscussionData.tableName" 
            :columnName="documentDiscussionData.columnName" 
            :isShowDrawer="documentDiscussionData.isShowDrawer"
            @onClose="documentDiscussionData.isShowDrawer = false"
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
  display: inline-block;
  align-items: left;
  justify-content: space-between;
  font-size: 14px;
  padding: 8px;
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

.search-input {
    border-width: 0 0 1px 0;
    border-style: solid;
    width: 90%;
    min-height: 33px;
}

.search-input::placeholder {
    color: rgba(180, 180, 180, 0.808);
}

.search-input:focus {
    outline: none;
    border-color: #000;
}
</style>

<script>
import { reactive, computed, ref, watch, onBeforeUnmount } from 'vue'
import {  useRoute } from 'vue-router'
import { getSimpleOneByProjectId, syncByProjectId, getVersionByProjectId, exportDocument, getTables, getDiff } from '@/api/Document'
import { listProjectManualTasks } from '@/api/Project'
import { ElMessage, ElNotification  } from 'element-plus'
import Diagram from '../components/document/Diagram.vue'
import DocumentDiscussion from '../components/document/DocumentDiscussion.vue'
import DocumentList from '../components/document/DocumentList.vue'
import DocumentSyncTaskDropdown from '../components/document/DocumentSyncTaskDropdown.vue'

export default {
  components: {
    Diagram,
    DocumentDiscussion,
    DocumentList,
    DocumentSyncTaskDropdown
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
      checkedValue: [{id: -1, name: '概览'}],
      treeProps: {
        children: 'children',
        label: 'name',
      },
      isMultiSelectionMode: false,
    })
    const treeRef = ref()
    const searchTableText = ref('')
    watch(searchTableText, (val) => {
      treeRef.value.filter(val)
    })
    const searchTables = (value, data) => {
      if (!value) return true
      if(data.name.includes(value)) {
        return true;
      }
      if(data.comment && data.comment.includes(value)) {
        return true;
      }
      if (data.description && data.description.includes(value)) {
        return true;
      }
      return false;
    }

    const defaultCheckedKeys = computed(() => tocData.checkedValue.map(item => item.id))
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
    // active tab
    const activeTab = ref("tableDocument")

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
        if (node.id == -1) {
          scrollToElement('overview[-1]')
        } else {
          scrollToElement(node.name+'['+node.id+']')
        }
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

    const scrollToElement = (id) => {
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
        tocData.checkedValue = tocData.value.map(item => { return {id: item.id, name: item.name} })
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
        if (tocData.isMultiSelectionMode) {
          // 根据名称恢复用户已选择的节点
          const checkedNames = new Set(treeRef.value.getCheckedNodes().map(item => item.name))
          const checkedNodes = tocData.value.filter(item => checkedNames.has(item.name)).map(item => { return {id: item.id, name: item.name} })
          tocData.checkedValue = checkedNodes
          fetchDocumentTables(checkedNodes.map(item => item.id), data => {
            if (checkedNodes.some(item => item.id == -1)) {
              documentData.overview = projectData.simpleDocumentData
            } else {
              documentData.overview = null
            }
            documentData.tables = data
            umlData.tables = data
          })
        } else {
          tocData.checkedValue = tocData.value.map(item => { return {id: item.id, name: item.name} })
          // init document data
          documentData.overview = documentResp.data
          documentData.tables = []
        }
        
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

    const onMarkdownExport = () => {
      const projectId = route.params.projectId
      loadings.export = true
      exportDocument(projectId, {
        version: projectData.documentFilter.version,
        fileType: 'MARKDOWN',
      }, projectData.simpleDocumentData.databaseName, () => loadings.export = false)
    }

    const umlDiagramComponentRef = ref(null)
    const onUmlExport = () => {
      umlDiagramComponentRef.value.exportUml()
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
    const documentDiscussionData = ref({
      tableName: null,
      columnName: null,
      groupId: null,
      projectId: null,
      isShowDrawer: false
    })

    const showDiscussionDrawer = (tableName, columnName) => {
      documentDiscussionData.value = {
        tableName: tableName,
        columnName: columnName,
        isShowDrawer: true,
        groupId: projectData.groupId,
        projectId: projectData.projectId
      }
    }

    const onTabClick = (tab) => {
      if (tab) {
        activeTab.value = tab.props.name
      }
    }

    const documentDiffData = reactive({
      diffModeEnabled: false,
      originalVersion: null,
      overviewDiff: {
        diffType: 'NONE',
        tableDiffMap: new Map()
      },
      tablesDiff: {
        diffType: 'NONE',
        tableDiffMap: new Map()
      }
    })

    const clearDocumentDiffData = () => {
      documentDiffData.tablesDiff =  {
        diffType: 'NONE',
        tableDiffMap: new Map()
      }
      documentDiffData.overviewDiff = {
        diffType: 'NONE',
        tableDiffMap: new Map()
      }
    }

    const onDiffModeChange = () => {
      return new Promise((resolve) => {
        if(documentDiffData.diffModeEnabled) {
          clearDocumentDiffData()
          documentDiffData.originalVersion = null
          documentDiffData.diffModeEnabled = false
        } else {
          documentDiffData.diffModeEnabled = true
        }
        resolve();
      })
    }

    const onProjectDocumentCompareVersionChange = () => {
      if (!documentDiffData.originalVersion) {
        clearDocumentDiffData()
        return
      }

      const originalVersion = documentDiffData.originalVersion
      const currentVersion = projectData.documentFilter.version
      getDiff(projectData.projectId, {
        originalVersion: originalVersion,
        currentVersion: currentVersion,
      }).then(resp => {
        if (!resp.errCode) {
          const diffResult = resp.data
          const tablesField = diffResult.fields.find(item => item.fieldName == 'tables')

          // database basic fields
          const overviewDiff = {}
          overviewDiff.diffType = diffResult.diffType
          diffResult.fields.filter(item => item.fieldName != 'tables')
          .forEach(item => {
            Object.defineProperty(overviewDiff, item.fieldName, { value: { diffType: item.diffType} })
          })
          const simpleTableDiffMap = new Map(tablesField.fields.map(item => [item.fieldName, { diffType: item.diffType, original: item.original, current: item.current }]))
          overviewDiff.tableDiffMap = simpleTableDiffMap
          documentDiffData.overviewDiff = overviewDiff

          // tables fields
          const tableDiffMapping = (table) => {
            const colMap = new Map(table.fields.find(f => f.fieldName == 'columns').fields.map(item => [item.fieldName, { diffType: item.diffType, original: item.original, current: item.current }]))
            const idxMap = new Map(table.fields.find(f => f.fieldName == 'indexes').fields.map(item => [item.fieldName, { diffType: item.diffType, original: item.original, current: item.current }]))
            const tgMap = new Map(table.fields.find(f => f.fieldName == 'triggers').fields.map(item => [item.fieldName, { diffType: item.diffType, original: item.original, current: item.current }]))
            const fkMap = new Map(table.fields.find(f => f.fieldName == 'foreignKeys').fields.map(item => [item.fieldName, { diffType: item.diffType, original: item.original, current: item.current }]))
            return {
              diffType: table.diffType,
              name: table.fieldName,
              columnDiffMap: colMap,
              indexDiffMap: idxMap,
              triggerDiffMap: tgMap,
              foreignKeyDiffMap: fkMap,
            }
          }
          const tableDiffMap = new Map(tablesField.fields.map(table => [table.fieldName, tableDiffMapping(table)]))
          documentDiffData.tablesDiff.diffType = tablesField.diffType
          documentDiffData.tablesDiff.tableDiffMap = tableDiffMap
        }
      })
    }

    // project task status
    const projectTaskData = reactive({
      tasks: []
    })

    const onSyncProjectDocument = () => {
      const projectId = route.params.projectId
      loadings.handleSync = true
      syncByProjectId(projectId)
      .then(resp => {
        if (!resp.errCode && resp.data) {
          projectTaskData.tasks.push({
            taskId: resp.data,
            status: 'NEW'
          })
          messageNotify('success', '后台同步任务创建成功')
        }
        loadings.handleSync = false
      })
      .catch(() => loadings.handleSync = false)
    }

    const taskStatusToProgressStatus = (task) => {
      if (task.status == 'NEW') {
        return ''
      } else if (task.status == 'RUNNING') {
        return ''
      } else if (task.status == 'FAILED') {
        return 'exception'
      } else if (task.status == 'FINISHED') {
        return 'success'
      }
    }

    const onClickTaskProgress = (task) => {
      if (task.status == 'NEW' || task.status == 'RUNNING') {
        return;
      }
      if (task.status == 'FAILED') {
        projectTaskData.tasks = projectTaskData.tasks.filter(item => item.taskId != task.taskId)
        return;
      }
      if(task.status == 'FINISHED') {
        refreshDataFromNotification()
        projectTaskData.tasks = projectTaskData.tasks.filter(item => item.taskId != task.taskId)
        return;
      }
    }

    const refreshDataFromNotification = () => {
      initPageData()
      ElNotification({
          grouping: true,
          type: 'success',
          title: '刷新成功',
          message: '文档已更新为最新内容',
      })
    }

    // 每 3 秒查询一次任务状态
    const pollTaskStatusTimer = setInterval(() => {
      const hasNewOrRunning = projectTaskData.tasks.find(item => item.status == 'NEW' || item.status == 'RUNNING') 
      if (projectTaskData.tasks.length > 0 && hasNewOrRunning) {
        const body = {
          taskIdIn: projectTaskData.tasks.map(task => task.taskId)
        }
        listProjectManualTasks(projectData.projectId, body).then(resp => {
          if (!resp.errCode) {
            const taskStatusMap = new Map(resp.data.map(item => [item.taskId, item]))
            projectTaskData.tasks.forEach(task => {
              if (taskStatusMap.has(task.taskId)) {
                const remoteTask = taskStatusMap.get(task.taskId)
                if (task.status != 'FINISHED' && remoteTask.status == 'FINISHED') {
                  ElNotification({
                      grouping: true,
                      type: 'success',
                      title: '文档同步成功',
                      message: '同步任务已执行完成，点击即可刷新文档内容',
                      onClick: refreshDataFromNotification
                  })
                }
                if(task.status != 'FAILED' && remoteTask.status == 'FAILED') {
                  ElNotification({
                      grouping: true,
                      type: 'error',
                      title: '文档同步失败',
                      message: '错误：' + remoteTask.result,
                  })
                }
                task.status = remoteTask.status
                task.result = remoteTask.result
              }
            })
          }
        })
      }
    }, 1000*3);

    // 每 3 秒查询一次运行中的任务
    const pollNewOrRunningTaskTimer = setInterval(() => {
      const body = {
        taskStatusIn: ['NEW', 'RUNNING']
      }
      listProjectManualTasks(projectData.projectId, body).then(resp => {
          if (!resp.errCode) {
            const localTaskIdSet = new Set(projectTaskData.tasks.map(task => task.taskId))
            const newTasks = resp.data.filter(task => !localTaskIdSet.has(task.taskId))
            projectTaskData.tasks.push(...newTasks)
          }
        })
    }, 1000 * 3);

    onBeforeUnmount(() => {
      clearInterval(pollTaskStatusTimer)
      clearInterval(pollNewOrRunningTaskTimer)
    })
    
    return {
      tocData,
      defaultCheckedKeys,
      documentData,
      projectData,
      versionData,
      umlData,
      loadings,
      isShowNoDataPage,
      isShowLoadingPage,
      treeRef,
      umlDiagramComponentRef,
      onTocNodeClick,
      onTocNodeCheckChange,
      onMultiSelectionModeChange,
      loadMoreDocumentVersions,
      onProjectDocumentVersionChange,
      onSyncProjectDocument,
      onMarkdownExport,
      onUmlExport,
      documentDiscussionData,
      showDiscussionDrawer,
      activeTab,
      onTabClick,
      documentDiffData,
      onDiffModeChange,
      onProjectDocumentCompareVersionChange,
      searchTables,
      searchTableText,
      projectTaskData,
      taskStatusToProgressStatus,
      onClickTaskProgress,
    }
  }
}

</script>