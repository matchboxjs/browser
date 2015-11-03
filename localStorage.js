var localStorage = window.localStorage

function accessor( path ){
  var parts = path.split(".")
  var head = parts.shift()
  var tail = parts.pop() || null
  return {
    head: head,
    tail: tail,
    parts: parts,
    main: localStorage[head] || null
  }
}

function accessValue( path ){
  var a = accessor(path)
  var parts = a.parts
  var head = a.head
  var tail = a.tail
  var main = a.main
  try{
    main = JSON.parse(main)
  }
  catch( e ){
    //console.error("Invalid storage value", main)
    throw new Error("Invalid storage value")
  }
  var value = main
  var end = main
  try{
    while( parts.length ){
      value = value[parts.shift()]
    }
    if( tail ) {
      end = value[tail]
    }
  }
  catch( e ){
    //console.error("Invalid storage accessor", path)
    throw new Error("Invalid storage accessor '" + path + "'")
  }
  return {
    main: main,
    head: head,
    tail: tail,
    value: value,
    end: end
  }
}

var jsonStorage = {}

if( typeof module != "undefined" ) module.exports = jsonStorage
else window.jsonStorage = jsonStorage

jsonStorage.localStorage = {}

jsonStorage.contains = function( path ){
  return accessValue(path).end != null
}
jsonStorage.exists = function( path ){
  try{
    return accessValue(path).end != null
  }
  catch( e ){
    return false
  }
}
jsonStorage.create = function( path ){
  var a = accessor(path)
  var main = localStorage[a.head]
  if( main ){
    try{
      main = JSON.parse(main)
    }
    catch( e ){
      console.error("Error creating path")
      console.error(e)
      main = {}
    }
  }
  else {
    main = {}
  }
  var obj = main
  var part
  while( a.parts.length ){
    part = a.parts.shift()
    obj[part] = obj[part] || {}
    obj = obj[part]
  }
  if( a.tail ) {
    obj[a.tail] = {}
  }
  jsonStorage.localStorage[a.head] = main
  localStorage[a.head] = JSON.stringify(main)
  return main
}
jsonStorage.get = function( path ){
  return accessValue(path).end
}
jsonStorage.equals = function( path, value ){
  return accessValue(path).end === value
}
jsonStorage.remove = function( path ){
  var so = accessValue(path)
  if( so.tail ){
    delete so.value[so.tail]
    localStorage[so.head] = JSON.stringify(so.main)
  }
  else {
    delete localStorage[so.head]
  }
}
jsonStorage.set = function( path, value ){
  var a = accessor(path)
  // first call to ("key", "value")
  if( a.main === null && a.tail === null ){
    localStorage[a.head] = JSON.stringify(value)
    jsonStorage.localStorage[a.head] = value
  }
  else {
    var so = accessValue(path)
    if( so.tail ){
      // ("key.nested", "value")
      so.value[so.tail] = value
    }
    else {
      // ("key", "value")
      so.main = value
    }
    localStorage[so.head] = JSON.stringify(so.main)
    jsonStorage.localStorage[a.head] = so.main
  }
}
jsonStorage.access = function( path, access ){
  var a = accessor(path)
  var result
  if( a.main === null && a.tail === null ){
    localStorage[a.head] = JSON.stringify(access())
  }
  else {
    var so = accessValue(path)
    result = access(so.end)
    if( so.tail ){
      if( typeof result != "undefined" ) so.value[so.tail] = result
    }
    else {
      if( typeof result != "undefined" ) so.main = result
    }
    localStorage[so.head] = JSON.stringify(so.main)
  }
}
jsonStorage.push = function( path, value ){
  jsonStorage.access(path, function( arr ){
    arr.push(value)
  })
}
jsonStorage.concat = function( path, value ){
  jsonStorage.access(path, function( arr ){
    return arr.concat(value)
  })
}
jsonStorage.merge = function( path, ext ){
  jsonStorage.access(path, function( obj ){
    for( var prop in ext ){
      if( ext.hasOwnProperty(prop) ){
        obj[prop] = ext[prop]
      }
    }
  })
}
jsonStorage.update = function( path, defaults, update ){
  if( typeof defaults == "function" ){
    update = defaults
    defaults = {}
  }
  if( !jsonStorage.exists(path) ){
    jsonStorage.create(path)
    jsonStorage.set(path, defaults||{})
  }
  var data = jsonStorage.get(path)
  update(data)
  jsonStorage.set(path, data)
  return data
}
jsonStorage.resolvePath = function(){
  return [].join.call(arguments, ".")
}
