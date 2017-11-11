<template>
<div >
	<div class="tool">
		<div v-for="item in toolList" class="library-section" >
            <div class="menu-header">
                <a>{{item.listName}}</a>
                <!-- <span class="iconfont icon-more" v-show="!item.displayFlag" @click="toggleDisplay(item)"></span>
                <span class="iconfont icon-moreunfold" v-show="item.displayFlag" @click="toggleDisplay(item)"></span> -->
            </div>
            <div class="library-content" >
                <ul class="liblist">    
                    <div v-for="i in item.listContent" class="library-module dragicon" draggable="true" @dragend="dragend(i)">
                        <img class="libicon" :src="i.iconImg"></img>
                        <a class="serv-name" title="">{{i.servName}}</a>
                    </div>
                    <div style="clear:both;"></div>
                </ul>
            </div>
        </div>
	</div>
</div>
</template>

<script>
import {mapMutations, mapGetters} from 'vuex'
export default {
  data() {
    return {
    }
  },
  created() {
    this.getList()
  },
  computed: {
    ...mapGetters([
      'toolList'
    ])
  },
  methods: {
    ...mapMutations({
      settoolList: 'SET_TOOLLIST'
    }),
    getList() {
      this.$http.get('../../../static/lsceList.json').then(function(res) {
        this.settoolList(res.body.list)
        // console.log(this.toolList)
      })
    },
    dragend(i) {
      event.preventDefault()
      this.$emit('droped', i)
    }
  }
}
</script>

<style>
	.tool{
		position: absolute;
		top: 40px;
    bottom: 0;
		width: 330px;
		/*height: 100%;*/
		border: 1px solid #ccc;
		background: #fbfbff;
    padding: 20px 10px 10px;
    overflow: scroll;
    font-size: 1em;
	}
	.library-section{
    line-height: 25px;
    display: block;
    width: 100%;
	}
	.menu-header{
	    border: 1px solid #aaa;
	    border-radius: 4px;
	    padding-left: 1em;
	    font-size: 14px;
	    margin: 10px 15px 10px 0;
	}
	.library-content{
    display: block;
	}
	.liblist{
	    padding-top: 10px;
	    display: block;
	    padding-left: 0px;
	}
	.library-module{
	    float: left;
	    margin-bottom: 10px;
	    width: 70px;
	    text-align: center;
	    /*word-wrap:break-word;*/
	    overflow: hidden;
	}
	.libicon{
    background-position: 0px 0px;
    margin: 0 auto;
    background-size:50px 50px;
    width: 50px;
    height: 50px;
	}
	.serv-name{
		display: block;
	  color: #aaa;
	  font-weight: normal;
	  font-size: 11px;
	  line-height: 11px;
	}
</style>