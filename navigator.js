var URL = require("url");
var qs = require("qs")

module.exports = Navigator

function Navigator (url) {
  if (!(this instanceof Navigator)) {
    return new Navigator(url)
  }
  this.url = URL.parse(url||location.href)
  this.query = qs.parse(this.url.query||"")
}

Navigator.prototype = {
  pathname: function (p) {
    this.url.pathname = p
    return this
  },
  setQuery: function (name, value) {
    this.query[name] = value
    return this
  },
  removeQuery: function (name) {
    delete this.query[name]
    return this
  },
  replaceQuery: function (name, value) {
    return this.clearQuery().setQuery(name, value)
  },
  clearQuery: function () {
    this.query = {}
    return this
  },
  hasQuery: function (name) {
    return !!this.query[name]
  },
  getQuery: function () {
    var query = qs.stringify(this.query)
    return query ? "?"+query : ""
  },
  getPath: function () {
    return this.url.pathname + this.getQuery()
  },
  getHref: function () {
    return this.url.pathname + this.getQuery()
  },
  apply: function () {
    window.location.href = this.getHref()
  }
}
