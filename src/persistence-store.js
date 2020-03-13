/* eslint-disable no-unused-vars */
import Vuex from 'vuex'

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
    computedState[key] = cache.getFromLocalStorage(key) || cache.getFromSessionStorage(key) || value.default

    let refeshCache = () => { }

    switch (value.persistence) {
      case 'localStorage':
        cache.saveToLocalStorage(key, computedState[key])
        refeshCache = (key, value) => {
          cache.saveToLocalStorage(key, value)
        }
        break;
      case 'sessionStorage':
        cache.saveToSessionStorage(key, computedState[key])

        refeshCache = (key, value) => {
          cache.saveToSessionStorage(key, value)
        }
        break;
      default:
        break;
    }

    computedMutations[key] = function (storeState, payload) {
      storeState[key] = payload
      refeshCache(key, payload)
      typeof mutations[key] === 'function' ? mutations[key].apply(this, arguments) : loop()
    }
    computedActions[key] = function (context, payload) {
      context.commit(key, payload)
      typeof actions[key] === 'function' ? actions[key].apply(this, arguments) : loop()
    }
  })
  return {
    computedState,
    computedMutations,
    computedActions
  }
}


const cache = {
  getFromLocalStorage(key) {
    return getFromStorage(window.localStorage, NAME_SPACE, key)
  },
  getFromSessionStorage(key) {
    return getFromStorage(window.sessionStorage, NAME_SPACE, key)
  },
  saveToSessionStorage(key, value) {
    return saveToStorage(window.sessionStorage, NAME_SPACE, key, value)
  },
  saveToLocalStorage(key, value) {
    return saveToStorage(window.localStorage, NAME_SPACE, key, value)
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

function loop() { }

