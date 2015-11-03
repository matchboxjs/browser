module.exports = function fullScreen ( element, enable ){
  enable = enable == undefined || enable
  var fullscreenEvent = element.requestFullscreen
      ? "fullscreenchange" : element.webkitRequestFullScreen
      ? "webkitfullscreenchange" : "mozitfullscreenchange"

  function fullscreenchange(){
    document.removeEventListener(fullscreenEvent, fullscreenchange, false)
  }

  if( enable ){
    if( inFullScreen() ) return
    document.addEventListener(fullscreenEvent, fullscreenchange, false);
    (element.requestFullscreen || element.webkitRequestFullScreen).call(element)
  }
  else{
    if( !inFullScreen() ) return
    (document.cancelFullScreen || document.webkitCancelFullScreen)()
  }
}

function inFullScreen(){
  return !!(document.fullscreenElement || document.webkitFullscreenElement)
}
