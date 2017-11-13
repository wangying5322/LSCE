<template>
<div >
	<div class="m-header">
		<p class="topbar"><strong>可视化轻量级服务设计平台</strong> <small>LSCE</small></p>
	</div>
	<!-- <m-header bigTitle="可视化轻量级服务设计平台" smallTitle="LSCE"></m-header> -->
	<Tool @droped='showWidget'></Tool>
	<div class="showpanel" >
		<div class="jtk-demo-canvas canvas-wide drag-drop-demo jtk-surface jtk-surface-nopan" id="canvas">
			<!-- <div class="window" id="dragDropWindow1">one<br/><br/><a href="#" class="cmdLink hide" rel="dragDropWindow1">toggle connections</a><br/><a href="#" class="cmdLink drag" rel="dragDropWindow1">disable dragging</a><br/><a href="#" class="cmdLink detach" rel="dragDropWindow1">detach all</a></div> -->
		</div>
	</div>
</div>
</template>

<script>
import {jsPlumb} from 'jsplumb'
import {mapGetters} from 'vuex'
import {typeNumber, typeString, typeBoolean} from 'common/point'
import Tool from 'components/base/tool'
const PORTLINEHEIGHT = 24
export default {
  data() {
    return {
      instance: '',
      combinedToollist: [],
      connections: []
    }
  },
  computed: {
    ...mapGetters([
      'toolList'
    ])
  },
  watch: {
    toolList: function() {
      this._normalizeToollist()
    }
  },
  components: {
    Tool
  },
  mounted() {
    this.getJsplumbInstance()
  },
  methods: {
    getJsplumbInstance() {
      var _this = this
      jsPlumb.ready(function() {
        _this.instance = jsPlumb.getInstance({
          DragOptions: { cursor: 'pointer', zIndex: 200 },
          PaintStyle: { stroke: '#666' },
          EndpointHoverStyle: { fill: 'orange' },
          HoverPaintStyle: { stroke: 'orange' },
          EndpointStyle: { width: 20, height: 16, stroke: '#666' },
          Endpoint: 'Rectangle',
          Anchors: ['TopCenter', 'TopCenter'],
          Container: 'canvas'
        })

        _this.instance.batch(function () {
          _this.instance.bind('beforeDrop', function (params) {
            return confirm('Connect ' + params.sourceId + 'to' + params.targetId + '?')
          })
          _this.instance.bind('connection', function (info, originalEvent) {
            _this.updateConnections(info)
          })
          _this.instance.bind('click', function (conn) {
            _this.instance.deleteConnection(conn)
          })
          _this.instance.bind('beforeDetach', function (conn) {
            return confirm('Delete connection?');
          });
          _this.instance.bind('connectionDetached', function (info, originalEvent) {
            _this.updateConnections(info, true);
          })
          _this.instance.bind('connectionMoved', function (info, originalEvent) {
            _this.updateConnections(info, true);
          })
        })
      })
    },
    showWidget(item) {
      console.log(item)
      var e = event || window.event
      
      // let widgetId = 'DeviceWidget' + this.n++
      let widgetId = item.servName
      this.addWidgetNode('canvas', e, this.addNode('div', 'window', widgetId))
      this.addPortName(widgetId, this.addNode('span', '', ''), item.servName, 'title', 0)
      let inputLength = item.input.length
      let outputLength = item.output.length
      let type = ''
      let i = 0
      let pn = 0 // input/output pointNum
      for (pn = 0; pn < inputLength; pn++, i++) {
        item.input[pn].itype === 'Number' ? type = typeNumber : item.input[pn].itype === 'String' ? type = typeString : type = typeBoolean
        this.addPoint(widgetId, 'input', pn, type, i)
        this.addPortName(widgetId, this.addNode('span', 'portname', ''), item.input[pn].iname, 'top', (pn + 1) * PORTLINEHEIGHT)
      }
      for (pn = 0; pn < outputLength; pn++, i++) {
        item.output[pn].otype === 'Number' ? type = typeNumber : item.output[pn].otype === 'String' ? type = typeString : type = typeBoolean
        this.addPoint(widgetId, 'output', pn, type, i)
        this.addPortName(widgetId, this.addNode('span', 'portname', ''), item.output[pn].oname, 'bottom', pn * PORTLINEHEIGHT)
      }

      this.instance.draggable(jsPlumb.getSelector('.drag-drop-demo .window'));
    },
    addPoint(el, io, pn, type, index) {
      if (io === 'input') {
        this.instance.my_addEndpoint(el, { anchor: [0, 0.3 + pn * 0.2, -1, 0] }, type, index)
      } else if (io === 'output') {
        this.instance.my_addEndpoint(el, { anchor: [1, 0.9 - pn * 0.2, 1, 0] }, type, index)
      }
    },
    addNode(nodetype, classname, id) {
      let node = document.createElement(nodetype)
      node.className = classname
      node.id = id
      return node
    },
    addWidgetNode(el, e, node) {  
      let obj = document.getElementById(el)
      node.style.top = e.clientY - 40 + 'px'
      node.style.left = e.clientX - 330 + 'px'
      node.style.position = 'absolute'
      obj.appendChild(node) 
    },
    addPortName(el, node, text, pos, val) {
      let obj = document.getElementById(el)
      node.innerText = text
      if (pos === 'top') {
        node.style.top = val + 'px'
        node.style.left = 0
        node.style.position = 'absolute'
      } else if (pos === 'bottom') {
        node.style.bottom = val + 'px'
        node.style.right = 0
        node.style.position = 'absolute'
      } else if (pos === 'title') {
        node.style.top = val + 'px'
        node.style.textAlign = 'center'
        node.style.fontWeight = 'bold'
      }
      node.style.display = 'block'
      obj.appendChild(node)
    },
    updateConnections(conn, remove) {
      let sourceDevice = this._getDeviceContent(conn.sourceId)
      let targetDevice = this._getDeviceContent(conn.targetId)
      let sourceEndpointIndex = conn.sourceEndpoint.id.match(/_(\S*)_/)[1]
      let targetEndpointIndex = conn.targetEndpoint.id.match(/_(\S*)_/)[1]
      console.log(`connection[${conn.connection.id}] source: ${sourceDevice.servName}.${sourceDevice.output[sourceEndpointIndex].oname}`)
      console.log(`connection[${conn.connection.id}] target: ${targetDevice.servName}.${targetDevice.input[targetEndpointIndex].iname}`)
      if (!remove) {
        this.connections.push(conn) // connections记录已经连过的线
      } else { // 如果被移除了，相应位置为-1，再从数组移除
        let idx = -1
        for (var i = 0; i < this.connections.length; i++) {
          if (this.connections[i].connection === conn.connection) {
            idx = i
            break
          }
        }
        if (idx !== -1) this.connections.splice(idx, 1)
      }
      if (this.connections.length > 0) { 
        console.log(this.connections)
      } else {
        console.log('no connection')
      }
    },
    _getDeviceContent(deviceName) {
      let targetDevice = ''
      this.combinedToollist.forEach((item) => {
        if (item.servName === deviceName) {
          targetDevice = item
        }
      })
      return targetDevice
    },
    _normalizeToollist() {
      this.combinedToollist = this.toolList[0].listContent.concat(this.toolList[1].listContent)
      console.log(this.combinedToollist)
    }
  }
}
</script>

<style>
  body, html {
  	margin: 0;
  	padding: 0;
  }
	.m-header{
		position: fixed;
		top: 0;
		width: 100%;
		z-index: 1000;
		padding-left: 10px;
		height: 40px;
		background-color: #0e90d2;
		border-color: #0b6fa2;
		color: #fff;
	}
	.topbar{
		float:left;
		margin: 0;
		line-height: 40px;
		font-size:18px;
	}
	.showpanel{
		position: absolute;
		top: 40px;
		bottom: 0;
		left: 330px;
		right: 0;
		border: 1px solid #ccc;
	}
	#canvas{
		height: 100%;
		bottom: 0;
	}
	.portname{
		font-size: 12px;
		padding: 0 3px 0 3px;
	}
</style>