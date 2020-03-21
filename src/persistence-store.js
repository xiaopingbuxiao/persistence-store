import Vuex from 'vuex'
/* eslint-disable */

let NAME_SPACE;
export default {
  install(Vue, { namespace }) {
    if (namespace) {
      NAME_SPACE = namespace;
      Vue.use(Vuex)
    } else {
      throw new Error('必须传入namespace')
    }
  },
  store(options) {
    let { state, actions, mutations, getters } = options
    state = normalizeData(state)
    const { computedState, computedMutations, computedActions } = generateStore(state, actions, mutations)
    return new Vuex.Store({
      actions: computedActions,
      mutations: computedMutations,
      state: computedState,
      getters
    })
  }
}

function normalizeData(state) {
  let obj = {};
  Object.keys(state).forEach(key => {
    const value = state[key]
    if (!isObject(value)) {
      obj[key] = { default: value, persistence: 'none' }
    } else {
      if (Object.prototype.hasOwnProperty.call(value, 'persistence')) {
        obj[key] = value
      } else {
        obj[key] = { default: value, persistence: 'none' }
      }
    }
  })
  return obj
}

function generateStore(state, actions, mutations) {
  let computedState = {}
  let computedActions = {}
  let computedMutations = {}

  Object.keys(state).forEach(key => {
    const value = state[key]
    computedState[key] = getFromStorage(window.localStorage, NAME_SPACE, key) || getFromStorage(window.sessionStorage, NAME_SPACE, key) || value.default
    computedMutations[key] = function (storeState, payload) {
      storeState[key] = payload
      refeshCache(NAME_SPACE, state[key].persistence, key, payload)
      typeof mutations[key] === 'function' && mutations[key].apply(this, arguments)
    }
    computedActions[key] = function (context, payload) {
      context.commit(key, payload)
      typeof actions[key] === 'function' && actions[key].apply(this, arguments)
    }
  })
  return {
    computedState,
    computedMutations,
    computedActions
  }
}

function refeshCache(NAME_SPACE, persistence, key, value) {
  if (persistence === 'localStorage') {
    saveToStorage(window.localStorage, NAME_SPACE, key, value)
  } else if (persistence === 'sessionStorage') {
    saveToStorage(window.sessionStorage, NAME_SPACE, key, value)
  }
}



function getFromStorage(storage, namespace, key) {
  let data = storage.getItem(namespace)
  if (!data) {
    return undefined
  }
  data = JSON.parse(data)
  return data[key]
}

function saveToStorage(storage, namespace, key, value) {
  let data = storage.getItem(namespace)
  data = data ? JSON.parse(data) : {}
  data[key] = value
  storage.setItem(namespace, JSON.stringify(data))
  return value
}

function isObject(obj) {
  return Object.prototype.toString.call(obj) === "[object Object]"
}