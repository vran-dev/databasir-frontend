<template>
  <!-- task list -->
  <el-card id="task-list" v-if="projectTaskData.showTaskList && projectTaskData.tasks.length > 0" style="position:fixed;right: 20px !important; top: 80px !important;width:300px;z-index:1000;">
    <template #header>
      <div class="card-header">
        <!-- <el-link icon="List" style="color:#303133" underline="false">任务列表</el-link> -->
        <el-link icon="List" :underline="false">任务列表</el-link>
        <el-button icon="Close" text @click="projectTaskData.showTaskList = false" style="color:#303133;"></el-button>
      </div>
    </template>
    <div 
        v-for="task in projectTaskData.tasks" 
        :key="task.taskId">
        #{{ task.taskId }} <span v-if="task.runAt">| <span style="font-size:12px;">开始于：{{ task.runAt }}</span></span>
        <el-progress :percentage="task.status == 'NEW' ? 0 : 100" 
            :indeterminate="task.status == 'NEW' || task.status == 'RUNNING'"
            style="width: 100%" 
            :status="taskStatusToProgressStatus(task)">
            <el-tooltip content="点击刷新文档" v-if="task.status == 'FINISHED'">
                <el-button 
                  text
                  icon="RefreshRight" 
                  style="color:#67C23A"
                  @click="onClickTaskProgress(task)">
                  已完成
                </el-button>
            </el-tooltip>
            <el-tooltip :content="task.result" v-else-if="task.status == 'FAILED'">
                <el-button 
                  text 
                  icon="WarningFilled" 
                  style="color:#F56C6C"
                  @click="onClickTaskProgress(task)">
                  已失败
                </el-button>
            </el-tooltip>
            <el-tooltip :content="task.result" v-else-if="task.status == 'CANCELED'">
                <el-button 
                  text
                  icon="WarningFilled" 
                  style="color:#E6A23C"
                  @click="onClickTaskProgress(task)">
                  已取消
                </el-button>
            </el-tooltip>
            <el-tooltip content="点击取消同步" v-else-if="task.status == 'NEW'">
                <el-button 
                  text
                  icon="CircleCloseFilled" 
                  @click="onClickTaskProgress(task)"
                  style="color:#303133">
                  等待中
                </el-button>
            </el-tooltip>
            <el-tooltip content="点击取消同步" v-else>
                <el-button 
                  text
                  icon="CircleCloseFilled" 
                  @click="onClickTaskProgress(task)">
                  同步中
                </el-button>
            </el-tooltip>
        </el-progress>
    </div>
  </el-card>

  <template v-if="isShowNoDataPage">
      <el-empty description="似乎还没有同步过文档" >
        <el-button-group>
          <el-button 
            type="success" 
            icon="Refresh" 
            @click="onSyncProjectDocument"
            :loading="loadings.handleSync">
            同步
          </el-button>
          <el-button v-if="projectTaskData.tasks.length > 0" type="success" icon="List" @click="projectTaskData.showTaskList = !projectTaskData.showTaskList">
            {{ projectTaskData.tasks.length }}
          </el-button>
        </el-button-group>
      </el-empty>
  </template>
  <template v-else-if="isShowLoadingPage">
    <el-skeleton v-loading="!loadings.init" :rows="12" />
  </template>
  <template  v-else>
    <el-container >
      <el-aside>
          <el-space direction="vertical" :size="26" alignment="left" class="doc-toc-aside" style="width: 300px;">
            <el-switch 
            v-model="tocData.isMultiSelectionMode" 
            active-text="多选模式" 
            inactive-text="单选模式" 
            @change="onMultiSelectionModeChange"
            :loading="loadings.multiSelectionModeChanging"/>

            <el-input
              v-model="searchTableText"
              placeholder="输入表名、注释、描述进行搜索"
              class="search-input"
            >
              <template #suffix v-if="documentDiffData.diffModeEnabled">
                  <el-icon><Search /></el-icon>
              </template>
              <template #prefix v-if="documentDiffData.diffModeEnabled && projectData.documentFilter.version != documentDiffData.originalVersion && documentDiffData.originalVersion != null">
                <el-dropdown>
                  <span >
                    <el-icon>
                      <arrow-down />
                    </el-icon>
                  </span>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item>
                        <el-checkbox v-model="searchFilter.filterAdded" true-label=1 false-label=0 label="新增" size="small" @change="onSearchFilterChange"/>
                      </el-dropdown-item>
                      <el-dropdown-item>
                        <el-checkbox v-model="searchFilter.filterRemoved" true-label=1 false-label=0 label="删除" size="small"  @change="onSearchFilterChange"/>
                      </el-dropdown-item>
                      <el-dropdown-item>
                        <el-checkbox v-model="searchFilter.filterModified" true-label=1 false-label=0 label="修改" size="small"  @change="onSearchFilterChange"/>
                      </el-dropdown-item>
                      <el-dropdown-item>
                        <el-checkbox v-model="searchFilter.filterNone" true-label=1 false-label=0 label="无变化" size="small"  @change="onSearchFilterChange"/>
                      </el-dropdown-item>
                      <el-dropdown-item divided @click="resetSearchFilter">
                        <span style="font-size: 12px;">重置</span>
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </template>
              <template #prefix v-else>
                  <el-icon><Search /></el-icon>
              </template>
            </el-input>
            
            <div id="toc-tree-wrapper">
            <el-tree-v2
              ref="treeRef"
              :data="tocData.value" 
              :show-checkbox="tocData.isMultiSelectionMode"
              :default-expanded-keys="[-1]"
              node-key="id" 
              highlight-current
              @node-click="onTocNodeClick" 
              @check-change="onTocNodeCheckChange" 
              :current-node-key="tocData.currentTocNodeKey"
              :filter-method="searchTables"
              :height="tocTreeHeight"
            >
              <template #default="{ data }">
                <span class="span-ellipsis" >
                  <el-tooltip :content='data.comment && data.comment != "" ? data.name + " /*"+data.comment+"*/":data.name' effect="light">
                    <span>
                      <span v-if="documentDiffData.diffModeEnabled && data.diffType == 'ADDED'" style="color:#67C23A">
                        {{ data.name }}
                        <span  style="color: #95d475;">
                          {{ tocItemComment(data) }}
                        </span>
                      </span>
                      <span v-else-if="documentDiffData.diffModeEnabled && data.diffType == 'MODIFIED'" style="color: #E6A23C">
                        {{ data.name }}
                        <span  style="color: #f3d19e;">
                          {{ tocItemComment(data) }}
                        </span>
                      </span>
                      <span v-else-if="documentDiffData.diffModeEnabled && data.diffType == 'REMOVED'" style="color: #F56C6C">
                        {{ data.name }}
                        <span  style="color: #fab6b6;">
                          {{ tocItemComment(data) }}
                        </span>
                      </span>
                      <span v-else>
                        {{ data.name }}
                        <span  style="color: #b1b3b8;">
                          {{ tocItemComment(data) }}
                        </span>
                      </span>
                      
                    </span>
                  </el-tooltip>
                </span>
              </template>
            </el-tree-v2>
            </div>
          </el-space>
      </el-aside>
      <el-container>
        <el-header>
          <div>
            <el-space :size="28" style="margin-bottom: 33px;">
            <el-button-group>
              <el-button 
                type="success" 
                icon="Refresh" 
                @click="onSyncProjectDocument"
                :loading="loadings.handleSync">
                同步
              </el-button>
              <el-button v-if="projectTaskData.tasks.length > 0" type="success" icon="List" @click="projectTaskData.showTaskList = !projectTaskData.showTaskList">
                {{ projectTaskData.tasks.length }}
              </el-button>
            </el-button-group>
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
                    <el-dropdown-item v-for="(fileType, index) in fileTypes" :key="index" @click="onFileExport(fileType.type, fileType.fileExtension)">
                      {{ fileType.name }}
                    </el-dropdown-item>
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
              :before-change="beforeDiffModeChange"
              v-if="activeTab == 'tableDocument'" 
              active-text="显示版本差异"/>
            </el-space>
          </div>
        </el-header>
        <el-main>
          <el-tabs model-value="tableDocument" @tab-click="onTabClick">
            <!-- multi list documentation -->
            <el-tab-pane label="文档" name="tableDocument">
              <DocumentList 
                :tablesData="documentData.tables"
                :overviewData="documentData.overview"
                :diffEnabled="documentDiffData.diffModeEnabled"
                :docVersion="projectData.documentFilter.version"
                @onRemark="showDiscussionDrawer"/>
                <el-backtop :right="100" :bottom="100"/>
            </el-tab-pane>

            <!-- model UML -->
            <el-tab-pane label="UML" name="umlPanel" style="width: 100%;" :lazy="true">
              <el-row>
                <el-col :span="5">
                  <el-switch v-model="umlData.showComment" active-text="显示注释" inactive-text="隐藏注释"/>
                </el-col>
              </el-row>
              <diagram 
                :model-data="umlData.tables" 
                :show-comment="umlData.showComment"
                ref="umlDiagramComponentRef" />
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
  overflow-y: hidden;
  scrollbar-width: thin;
}

.search-input {
    border-width: 0 0 0px 0;
    border-style: solid;
    min-height: 33px;
    margin-right: 10px;
}

.search-input > div{
    box-shadow: none;
}

.search-input::placeholder {
    color: rgba(180, 180, 180, 0.808);
}

.search-input:focus > div {
    outline: none;
    border-width: 0 0 1px 0;
    transition: 0.5s ease-in;
    box-shadow:  0 0 0 1px var(--el-input-border-color,var(--el-border-color)) inset;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

<script>
import { reactive, computed, ref, watch, onBeforeUnmount, nextTick } from 'vue'
import {  useRoute } from 'vue-router'
import { getSimpleOneByProjectId, syncByProjectId, getVersionByProjectId, exportDocument, getTables, supportFileTypes } from '@/api/Document'
import { listProjectManualTasks, cancelProjectTask } from '@/api/Project'
import { ElMessage, ElNotification } from 'element-plus'
import axios from '@/utils/fetch'
import Diagram from '../components/document/Diagram.vue'
import DocumentDiscussion from '../components/document/DocumentDiscussion.vue'
import DocumentList from '../components/document/DocumentList.vue'

export default {
  components: {
    Diagram,
    DocumentDiscussion,
    DocumentList,
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
      projectName: null,
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

    const fileTypes = ref([])
    supportFileTypes().then(resp => {
      if (!resp.errCode) {
        fileTypes.value = resp.data
      }
    })

    // toc
    const tocData = reactive({
      value: [{id: -1, name: '概览'}],
      lastCheckedKeys: [],
      treeProps: {
        children: 'children',
        label: 'name',
      },
      isMultiSelectionMode: false,
      currentTocNodeKey: route.query.tableDocumentId ? parseInt(route.query.tableDocumentId) : -1,
    })
    const treeRef = ref()
    const searchTableText = ref('')
    const searchFilter = reactive({
      filterAdded: 0,
      filterRemoved: 0,
      filterModified: 0,
      filterNone: 0
    })
    watch(searchTableText, (val) => {
      treeRef.value.filter(val)
    })

    const diffTypeMap = new Map([['ADDED', 0], ['REMOVED', 1], ['MODIFIED', 2], ['NONE', 3]])
    const resetSearchFilter = () => {
      searchFilter.filterAdded = 0
      searchFilter.filterRemoved = 0
      searchFilter.filterModified = 0
      searchFilter.filterNone = 0
      treeRef.value.filter(searchTableText.value)
    }
    const onSearchFilterChange = () => {
      treeRef.value.filter(searchTableText.value)
    }
    const searchTables = (value, data) => {
      const filterBitmap = [searchFilter.filterAdded, searchFilter.filterRemoved, searchFilter.filterModified, searchFilter.filterNone]
      const ignoreFilter = filterBitmap.every(item => item == 0)
      if (documentDiffData.diffModeEnabled && !ignoreFilter && data.diffType) {
        const bitPosition = diffTypeMap.get(data.diffType)
        if (filterBitmap[bitPosition] != 1) {
          return false
        }
      }
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
    const tocItemComment = (data) => {
      if (data.comment && data.comment != '') {
        return '/*'+data.comment+'*/'
      }
      if (data.description && data.description != '') {
        return '/*'+data.description+'*/'
      }
      return ""
    }

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
      // 为了避免超时，将 id 分为多个组进行查询，每个组的数据量为 100
      let multiArray = []
      let currArray = []
      for (var i = 0; i< tableIds.length; i++) {
        if (i != 0 && i % 100 == 0) {
          multiArray.push(currArray)
          currArray = []
        }
        currArray.push(tableIds[i])
        if (i == (tableIds.length - 1)) {
          multiArray.push(currArray)
        }
      }
      const requestArray = multiArray.map(ids => getTables(route.params.projectId, documentId, {
        tableIds: ids,
        currentVersion: projectData.documentFilter.version,
        originalVersion: documentDiffData.originalVersion
      }))
      axios.all(requestArray).then(axios.spread((...res) => {
        const data = res.flatMap(item => item.data)
        callback(data)
      }))
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

    const onTocNodeCheckChange = (node, selected) => {
      const checkedNodes = treeRef.value.getCheckedKeys()
      tocData.lastCheckedKeys = checkedNodes
      // element 的 tree 结构中，父级全选，那么对应子级事件也会一个过来，所以这里判断父级已被选中了的话，就直接 return
      if (checkedNodes.some(id => id == -1)) {
        if (node.id == -1 && selected) {
          fetchDocumentTables(checkedNodes, data => {
            if (!documentData.overview) {
              documentData.overview = projectData.simpleDocumentData
            }
            documentData.tables = data
            umlData.tables = data
          })
        }
        return
      }

      // 父级反选以后，那么就相当于全部取消了
      if (node.id == -1 && !selected && checkedNodes.length == 0) {
        documentData.tables = []
        umlData.tables = []
        return
      }

      // 父级反选以后，子级的取消事件也会一个一个过来，需要忽略
      if (!selected && (checkedNodes.length == 0 )) {
        return
      }

      if (selected) {
        // 单个选中
        fetchDocumentTables(checkedNodes, data => {
          if (!documentData.overview) {
            documentData.overview = projectData.simpleDocumentData
          }
          documentData.tables = data
          umlData.tables = data
        })
      } else {
        // 单个反选
        documentData.tables = documentData.tables.filter(item => item.id != node.id)
        umlData.tables = umlData.tables.filter(item => item.id != node.id)
      }
    }

    const tocTreeHeight = ref(300)
    const initPageData = async () => {
      // init version data
      const versionResp = await getVersionByProjectId(route.params.projectId)
      versionData.versions = versionResp.data.content
      versionData.totalPage = versionResp.data.totalPages

      // get simple document
      const documentResp = await getSimpleOneByProjectId(route.params.projectId, {
        version: projectData.documentFilter.version,
        originalVersion: documentDiffData.originalVersion
      })
      if (documentResp.errCode) {
        messageNotify('error', '同步失败：'+documentResp.errMessage)
      } else if (documentResp.data) {
        // init project data
        projectData.simpleDocumentData = documentResp.data
        projectData.groupId = route.params.groupId
        projectData.projectId = route.params.projectId
        projectData.projectName = documentResp.data.projectName

        // init toc data
        if (tocData.isMultiSelectionMode) {
          multiSelectMode(documentResp)
        } else {
          singleSelectMode(documentResp)
        }
        
        nextTick(() => {
          const ele = document.getElementById("toc-tree-wrapper")
          if (ele) {
            const eleClientRect = ele.getBoundingClientRect()
            const innerHeight = window.innerHeight
            tocTreeHeight.value =  innerHeight - eleClientRect.y - 60
          }
          if (route.query.tableDocumentId) {
            const tableDocumentId = parseInt(route.query.tableDocumentId)
            onTocNodeClick({ id: tableDocumentId })
          }
        })
      } else {
        messageNotify('warn', '无可用数据')
      }
      loadings.init = true
    }

    const singleSelectMode = (documentResp) => {
      tocData.value = documentResp.data.tables
      tocData.value.unshift({ id: -1, name: '概览'})

      documentData.overview = documentResp.data
      documentData.tables = []
    }

    const multiSelectMode = (documentResp) => {
      const tablesList = documentResp.data.tables
      tocData.value = [{id: -1, name: projectData.projectName, children: tablesList }]
      // 根据名称恢复用户已选择的节点
      const checkedNames = new Set(treeRef.value.getCheckedNodes().map(item => item.name))
      let checkedKeys = tocData.value.length > 0 ? tocData.value[0].children.filter(item => checkedNames.has(item.name)).map(item => item.id ) : []
      if (!checkedKeys.some(key => key == -1)) {
        checkedKeys.push(-1)
      }
      tocData.lastCheckedKeys = checkedKeys
      fetchDocumentTables(checkedKeys, data => {
        if (checkedKeys.some(key => key == -1)) {
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
        fetchDocumentTables(tocData.lastCheckedKeys, data => {
          if (documentData.overview == null) {
            documentData.overview = projectData.simpleDocumentData
          }
          documentData.tables = data
          umlData.tables = data
          // switch toc tree
          const tablesList = tocData.value.filter(item => item.id != -1)
          tocData.value = [{id: -1, name: projectData.projectName, children: tablesList }]
          loadings.multiSelectionModeChanging = false
        })
      } else {
        const curr = treeRef.value.getCurrentNode()
        if (curr == null) {
          onTocNodeClick({id: -1})
        } else {
          onTocNodeClick(curr)
        }
        tocData.value = tocData.value.length > 0 && tocData.value[0].children? tocData.value[0].children : []
        tocData.value.unshift({ id: -1, name: '概览'})
        loadings.multiSelectionModeChanging = false
      }
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
      if (projectData.documentFilter.version == '') {
        projectData.documentFilter.version = null
      }
      initPageData()
      messageNotify('success', '切换成功')
      loadings.loadingVersions = false
    }

    const onFileExport = (type, fileExtension) => {
      const projectId = route.params.projectId
      loadings.export = true
      const name = projectData.simpleDocumentData.databaseName +"." +fileExtension
      const checkedTables = treeRef.value.getCheckedKeys()
      let tableIds;
      if (checkedTables && checkedTables.length > 0) {
        tableIds = checkedTables.reduce((a, b) => a + ',' + b)
      } else {
        tableIds = null
      }
      exportDocument(projectId, {
        version: projectData.documentFilter.version,
        fileType: type,
        tableIds: tableIds
      }, name, () => loadings.export = false)
    }

    const umlDiagramComponentRef = ref()
    const onUmlExport = (type) => {
      if (!umlDiagramComponentRef.value) {
        ElMessage({
          message:"请先切换到 UML 标签页面",
          type:"warning",
          group: true,
        })
        return;
      }
      umlDiagramComponentRef.value.exportUml(type)
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
      originalVersion: null
    })

    const clearDocumentDiffData = () => {
      // TODO
      if (documentData.overview) {
        documentData.overview.diffType = 'NONE'
      }
      documentDiffData.originalVersion = null
      resetSearchFilter()
    }

    const beforeDiffModeChange = () => {
      return new Promise((resolve) => {
        if(documentDiffData.diffModeEnabled) {
          clearDocumentDiffData()
          documentDiffData.originalVersion = null
          documentDiffData.diffModeEnabled = false
          onProjectDocumentCompareVersionChange()
        } else {
          documentDiffData.diffModeEnabled = true
          resolve();
        }
      })
    }

    const onProjectDocumentCompareVersionChange = () => {
      if (!documentDiffData.originalVersion) {
        clearDocumentDiffData()
      } 
      onProjectDocumentVersionChange()
    }

    // project task status
    const projectTaskData = reactive({
      showTaskList: true,
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
          projectTaskData.showTaskList = true
          messageNotify('success', '后台同步任务创建成功')
        }
        loadings.handleSync = false
      })
      .catch(() => loadings.handleSync = false)
    }

    const onClickTaskProgress = (task) => {
      if (task.status == 'NEW' || task.status == 'RUNNING') {
        cancelProjectTask(projectData.projectId, task.taskId).then(resp => {
            if (!resp.errCode) {
                task.status = 'CANCELED'
                ElMessage({
                    message: "取消成功",
                    type: "success"
                })
            }
        })
        return;
      }
      if (task.status == 'FAILED' || task.status == 'CANCELED') {
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
      const position = projectTaskData.showTaskList ? 'bottom-right':'top-right'
      ElNotification({
          grouping: true,
          type: 'success',
          title: '刷新成功',
          message: '文档已更新为最新内容',
          position: position,
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
                const position = projectTaskData.showTaskList ? 'bottom-right':'top-right'
                const remoteTask = taskStatusMap.get(task.taskId)
                task.runAt = remoteTask.runAt
                if (task.status != 'FINISHED' && remoteTask.status == 'FINISHED') {
                  task.status = remoteTask.status
                  task.result = remoteTask.result
                  if (!projectData.simpleDocumentData) {
                    initPageData()
                  } else {
                    ElNotification({
                      grouping: true,
                      type: 'success',
                      title: '文档同步成功',
                      message: '同步任务已执行完成，点击即可刷新文档内容',
                      position: position,
                      onClick: refreshDataFromNotification
                    })
                  }
                }

                if(task.status != 'FAILED' && remoteTask.status == 'FAILED') {
                  task.status = remoteTask.status
                  task.result = remoteTask.result
                  ElNotification({
                      grouping: true,
                      type: 'error',
                      title: '文档同步失败',
                      message: '错误：' + remoteTask.result,
                      position: position
                  })
                }
                
                task.status  = remoteTask.status
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

    const taskStatusToProgressStatus = (task) => {
        if (task.status == 'NEW') {
            return ''
        } else if (task.status == 'RUNNING') {
            return ''
        } else if (task.status == 'CANCELED') {
            return 'warning'
        } else if (task.status == 'FAILED') {
            return 'exception'
        } else if (task.status == 'FINISHED') {
            return 'success'
        }
    }

    onBeforeUnmount(() => {
      clearInterval(pollTaskStatusTimer)
      clearInterval(pollNewOrRunningTaskTimer)
    })
    
    return {
      tocData,
      fileTypes,
      tocItemComment,
      documentData,
      projectData,
      versionData,
      umlData,
      loadings,
      isShowNoDataPage,
      isShowLoadingPage,
      treeRef,
      umlDiagramComponentRef,
      tocTreeHeight,
      onTocNodeClick,
      onTocNodeCheckChange,
      onMultiSelectionModeChange,
      loadMoreDocumentVersions,
      onProjectDocumentVersionChange,
      onSyncProjectDocument,
      onFileExport,
      onUmlExport,
      documentDiscussionData,
      showDiscussionDrawer,
      activeTab,
      onTabClick,
      documentDiffData,
      beforeDiffModeChange,
      onProjectDocumentCompareVersionChange,
      searchTables,
      searchTableText,
      onSearchFilterChange,
      resetSearchFilter,
      searchFilter,
      projectTaskData,
      onClickTaskProgress,
      taskStatusToProgressStatus,
    }
  }
}

</script>