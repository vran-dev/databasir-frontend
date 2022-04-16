<template>
    <div id="diagram-container" style="min-width: 100vw; min-height:100vh;">
    </div>
</template>

<style>
@keyframes running-line {
  to {
    stroke-dashoffset: -1000;
  }
}
</style>
<script>
import { Graph, DataUri } from '@antv/x6'
import { formatter as databaseFieldFormatter } from '@/utils/DatabaseFieldFormatter'

String.prototype.byteLength = function() {
    var length = 0;
    Array.from(this).map(function(char){
        if(char.charCodeAt(0)>255) {//字符编码大于255，说明是双字节字符
            length += 2;
        }else {
            length++;
        }
    });
    
    return length;
}

String.prototype.pxWidth = function() {
  var canvas = String.prototype.pxWidth.canvas || (String.prototype.pxWidth.canvas = document.createElement("canvas")),
      context = canvas.getContext("2d"); 
  context.font = "normal 12px ms"
  var metrics = context.measureText(this);
  return metrics.width;
}

export default {
    props: {
        modelData: Array,
        showComment: {
            default: true
        }
    },
    data() {
        return {
            graph: null
        }
    },
    watch: {
        'showComment': {
            deep: true,
            handler() {
                this.graph.clearCells()
                this.redendarUml(this.graph)
            }
        },
        'modelData': {
            handler() {
                this.graph.clearCells()
                this.redendarUml(this.graph)
            }
        }
    },
    mounted() {
        this.init()
    },
    methods: {
        init() {
            this.registerUmlNode()
            const graph = this.createGraphInstance()
            this.redendarUml(graph)
        },
        exportUml(type) {
            if (type == 'svg') {
                this.graph.toSVG((dataUri) => {
                    DataUri.downloadDataUri(DataUri.svgToDataUrl(dataUri), 'uml.svg')
                })
            } else {
                this.graph.toPNG(
                    (dataUri) => {
                        DataUri.downloadDataUri(dataUri, 'uml.png')
                    }, 
                    {
                        padding: {
                            top: 20,
                            right: 30,
                            bottom: 40,
                            left: 50,
                        },
                    }
                )
            }
            
        },
        redendarUml(graph) {
            const tableList = this.modelData.map(table => {
                    return {
                        id: table.id,
                        tableName: table.name,
                        columns: table.columns,
                        foreignKeys: table.foreignKeys
                    }
                })

            let x = 20, y = 20; // 初始坐标
            const nodeHorizontalSpacing = 60, nodeVerticalSpacing = 60; // 水平、垂直间距
            const rowNodeCount = 5; // 每行展示多少个 UML 图
            let maxHeightInNodeRow = 20;
            tableList.forEach((table, index) => {
                // 每一行中 height 最大的节点
                const currentNodeMaxHeight = this.calculateMaxHeightInGraphRow(20, table)
                maxHeightInNodeRow = currentNodeMaxHeight > maxHeightInNodeRow ? currentNodeMaxHeight : maxHeightInNodeRow 
                // 当前节点中的最大 width
                let maxWidthInCurrentNode = this.calculateMaxWidthInNode(table) 
                
                const ports = table.columns.map(column => {
                    const columnType = databaseFieldFormatter.formatColumnType(column)
                    const columnName = databaseFieldFormatter.formatColumnName(column, this.showComment)
                    let columnNameWeight = column.nullable == 'YES' ? 'normal' : 'bold'
                    return {
                        id: table.tableName + "." + column.name,
                        group: "columnGroup",
                        attrs: {
                            portBody: {
                                width: maxWidthInCurrentNode,
                                height: 30,
                                refY: 11
                            },
                            portNameLabel: {
                                height: 30,
                                text: columnName,
                                fontWeight: columnNameWeight,
                                refY: 11
                            },
                            portTypeLabel: {
                                text: columnType,
                                height: 30,
                                refY: 11,
                                refX: maxWidthInCurrentNode - columnType.pxWidth() - 22,
                            }
                        }
                    }
                })
                graph.addNode({
                    id: table.tableName,
                    x: x,
                    y: y,
                    shape: 'er-rect',
                    width: maxWidthInCurrentNode,
                    height: 40,
                    label: table.tableName,
                    ports: ports
                })

                // next position(x, y)
                x += maxWidthInCurrentNode + nodeHorizontalSpacing
                if ((index + 1) % rowNodeCount == 0) {
                    y += maxHeightInNodeRow + nodeVerticalSpacing
                    x = 20
                }
            })

            const tableNameArr = tableList.map(d => d.tableName)
            tableList
                .filter(table => table.foreignKeys && table.foreignKeys.length > 0)
                .flatMap(table => {
                    return table.foreignKeys
                        .filter(fk => tableNameArr.indexOf(fk.pkTableName) != -1)
                        .map(fk => {
                            return  {
                                shape: 'er-edge',
                                source: {
                                    cell: table.tableName,
                                    port: table.tableName + '.' + fk.fkColumnName
                                },
                                target: {
                                    cell: fk.pkTableName,
                                    port: fk.pkTableName + '.' + fk.pkColumnName
                                }
                            }
                        })
                }).forEach(edge => graph.addEdge(edge))
        },

        calculateMaxHeightInGraphRow(initHeight, data) {
            let currentRowHeight = 30 * data.columns.length + 40
            return initHeight > currentRowHeight ? initHeight : currentRowHeight
        },

        calculateMaxWidthInNode(data) {
            let maxWidth = data.tableName.pxWidth()
            data.columns.forEach(column => {
                const columnType = databaseFieldFormatter.formatColumnType(column)
                const columnName = databaseFieldFormatter.formatColumnName(column, this.showComment)
                let distance = 80
                let width = distance + columnName.pxWidth() + columnType.pxWidth()
                if (width > maxWidth) {
                    maxWidth = width
                }
            })
            return maxWidth
        },

        createGraphInstance() {
            const graph = new Graph({
                container: document.getElementById('diagram-container'),
                grid: true,
                panning: true,
                snapline: true,
                resizing: false,
                keyboard: true,
                mousewheel: {
                    enabled: true,
                    modifiers: ['ctrl', 'meta'],
                },
                selecting: {
                    enabled: true,
                    showNodeSelectionBox: true,
                },
                connecting: {
                    snap: true,
                    allowBlank: false,
                    allowEdge: false,
                    highlight: true,
                    interacting() {
                        return { edgeMovable: true }
                    },
                    createEdge() {
                        return graph.createEdge({
                            shape: 'er-edge',
                            strokeDasharray: 5,
                            attrs: {
                                line: {
                                    style: {
                                        animation: 'ant-line 30s infinite linear',
                                    },
                                }
                            }
                        })
                    }
                },
            })
            graph.bindKey(['meta+z', 'ctrl+z'], () => {
                if (graph.history.canUndo()) {
                    graph.history.undo()
                }
                return false
            })
            graph.bindKey(['meta+shift+z', 'ctrl+shift+z'], () => {
                if (graph.history.canRedo()) {
                    graph.history.redo()
                }
                return false
            })
            // 删除连接线(边)
            graph.bindKey(['Backspace', 'Delete'], () => {
                const cells = graph.getSelectedCells()
                if (cells.length) {
                    graph.removeCells(cells)
                }
            })

            graph.on('edge:mouseenter', ({ edge }) => {
                edge.attr('line/style/animation', 'running-line 30s infinite linear')
                edge.attr('line/strokeDasharray', 5)
                this.changeUmlElementStyle(graph, edge)
            })
            graph.on('edge:mouseleave', ({ edge }) => {
                edge.attr('line/strokeDasharray', 0)
                edge.attr('line/style/animation', null)
                this.resetUmlElementStyle(graph, edge)
            })
            graph.on('edge:dblclick', ({ cell, e }) => {
                cell.addTools({
                    name: 'edge-editor',
                    args: {
                        event: e,
                    },
                })
            })

            if (graph.isHistoryEnabled()) {
                graph.disableHistory()
            } else {
                graph.enableHistory()
            }
            this.graph = graph
            return graph;
        },

        changeUmlElementStyle(graph, edge) {
            const source = graph.getCellById(edge.source.cell)
            source.setPortProp(edge.source.port, 'attrs/portNameLabel', { fill: '#409EFF' })
            source.setPortProp(edge.source.port, 'attrs/portTypeLabel', { fill: '#409EFF' })
            
            const target = graph.getCellById(edge.target.cell)
            if (target) {
                target.setPortProp(edge.target.port, 'attrs/portNameLabel', { fill: '#409EFF' })
                target.setPortProp(edge.target.port, 'attrs/portTypeLabel', { fill: '#409EFF' })
            }
            
        },
        
        resetUmlElementStyle(graph, edge) {
            const source = graph.getCellById(edge.source.cell)
            source.setPortProp(edge.source.port, 'attrs/portBody', { fill: '#FFF' })
            source.setPortProp(edge.source.port, 'attrs/portNameLabel', { fill: '#303133' })
            source.setPortProp(edge.source.port, 'attrs/portTypeLabel', { fill: '#303133' })

            const target = graph.getCellById(edge.target.cell)
            if (target) {
                target.setPortProp(edge.target.port, 'attrs/portBody', { fill: '#FFF' })
                target.setPortProp(edge.target.port, 'attrs/portNameLabel', { fill: '#303133' })
                target.setPortProp(edge.target.port, 'attrs/portTypeLabel', { fill: '#303133' })
            }
            
        },

        registerUmlNode() {
            const LINE_HEIGHT = 30
            Graph.registerPortLayout(
                'erPortPosition',
                (portsPositionArgs) => {
                    return portsPositionArgs.map((_, index) => {
                    return {
                        position: {
                            x: 0,
                            y: (index + 1) * LINE_HEIGHT,
                        },
                        angle: 0,
                    }
                    })
                },
                true,
            )

            Graph.registerEdge(
                'er-edge',
                {
                    inherit: 'edge',
                    strokeDasharray: 5,
                    connector: {
                        name: 'rounded'
                    },
                    router: {
                        name: 'manhattan',
                        args: {
                            step: 10,
                            maxDirectionChange: 90
                        }
                    },
                    attrs: {
                        line: {
                            targetMarker: {
                                name: 'classic',
                                args: {
                                    size: 7,
                                    offset: -2
                                },
                            },
                        }
                    },
                    tools: {
                        name: 'segments',
                        args: {
                            stopPropagation: false,
                            precision: 500,
                            threshold: 20,
                            attrs: {
                                fill: '#444',
                            },
                        },
                    },
                },
                true,
            )

            Graph.registerNode(
                'er-rect',
                {
                    inherit: 'rect',
                    markup: [
                        {
                            tagName: 'rect',
                            selector: 'body',
                        },
                        {
                            tagName: 'text',
                            selector: 'label',
                        }
                    ],
                    attrs: {
                        rect: {
                            strokeWidth: 1,
                            stroke: '#ddd',
                            fill: '#f5f7fa',
                        },
                        label: {
                            fontWeight: 'bold',
                            fill: '#000',
                            fontSize: 12,
                        },
                    },
                    ports: {
                        groups: {
                            columnGroup: {
                                markup: [
                                    {
                                        tagName: 'rect',
                                        selector: 'portBody',
                                    },
                                    {
                                        tagName: 'text',
                                        selector: 'portNameLabel',
                                    },
                                    {
                                        tagName: 'text',
                                        selector: 'portTypeLabel',
                                    },
                                ],
                                attrs: {
                                    portBody: {
                                        width: 100,
                                        height: 30,
                                        refY: 20,
                                        strokeWidth: 1,
                                        stroke: '#ddd',
                                        fill: '#FFF',
                                        magnet: true,
                                    },
                                    portNameLabel: {
                                        ref: 'portBody',
                                        refX: 6,
                                        refY: 22,
                                        fontSize: 12,
                                    },
                                    portTypeLabel: {
                                        ref: 'portBody',
                                        refX: 95,
                                        refY: 22,
                                        fontSize: 12,
                                    },
                                },
                                position: 'erPortPosition'
                            }
                        }
                    }
                },
                true,
            )
        }
    }   
}
</script>