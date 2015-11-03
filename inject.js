var registry = {}
var LOADING = 1
var LOADED = 2
var listeners = {}

function isLoaded (src) {
  return registry[src] == LOADED
}

function isLoading (src) {
  return registry[src] == LOADING
}

function startLoading (src) {
  registry[src] = LOADING
}

function finishLoaded (src) {
  registry[src] = LOADED
}

var inject = module.exports = {}

inject.script = function injectScript(src) {
  if (Array.isArray(src)) {
    return Promise.all(src.map(injectScript))
  }

  if (isLoaded(src)) {
    return Promise.resolve()
  }

  if (isLoading(src)) {
    return listeners[src]
  }

  startLoading(src)

  return listeners[src] = new Promise(function (resolve, reject) {
    var script = document.createElement("script")
    script.onload = function () {
      resolve()
      finishLoaded(src)
    }
    script.onerror = function () {
      reject()
      finishLoaded(src)
    }
    script.async = true
    script.src = src
    document.head.insertBefore(script, document.head.firstChild)
  })
}
