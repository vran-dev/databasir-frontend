<template>
    <!-- remarks -->
    <el-drawer
      v-model="show"
      size="50%"
    >
        <template #title>
            <h2>{{ title }}</h2>
        </template>
      <el-row v-for="(remark, index) in pageData.content" :key="index">
        <el-col>
          <el-card shadow="never" class="remark-card"> 
            <template #header>
            <div class="remark-header">
              <span>
                <span class="remark-user">{{remark.remarkBy.nickname}}</span>  
                <span class="remark-time">{{remark.createAt}}</span>
              </span>
              <span v-require-roles="['SYS_OWNER', 'GROUP_OWNER?groupId='+groupId, 'GROUP_MEMBER?groupId='+groupId]">
<el-popconfirm
                confirm-button-text="确定"
                cancel-button-text="取消"
                icon="InfoFilled"
                icon-color="red"
                title="确定要删除该记录吗？"
                @confirm="onDeleteRemark(remark.id)"
                >
                  <template #reference>
                    <el-button type="danger" icon="Delete" circle plain size="small"></el-button>
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
      <el-row v-if="pageData.content.length == 0">
        <el-col>
          <el-empty></el-empty>
        </el-col>
      </el-row>

      <el-row>
        <el-col>
          <el-pagination layout="prev, pager, next" 
            :hide-on-single-page="false"
            :currentPage="pageData.page" 
            :page-size="pageData.size" 
            :page-count="pageData.totalPages"
            @current-change="onRemarkPageChange">
          </el-pagination>
        </el-col>
      </el-row>
      <el-divider></el-divider>
      <el-row v-require-roles="['SYS_OWNER', 'GROUP_OWNER?groupId='+this.groupId, 'GROUP_MEMBER?groupId='+this.groupId]">
        <el-col>
          <el-input
            v-model="formData.remark"
            :rows="5"
            type="textarea" 
            placeholder="请输入内容"
          />
        </el-col>
      </el-row>
      <el-divider></el-divider>

      <el-row v-require-roles="['SYS_OWNER', 'GROUP_OWNER?groupId='+this.groupId, 'GROUP_MEMBER?groupId='+this.groupId]">
        <el-col>
          <el-button @click="onCreateRemark">提交</el-button>
        </el-col>
      </el-row>
    </el-drawer>
</template>

<style>
.text {
  font-size: 14px;
  line-height: 1.3rem;
}

.item {
  margin-top: 10px;
  margin-right: 40px;
}

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

</style>

<script>
import { listRemarks, createRemark, deleteRemark } from '@/api/DocumentRemark'


export default {
    props: ['groupId', 'projectId', 'tableName', 'columnName', 'isShowDrawer'],
    emits: ['onClose'],

    data() {
        return {
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
            show: this.isShowDrawer,
        }
    },

    computed: {
        title() {
            const columnName = this.columnName ? '.'+this.columnName:''
            return "["+this.tableName+columnName+"]"
        }
    },

    watch: {
        'isShowDrawer': {
            deep: false,
            handler(val) {
                if (val) {
                    this.showRemarkDrawer()
                }
            }
        },

        show: {
            deep: false,
            handler(val) {
                if (!val) {
                    this.closeRemarkDrawer(val)
                } else {
                    this.showRemarkDrawer()
                }
            }
        }
    },

    methods: {
        onCreateRemark() {
            if(!this.formData.remark || this.formData.remark == '') {
                this.$message.error('内容不能为空')
                return
            }
            const body  = {
                tableName: this.pageFilter.tableName,
                columnName: this.pageFilter.columnName,
                remark: this.formData.remark
            }
            createRemark(this.groupId, this.projectId, body).then(resp => {
                if(!resp.errCode) {
                    this.formData.remark = null
                    this.$message.success('提交成功')
                    this.onRemarkPageChange(1)
                }
            })
        },
        onDeleteRemark(remarkId) {
            deleteRemark(this.groupId, this.projectId, remarkId).then(resp => {
                if(!resp.errCode) {
                    this.$message.success('删除成功')
                    this.onRemarkPageChange(1)
                }
            })
        },
        onRemarkPageChange(currentPage) {
            this.pageFilter.page = currentPage - 1
            listRemarks(this.groupId, this.projectId, this.pageFilter).then(resp => {
                this.pageData = resp.data
                this.pageData.page = resp.data.number + 1
            })
        },

        showRemarkDrawer() {
            if (this.tableName) {
                this.pageFilter.tableName = this.tableName
            } else {
                this.pageFilter.tableName = null
            }
            if(this.columnName) {
                this.pageFilter.columnName = this.columnName
            } else {
                this.pageFilter.columnName = null
            }

            listRemarks(this.groupId, this.projectId, this.pageFilter).then(resp => {
                this.pageData = resp.data
                this.pageData.page = resp.data.number + 1
                this.show = true
            })
        },

        closeRemarkDrawer() {
            this.$emit('onClose', this.show)
        }
    }
}
</script>