## persistence-store

一个基于 `vuex` 的数据缓存处理，解决浏览器刷新时，状态管理中数据丢失问题。除阉割掉 `modules` 之外，其他使用方式和`vuex`几乎保持一致。


## 使用

```js
import persistenceStore from 'persistence-store'


Vue.use(persistenceStore, { namespace: 'am' })
const store = persistenceStore.store({
  state: {
    a: 1,
    b: {
      persistence: 'localStorage',
      default: {}
    },
    c: {
      persistence: 'sessionStorage',
      default: {}
    }
  },
  mutations: {
    a(state, payload) {
      console.log(state, payload)
    }
  },
  actions: {
    b(context, payload) {
      console.log(context, payload)
    }
  },
  getters: {
  }
})

new Vue({
  store,
  render: h => h(App)
}).$mount('#app')

```
`namespace`为必填参数，`persistenceStore.store` 接受参数`state、mutations、actions、getters`。 

其中 `state`中每一项参数如果为对象且对象中包含 `persistence` 时， `persistence` 可以支持三种类型 `none、localStorage、sessionStorage` 。
分别代表不使用缓存，使用 `localStorage` 和使用 `sessionStorage` 。如果使用缓存，则刷新浏览器时读取缓存，保留 `vuex` 中的状态。    
`mutations、actions、getters` 的使用同 `vuex` 一样。




