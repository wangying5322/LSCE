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
      n: 0
    }
  },
  computed: {
    ...mapGetters([
      'toolList'
    ])
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
          DragOptions: { cursor: 'pointer', zIndex: 2000 },
          PaintStyle: { stroke: '#666' },
          EndpointHoverStyle: { fill: 'orange' },
          HoverPaintStyle: { stroke: 'orange' },
          EndpointStyle: { width: 20, height: 16, stroke: '#666' },
          Endpoint: 'Rectangle',
          Anchors: ['TopCenter', 'TopCenter'],
          Container: 'canvas'
        })
      })
    },
    showWidget(item) {
      console.log(item)
      var e = event || window.event
      
      let widgetId = 'designWindow' + this.n++
      this.addWidgetNode('canvas', e, this.addNode('div', 'window', widgetId))

      let inputLength = item.input.length
      let outputLength = item.output.length
      let type = ''
      let i = 0
      let pn = 0 // pointNum
      for (pn = 0; pn < inputLength; pn++, i++) {
        item.input[pn].itype === 'Number' ? type = typeNumber : item.input[pn].itype === 'String' ? type = typeString : type = typeBoolean
        this.addPoint(widgetId, 'input', pn, type, i)
        this.addPortName(widgetId, this.addNode('span', 'portname', ''), item.input[pn].iname, 'top', pn * PORTLINEHEIGHT)
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
        this.instance.my_addEndpoint(el, { anchor: [0, 0.1 + pn * 0.2, -1, 0] }, type, index)
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
      } else if (pos === 'bottom') {
        node.style.bottom = val + 'px'
        node.style.right = 0
      }
      node.style.display = 'block'
      node.style.position = 'absolute'
      obj.appendChild(node)
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