<template>
<div >
	<div class="m-header">
		<p class="topbar"><strong>可视化轻量级服务设计平台</strong> <small>LSCE</small></p>
	</div>
	<!-- <m-header bigTitle="可视化轻量级服务设计平台" smallTitle="LSCE"></m-header> -->
	<Tool @droped='showWidget'></Tool>
	<div class="showpanel" id="showpanel">
		<div class="jtk-demo-canvas canvas-wide drag-drop-demo jtk-surface jtk-surface-nopan" id="canvas">
			<div class="window" id="dragDropWindow1">one<br/><br/><a href="#" class="cmdLink hide" rel="dragDropWindow1">toggle connections</a><br/><a href="#" class="cmdLink drag" rel="dragDropWindow1">disable dragging</a><br/><a href="#" class="cmdLink detach" rel="dragDropWindow1">detach all</a></div>
		</div>
	</div>
</div>
</template>

<script>
import {jsPlumb} from 'jsplumb'
import {mapGetters} from 'vuex'
import {typeNumber, typeString, typeBoolean} from 'common/point'
import Tool from 'components/base/tool'

export default {
  data() {
    return {
      instance: ''
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
      // var e = event || window.event
      // console.log(`x: ${e.screenX}, y:${screenY}`) // 获取鼠标位置  
      let inputLength = item.input.length
      let outputLength = item.output.length
      let type = ''
      let i = 0
      let n = 0
      for (n = 0; n < inputLength; n++, i++) {
        item.input[n].itype === 'Number' ? type = typeNumber : item.input[n].itype === 'String' ? type = typeString : type = typeBoolean
        this.addPoint('dragDropWindow1', 'input', n, type, i)
      }
      for (n = 0; n < outputLength; n++, i++) {
        item.output[n].otype === 'Number' ? type = typeNumber : item.output[n].otype === 'String' ? type = typeString : type = typeBoolean
        this.addPoint('dragDropWindow1', 'output', n, type, i)
      }
    },
    addPoint(el, io, n, type, i) {
      if (io === 'input') {
        this.instance.my_addEndpoint(el, { anchor: [0, 0.1 + n * 0.2, -1, 0] }, type, i)
      } else if (io === 'output') {
        this.instance.my_addEndpoint(el, { anchor: [1, 0.9 - n * 0.2, 1, 0] }, type, i)
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
		left: 330px;
		width: 100%;
		height: 100%;
		border: 1px solid #ccc;
	}
</style>