<template>
	<div class="showJson">
		{{json}}
	</div>
</template>

<script>
export default {
  props: {
    json: {
      type: Object,
      default: ''
    }
  }
}
</script>

<style>
	.showJson{
		position: absolute;
		top: 40px;
    bottom: 0;
    right: 0;
		width: 300px;
		border: 1px solid #222;
		background-color: #222;
		color: #eee;
    padding: 20px 10px 10px;
    overflow: scroll;
    font-size: 1em;
    word-wrap: break-word;
	}
</style>