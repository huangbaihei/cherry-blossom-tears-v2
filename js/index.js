const documentReady = (fn) => {
  if (document.addEventListener) { // 标准浏览器
    document.addEventListener('DOMContentLoaded',  function cb() {
      document.removeEventListener('DOMContentLoaded', cb, false)
      fn()
    }, false)
  } else if (document.attachEvent) { // IE浏览器
    document.attachEvent('onreadystatechange', function cb() {
      if (document.readyState == 'complete') {
        document.detachEvent('onreadystatechange', cb)
        fn()
      }
    })
  }
}

documentReady(() => new CherryBlossomsRender().init())
