<template>
<div >
  <div class="m-header">
    <p class="topbar"><strong>可视化轻量级服务设计平台</strong> <small>LSCE</small></p>
  </div>
  <!-- <m-header bigTitle="可视化轻量级服务设计平台" smallTitle="LSCE"></m-header> -->
  <Tool @droped='showWidget'></Tool>
  <div class="showpanel" >
    <div class="jtk-demo-canvas canvas-wide drag-drop-demo jtk-surface jtk-surface-nopan" id="canvas" @keyup='getInputText' @mousedown='deleteNode'>
    </div>
  </div>
  <!-- 一个模板，显示json信息 -->
  <ShowJson :json='json'></ShowJson>
</div>
</template>

<script>
import {jsPlumb} from 'jsplumb'
import {mapGetters} from 'vuex'
import {addFunctionalNode, addFilterNode} from 'common/js/lsce_jsplumb'
import {FuncNode, FilterNode, Edge} from 'common/js/json'
import Tool from 'components/base/tool'
import ShowJson from 'components/base/ShowJson'
const FUNCTIONAL = 'functional'
const FILTER = 'filter'

export default {
  data() {
    return {
      instance: '',
      combinedToollist: [], // 将所有可以拖出来的节点抽出来整合出一个数组
      connections: [], // 记录连线
      sn: [], // 记录/产生serviceId
      json: {'nodes': [], 'edges': []}
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
    Tool,
    ShowJson
  },
  mounted() {
    this.getJsplumbInstance()
    // document.oncontextmenu = function() {
    //   return false
    // }
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
            _this.updateJsonEdges('add', info)
          })
          _this.instance.bind('click', function (conn) {
            _this.instance.deleteConnection(conn)
          })
          _this.instance.bind('beforeDetach', function (conn) {
            return confirm('Delete connection?');
          });
          _this.instance.bind('connectionDetached', function (info, originalEvent) {
            _this.updateConnections(info, true);
            _this.updateJsonEdges('delete', info)
          })
          _this.instance.bind('connectionMoved', function (info, originalEvent) {
            _this.updateConnections(info, true);
          })
        })
      })
    },
    showWidget(item) {
      var e = event || window.event
      let widgetId = ''
      if (!this.sn[item.servName]) { 
        this.sn[item.servName] = 0
      } 
      widgetId = item.servName + this.sn[item.servName]++

      if (item.type === FUNCTIONAL) {
        addFunctionalNode(item, e, widgetId, this.instance)
        this.updateJsonNodes('add', widgetId)
      } else if (item.type === FILTER) {
        addFilterNode(item, e, widgetId, this.instance)
        this.updateJsonNodes('add', widgetId)
      }
    },
    getInputText(e) { // 获取所有input的实时值并保存在filterInputValue中
      let filterInputId = e.target.id
      let obj = document.getElementById(filterInputId) // 在dom中的结构体

      let divId = e.target.parentNode.id // 用于查找json.nodes中的对应结构体
      let jsonNodesTarget = this.getTarget(this.json.nodes, 'div_id', divId)
      let index = this.json.nodes.indexOf(jsonNodesTarget) 
      this.$set(this.json.nodes[index], 'obj_info', obj.value)
    },
    getTarget(el, prop, value) {
      let target = ''
      el.forEach(function(item) {
        if (item[prop] === value) {
          target = item
        }
      })
      return target
    },
    updateConnections(conn, remove) {
      // this.getDetail(conn)
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
        // console.log(this.connections)
      } else {
        console.log('no connection')
      }
    },
    _getDeviceContent(deviceName) { // 方便转成json
      let targetDevice = ''
      this.combinedToollist.forEach((item) => {
        if (item.servName === deviceName) {
          targetDevice = item
        }
      })
      return targetDevice
    },
    _normalizeToollist() { // 方便转成json
      this.combinedToollist = this.toolList[0].listContent.concat(this.toolList[1].listContent)
      console.log(this.combinedToollist)
    },
    getDetail(conn) { // 打印连接信息
      let sourceDevice = this._getDeviceContent(conn.sourceId)
      let targetDevice = this._getDeviceContent(conn.targetId)

      let sourceEndpointIndex = conn.sourceEndpoint.id.match(/_(\S*)_/)[1]
      let targetEndpointIndex = conn.targetEndpoint.id.match(/_(\S*)_/)[1]

      console.log(`connection[${conn.connection.id}] source: ${sourceDevice.servName}.${sourceDevice.output[sourceEndpointIndex].oname}`)
      console.log(`connection[${conn.connection.id}] target: ${targetDevice.servName}.${targetDevice.input[targetEndpointIndex].iname}`)
    },
    deleteNode(e) {
      let _this = this
      if (e.button === 2) {
        e.preventDefault()
        let targetId = ''
        let classArr = []
        if (e.target.className === 'filterFrame') { // 判断选中的是filter
          targetId = e.target.parentNode.id
        } else {
          classArr = e.target.className.split(' ')
          if (classArr.indexOf('window') !== -1) { // 判断选中的是window
            targetId = e.target.id
          }
        }
        let obj = document.getElementById(targetId)
        let conf = confirm('Delete widget?')
        if (conf === true) {
          _this.instance.deleteConnectionsForElement(obj)
          _this.instance.removeAllEndpoints(obj)
          obj.remove()
          _this.updateJsonNodes('delete', targetId)
        }
      }
    },
    updateJsonNodes(type, value) { // prop代表nodes/edges, value代表widgetId
      if (type === 'add') {
        let temp = value.replace(/[0-9]/g, '') // 这里末尾多了一个数字，要在服务库中找到该服务名temp对应的具体的服务tartget的信息
        let target = this.getTarget(this.combinedToollist, 'servName', temp)
        // 根据不同类型node来new不同的结构体
        if (target.type === FUNCTIONAL) {
          this.json.nodes.push(new FuncNode({
            divId: value,
            servName: target.servName,
            id: target.id,
            type: target.type
          }))
        } else if (target.type === FILTER) {
          this.json.nodes.push(new FilterNode({
            divId: value,
            servName: target.servName,
            id: target.id,
            type: target.type,
            objInfo: ''
          }))
        }
      } else if (type === 'delete') {
        let target = this.getTarget(this.json.nodes, 'div_id', value)
        let index = this.json.nodes.indexOf(target)
        this.json.nodes.splice(index, 1)
      }
    },
    deleteEdge() {
    },
    updateJsonEdges(type, conn) {
      // 这里的conn.sourceId和targetId后面也多了数字
      if (type === 'add') {
        let src = this.getTarget(this.combinedToollist, 'servName', conn.sourceId.replace(/[0-9]/g, ''))
        let dst = this.getTarget(this.combinedToollist, 'servName', conn.targetId.replace(/[0-9]/g, ''))
        let srcPortIndex = conn.sourceEndpoint.id.match(/_(\S*)_/)[1]
        let dstPortIndex = conn.targetEndpoint.id.match(/_(\S*)_/)[1]
        this.json.edges.push(new Edge({
          connId: conn.connection.id,
          SRCdivId: conn.sourceId, 
          SRCport: src.output[srcPortIndex].oname,
          DSTdivId: conn.targetId, 
          DSTport: dst.input[dstPortIndex].iname
        }))
      } else if (type === 'delete') {
        let target = this.getTarget(this.json.edges, 'conn_id', conn.connection.id)
        let index = this.json.edges.indexOf(target)
        this.json.edges.splice(index, 1)
      }
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
    right: 300px;
    border: 1px solid #ccc;
  }
  #canvas{
    height: 100%;
  }
  .portname{
    font-size: 12px;
    padding: 0 3px 0 3px;
  }
  .filter {
    width: 170px;
    height: 170px;
    z-index: 25;
  }
  .filterFrame{
    font-family: serif;
    background-color: white;
    border: 1px solid #346789;
    z-index: -1;
    cursor: pointer;
    box-shadow: 2px 2px 19px #aaa;
    -o-box-shadow: 2px 2px 19px #aaa;
    -webkit-box-shadow: 2px 2px 19px #aaa;
    -moz-box-shadow: 2px 2px 19px #aaa;
    -moz-border-radius: 0.5em;
    border-radius: 0.5em;
    position: absolute;
    color: black;
    top: 25px;
    left: 25px;
    width: 120px;
    height: 120px;
    line-height: 24px;
    -webkit-transition: -webkit-box-shadow 0.15s ease-in;
    -moz-transition: -moz-box-shadow 0.15s ease-in;
    -o-transition: -o-box-shadow 0.15s ease-in;
    transition: box-shadow 0.15s ease-in;
    -moz-transform:rotate(45deg);
    -webkit-transform:rotate(45deg);
    -o-transform:rotate(45deg);
    transform:rotate(45deg);
  }
  .filterInput{
    width: 100px;
    display: block;
    margin: 20px 38px;
  }
</style>