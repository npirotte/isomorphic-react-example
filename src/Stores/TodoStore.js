import Reflux from 'reflux'

import TodoActions from '../Actions/TodoActions.js'

import request from '../Helpers/Request'

var todoCounter = 0

const ENDPOINT = 'http://localhost:4000/tasks'

const LOCAL_STORAGE_KEY = 'todos'

function getItemByKey (list, itemKey) {
  return list.find(function (item) {
    return item.key === itemKey
  })
}

const TodoListStore = Reflux.createStore({
  listenables: [TodoActions],

  init: function () {
    var loadedList
    try {
      loadedList = window.localStorage.getItem(LOCAL_STORAGE_KEY)
    } catch (e) {

    }

    if (!loadedList) {
      this.list = []
    } else {
      this.list = JSON.parse(loadedList).map(function (todo) {
        todo.key = todoCounter++
        return todo
      })
    }
  },

  onAddItem: function (label, cb) {
    var todo = new Todo(label)
    this.updateList([todo].concat(this.list))

    request.post({
      url: ENDPOINT,
      method: 'POST',
      type: 'application/x-www-form-urlencoded',
      data: todo
    }, cb)
  },

  onRemoveItem: function (itemKey, cb) {
    this.updateList(this.list.filter(function (todo) {
      return todo.key !== itemKey
    }))

    request.delete({
      url: ENDPOINT + '/' + itemKey
    }, cb)
  },

  onToggleItem: function (itemKey) {
    var item = getItemByKey(this.list, itemKey)
    if (item) {
      item.isCompleted = !item.isCompleted
    }

    request.put({
      url: ENDPOINT + '/' + itemKey,
      data: item
    })

    this.updateList(this.list)
  },

  onClearCompleted: function () {
    this.updateList(this.list.filter(function (todo) {
      return !todo.isCompleted
    }))
  },

  updateList: function (list) {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list))
    }

    this.list = list
    this.trigger(list)
  },

  getDefaultData: function () {
    return this.list
  },

  fetchData: function (cb) {
    request.get({
      url: 'http://localhost:4000/tasks'
    }, (err, res) => {
      if (err) {
        return
      }
      if (typeof cb === 'function') {
        var list = res.map(function (task) {
          // booleean in json response is interpreted as a string instead of a booleean
          task.isCompleted = task.isCompleted == 'true' // eslint-disable-line

          if (Number(task.key) > todoCounter) {
            todoCounter = Number(task.key) + 1
          }
          return task
        })
        this.updateList(list)
        cb(null, list)
      }
    })
  }
})

TodoListStore.getDefaultData()

function Todo (label) {
  return {
    key: todoCounter++,
    created: new Date(),
    isCompleted: false,
    label: label
  }
}

export default TodoListStore
