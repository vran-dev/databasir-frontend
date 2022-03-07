<template>
    <el-row>
        <el-col :span="20">
            <!-- database overview -->
            <el-descriptions :column="1" size="large" border>
                <el-descriptions-item label="Database Name" label-align="left" width='200px'>{{ databaseDocument.databaseName }}</el-descriptions-item>
                <el-descriptions-item label="Product Name" label-align="left">{{ databaseDocument.productName }}</el-descriptions-item>
                <el-descriptions-item label="Product Version" label-align="left">{{ databaseDocument.productVersion }}</el-descriptions-item>
                <el-descriptions-item label="Document Version" label-align="left">{{ databaseDocument.documentVersion }}</el-descriptions-item>
                <el-descriptions-item label="Create At" label-align="left">{{ databaseDocument.createAt }}</el-descriptions-item>
            </el-descriptions>

        <!-- table overview -->
            <h2 :id="databaseDocument.databaseName + '.overview'">Overview</h2>
            <el-table :data="databaseDocument.tables"  border stripe width='80%'>
                <el-table-column type="index" />
                <el-table-column prop="name" label="Name" min-width="160" resizable />
                <el-table-column prop="type" label="Type" width="200"  resizable />
                <el-table-column prop="comment" label="comment" min-width="160" resizable />
                <el-table-column prop="remark" label="remark" min-width="120" resizable >
                <template v-slot="scope">
                    <el-button @click="onRemark(scope.row.name)" size="small" icon="Edit"></el-button>
                </template>
                </el-table-column>
            </el-table>

        <!-- table details -->
        <template v-for="tableMeta in databaseDocument.tables" :key="tableMeta">
                <h2 :id="databaseDocument.databaseName + '.' + tableMeta.name">{{ tableMeta.name }}</h2>
                <h3 v-if="tableMeta.columns.length > 0">Columns</h3>
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
                <el-table-column prop="remark" label="remark" min-width="60" resizable>
                    <template v-slot="scope">
                        <el-button @click="onRemark(tableMeta.name, scope.row.name)" size="small" icon="Edit"></el-button>
                    </template>
                </el-table-column>
                </el-table>
        
            <div v-if="tableMeta.indexes.length > 0">
                <h3>Indexes</h3>            
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
            </div>
            
            <div  v-if="tableMeta.triggers.length > 0">
                <h3>Triggers</h3>
                <el-table :data="tableMeta.triggers" stripe fit border width='80%'>
                    <el-table-column type="index" />
                    <el-table-column prop="name" label="Name" min-width="120" />
                    <el-table-column prop="timing" label="timing" />
                    <el-table-column prop="manipulation" label="manipulation" width="120" />
                    <el-table-column prop="statement" label="statement" />
                    <el-table-column prop="creatAt" label="creatAt" width="150" />
                </el-table>
            </div>

        </template>

        <el-tooltip
            content="回到顶部"
            placement="top"
        >
            <el-backtop :bottom="100"></el-backtop>
        </el-tooltip>
        </el-col>
        <el-col :span="2">
        <div class="toc-wrapper">
            <div class="toc">
            <ul>
                <li v-for="(item, index) in toc" :key="index">
                <el-link :underline="false" @click="onClickToc(databaseDocument.databaseName +'.'+ item.name)">
                    {{ item.name }}
                </el-link>
                <ul>
                    <li v-for="(childItem, childIndex) in item.child" :key="index+'-'+childIndex"><el-link :underline="false">{{ childItem.name }}</el-link></li>
                </ul>
                </li>
            </ul>
            </div>
        </div>
        </el-col>
    </el-row>
</template>
<style>
.toc-wrapper {
  right:0;
  z-index: 0;
  bottom: auto;
  padding-left: 12px;
  margin-left: 10px;
}

.toc {
  top: 180px;
  /* position: fixed; */
  margin-left: 0;
  transform: scale(1, 1);
  bottom:0;
  position:fixed;
  overflow-y:hidden;
  overflow-x:hidden;
}

.toc:hover {
  overflow-y: auto;
  overflow-x: auto;
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
</style>
<script>

export default {
    props: ['projectId', 'groupId', 'projectVersion', 'databaseDocument'],
    emits: ['onRemark'],
    data() {
        return {
        }
    },

    watch: {
        'databaseDocument': {
            deep: false,
            handler() {
                // do nothing
            }
        }
    },

    computed: {
        toc() {
            const toc = []
            toc.push({ name: 'overview', child: [] })
            this.databaseDocument.tables.forEach(item => {
                const child = []
                toc.push({ name: item.name, child: child })
            })
            return toc
        }
    },

    methods: {
        onRemark(tableName, columnName) {
             this.$emit('onRemark', tableName, columnName)
        },

        onClickToc(id){
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
        },

        columnTypeFormat(column){
            if (column.decimalDigits == null) {
                return column.type + '('+column.size+')' 
            } else {
                return column.type + '('+column.size+', '+column.decimalDigits+')'
            }
        },
    }

}
</script>