<template>
    <div id="diagram-container" style="min-width: 100vw; min-height:100vh;">
    </div>
</template>

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
            this.registerNewNode()
            const graph = this.createGraphInstance()
            this.redendarUml(graph)
        },

        exportUml() {
            this.graph.toPNG(
                (dataUri) => {
                    // 下载
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
        },

        redendarUml(graph) {
            const nodeData = this.modelData.map(data => {
                    return {
                        id: data.id,
                        tableName: data.name,
                        columns: data.columns
                    }
                })

            let x = 20, y = 20, selectMaxRowHeight = 20
            nodeData.forEach((data, index) => {
                // 每张表的最长行长度
                let selectMaxRowWidth = data.tableName.pxWidth()
                let currentRowHeight = 30 * data.columns.length + 40
                selectMaxRowHeight = selectMaxRowHeight > currentRowHeight ? selectMaxRowHeight : currentRowHeight
                data.columns.forEach(column => {
                    const columnType = databaseFieldFormatter.formatColumnType(column)
                    const columnName = databaseFieldFormatter.formatColumnName(column, this.showComment)
                    let distance = 80
                    let width = distance + columnName.pxWidth() + columnType.pxWidth()
                    if (width > selectMaxRowWidth) {
                        selectMaxRowWidth = width
                    }
                })
                
                const ports = data.columns.map(column => {
                    const columnType = databaseFieldFormatter.formatColumnType(column)
                    const columnName = databaseFieldFormatter.formatColumnName(column, this.showComment)

                    let columnNameWeight = column.nullable == 'YES' ? 'normal' : 'bold'
                    return {
                        id: data.id + "-" + column.id,
                        group: "columnGroup",
                        attrs: {
                            portBody: {
                                width: selectMaxRowWidth,
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
                                refX: selectMaxRowWidth - columnType.pxWidth() - 22,
                            }
                        }
                    }
                })
                graph.addNode({
                    id: data.id,
                    x: x,
                    y: y,
                    shape: 'er-rect',
                    width: selectMaxRowWidth,
                    height: 40,
                    label: data.tableName,
                    ports: ports
                })
                x += selectMaxRowWidth + 60
                if ((index + 1) % 5 == 0) {
                    y += selectMaxRowHeight + 60
                    x = 20
                }
            })
        },

        createGraphInstance() {
            const graph = new Graph({
                container: document.getElementById('diagram-container'),
                grid: true,
                panning: true,
                keyboard: true,
                mousewheel: {
                    enabled: true,
                    modifiers: ['ctrl', 'meta'],
                },
                 connecting: {
                    router: {
                        name: 'er',
                        args: {
                            padding: 1,
                            offset: 25,
                            direction: 'H',
                        },
                    },
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
            graph.bindKey('backspace', () => {
                const cells = graph.getSelectedCells()
                if (cells.length) {
                    graph.removeCells(cells)
                }
            })
            if (graph.isHistoryEnabled()) {
                graph.disableHistory()
            } else {
                graph.enableHistory()
            }
            this.graph = graph
            return graph;
        },

        registerNewNode() {
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