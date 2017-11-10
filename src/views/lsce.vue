<template>
<div >
	<div class="m-header">
		<p class="topbar"><strong>可视化轻量级服务设计平台</strong> <small>LSCE</small></p>
	</div>
	<!-- <m-header bigTitle="可视化轻量级服务设计平台" smallTitle="LSCE"></m-header> -->
	<Tool></Tool>
	<div class="showpanel"></div>
</div>
</template>

<script>
import Tool from 'components/base/tool'
export default {
  components: {
    Tool
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
		left: 350px;
		width: 100%;
		height: 100%;
		border: 1px solid #ccc;
	}
</style>