<template>
<div >
  <div class="m-header">
    <p class="topbar"><strong>可视化轻量级服务设计平台</strong> <small>LSCE</small></p>
  </div>
  <!-- <m-header bigTitle="可视化轻量级服务设计平台" smallTitle="LSCE"></m-header> -->
  <Tool @droped='showWidget'></Tool>
  <div class="showpanel" >
    <div class="jtk-demo-canvas canvas-wide drag-drop-demo jtk-surface jtk-surface-nopan" id="canvas" @keyup='getInputText'>
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
const FUNCTIONAL = 'functional'
const FILTER = 'filter'
const FILTERHEIGHT = 170

export default {
  data() {
    return {
      instance: '',
      combinedToollist: [],
      connections: [],
      dn: -1, // divNum
      fn: -1, // filterNum
      filterInputValue: []
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
    document.oncontextmenu = function() {
      return false
    }
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
          // _this.instance.bind('onmousedown', function (ev) {
          //   console.log('按键')
          //   if (ev.button === 2) {
          //     console.log('右键')
          //     _this.instance.removeAllEndpoints(_this.instance)
          //   }
          // })
        })
      })
    },
    showWidget(item) {
      // console.log(item)
      var e = event || window.event
      let widgetId = item.servName
      if (item.type === FUNCTIONAL) {
        this.addFunctionalNode(item, e, widgetId)
      } else if (item.type === FILTER) {
        this.addFilterNode(item, e, widgetId)
      }
    },
    addFunctionalNode(item, e, widgetId) { // 添加port节点
      let inputLength = item.input.length
      let outputLength = item.output.length
      let type = ''
      let i = 0
      let pn = 0 // input/output pointNum
      this.addWidgetNode('canvas', e, this.addNode('div', 'window', widgetId))
      this.addFunctionalPortName(widgetId, this.addNode('span', '', ''), item.servName, 'title', 0)
      for (pn = 0; pn < inputLength; pn++, i++) {
        item.input[pn].itype === 'Number' ? type = typeNumber : item.input[pn].itype === 'String' ? type = typeString : type = typeBoolean
        this.addFunctionalPoint(widgetId, 'input', pn, type, i)
        this.addFunctionalPortName(widgetId, this.addNode('span', 'portname', ''), item.input[pn].iname, 'left', (pn + 1) * PORTLINEHEIGHT)
      }
      for (pn = 0; pn < outputLength; pn++, i++) {
        item.output[pn].otype === 'Number' ? type = typeNumber : item.output[pn].otype === 'String' ? type = typeString : type = typeBoolean
        this.addFunctionalPoint(widgetId, 'output', pn, type, i)
        this.addFunctionalPortName(widgetId, this.addNode('span', 'portname', ''), item.output[pn].oname, 'right', pn * PORTLINEHEIGHT)
      }
      this.instance.draggable(jsPlumb.getSelector('.drag-drop-demo .window'))

      // let _this = this
      // let obj = document.getElementById(widgetId)
      // obj.onmousedown = function(ev) {
      //   if (ev.button === 2) { 
      //     _this.deleteNode(obj)
      //   }
      // }
    },
    addFilterNode(item, e, widgetId) { // 拖出Filter框后渲染的画面
      this.addWidgetNode('canvas', e, this.addNode('div', 'filter', widgetId))
      this.addWidgetNode(widgetId, e, this.addNode('div', 'filterFrame', ''))
      this.addAllFilterPortName(widgetId, item)
      let type = ''
      item.input[0].itype === 'Number' ? type = typeNumber : item.input[0].itype === 'String' ? type = typeString : type = typeBoolean
      this.addFilterPoint(widgetId, type, 0)
      this.addFilterInput(widgetId, e, item)
      this.instance.draggable(jsPlumb.getSelector('.drag-drop-demo .filter'))
      
      let _this = this
      let obj = document.getElementById(widgetId)
      if (obj) {
        obj.onmousedown = function(ev) {
          if (ev.button === 2) { 
            let conf = confirm('Delete widget?')
            if (conf === true) {
              _this.deleteNode(obj)
            }
          }
        }
      }
    },
    addNode(nodetype, classname, id) { // 添加节点类型
      let node = document.createElement(nodetype)
      node.className = classname
      node.id = id
      return node
    },
    addWidgetNode(el, e, node) { // 添加到定点位置
      let obj = document.getElementById(el)
      if (el === 'canvas') {
        node.style.top = e.clientY - 40 + 'px'
        node.style.left = e.clientX - 330 + 'px'
      }
      node.style.position = 'absolute'
      obj.appendChild(node) 
    },
    addFunctionalPoint(el, io, pn, type, index) { // 添加port样式锚点
      if (io === 'input') {
        this.instance.my_addEndpoint(el, { anchor: [0, 0.3 + pn * 0.2, -1, 0] }, type, index)
      } else if (io === 'output') {
        this.instance.my_addEndpoint(el, { anchor: [1, 0.9 - pn * 0.2, 1, 0] }, type, index)
      }
    },
    addFilterPoint(el, type, index) {
      this.instance.my_addEndpoint(el, { anchor: 'LeftMiddle' }, type, index++)
      this.instance.my_addEndpoint(el, { anchor: 'RightMiddle' }, type, index++)
      this.instance.my_addEndpoint(el, { anchor: 'BottomCenter' }, type, index++)
    },
    addFunctionalPortName(el, node, text, pos, val) { // 添加portname
      let obj = document.getElementById(el)
      node.innerText = text
      if (pos === 'left') {
        node.style.top = val + 'px'
        node.style.left = 0
        node.style.position = 'absolute'
      } else if (pos === 'right') {
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
    addFilterPortName(el, node, text, pos) {
      let obj = document.getElementById(el)
      node.innerText = text
      if (pos === 'title') {
        node.style.paddingTop = '35px'
        node.style.textAlign = 'center'
        node.style.fontWeight = 'bold'
      } else if (pos === 'left') { // input
        node.style.top = FILTERHEIGHT / 2 - 6 + 'px'
        node.style.left = '12px'
        node.style.position = 'absolute'
      } else if (pos === 'right') { // Y
        node.style.top = FILTERHEIGHT / 2 - 6 + 'px'
        node.style.right = '12px'
        node.style.position = 'absolute'
      } else if (pos === 'bottom') { // N
        node.style.bottom = '8px'
        node.style.left = FILTERHEIGHT / 2 - 8 + 'px'
        node.style.textAlign = 'center'
        node.style.position = 'absolute'
      }
      node.style.display = 'block'
      obj.appendChild(node)
    },
    addAllFilterPortName(id, item) {
      this.addFilterPortName(id, this.addNode('span', '', ''), item.servName, 'title')
      this.addFilterPortName(id, this.addNode('span', 'portname', ''), item.input[0].iname, 'left')
      this.addFilterPortName(id, this.addNode('span', 'portname', ''), item.output[0].oname, 'right')
      this.addFilterPortName(id, this.addNode('span', 'portname', ''), item.output[1].oname, 'bottom')
    },
    addFilterInput(el, e, item) {
      this.addWidgetNode(el, e, this.addNode('input', 'filterInput', 'filterInput' + ++this.fn))
      let filterInput = {}
      filterInput.id = 'filterInput' + this.fn
      filterInput.serv = item.servName
      filterInput.value = ''
      this.filterInputValue.push(filterInput)

      // obj.addEventListener('click', function() {
      //   alert('onclick')
      //   let conf = confirm('Delete widget?')
      //   if (conf === true) document.body.removeChild(obj)
      // }, false)
    },
    getInputText() { // 获取所有input的实时值并保存在filterInputValue中
      let length = this.filterInputValue.length
      let obj = ''
      for (let i = 0; i < length; i++) {
        let id = 'filterInput' + i
        obj = document.getElementById(this.filterInputValue[i].id)
        console.log(`${id}: ${obj.value}`)
      }
    },
    deleteNode(obj) {
      this.instance.deleteConnectionsForElement(obj)
      this.instance.removeAllEndpoints(obj)
      obj.remove()
    },
    updateConnections(conn, remove) {
      this.getDetail(conn)
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