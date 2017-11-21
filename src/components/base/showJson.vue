<template>
	<div class="showJson">
		{{this.data}}
	</div>
</template>

<script>
export default {
  data() {
    return {
      // data: ''
    }
  },
  props: {
    json: {
      type: Object,
      default: ''
    }
  },
  mounted() {
    // this.ArrayToJson(this.json)
  },
  methods: {
    // ArrayToJson(json) {
    //   console.log('in')
    //   console.log(json)
    //   this.data = JSON.stringify(json)
    //   console.log(this.data)
    // }
  },
  computed: {
    data() {
      console.log('in')
      let str = JSON.stringify(this.json)
      console.log(str)
      return str
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