import * as types from './mutation-types'

const mutations = {
  [types.SET_TOOLLIST](state, toolList) {
    // console.log('in')
    state.toolList = toolList
    // console.log(state.socketConnectedFlag === true)
  }
}

export default mutations