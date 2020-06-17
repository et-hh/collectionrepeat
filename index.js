(function(){
  const wrapElm = document.querySelector('.wrap')

  const dataLen = 100000
  const data = []
  for(let i = 0; i < dataLen; i++) {
    data.push(i)
  }

  const domHeight = 33
  const domCache = []
  const domCacheLength = 200
  const BoundaryCount = 50
  const totalHeight = domCacheLength * domHeight
  const listWraper = document.createElement('div')
  listWraper.className = 'list-wraper'
  const scrollBar = document.createElement('div')
  scrollBar.className = 'scroll-bar'

  for (let i = 0; i < domCacheLength; i++) {
    const div = document.createElement('div')
    div.innerText = data[i]
    div.className = 'item'
    domCache.push(div)
    listWraper.appendChild(div)
  }

  wrapElm.appendChild(listWraper)
  wrapElm.appendChild(scrollBar)

  const listWraperHeight = listWraper.offsetHeight
  const visibleItemCount = Math.ceil(listWraperHeight/domHeight)
  const scrollBarHeight = Math.max(60, (listWraperHeight / totalHeight) * listWraperHeight)
  scrollBar.style.height = scrollBarHeight + 'px'

  const maxMoveCount = Math.floor((domCacheLength - visibleItemCount) / 2 - BoundaryCount)

  let currentIndex = 0
  let cacheIndex = 0

  let lastScrollTop = 0, currentScrollTop = 0

  let selectDom
  let selectIndex

  function resetSelectDom() {
    if(selectDom) {
      selectDom.className = 'item'
    }

    const sIndex = +domCache[0].innerText
    if (selectIndex >= sIndex && selectIndex <= sIndex + domCacheLength - 1) {
      selectDom = domCache[selectIndex - sIndex]
      selectDom.className = 'item selected'
    }
  }

  function putTopDomToBottom() {
    // console.log('------------------------------------putTopDomToBottom  321---------------------------------')
    // console.log('currentScrollTop', currentScrollTop)
    // console.log('currentIndex', currentIndex)
    // console.log('cacheIndex', cacheIndex)
    const fragment = document.createDocumentFragment()
    const moveCount = Math.min(dataLen - (currentIndex + domCacheLength - 1 - cacheIndex) - 1, maxMoveCount)
    for (let i = 0; i < moveCount; i++) {
      const dom = domCache.shift()
      dom.innerText = data[currentIndex + (domCacheLength - cacheIndex - 1) + 1 + i]
      fragment.appendChild(dom)
      domCache.push(dom)
    }

    resetSelectDom()

    listWraper.appendChild(fragment)
    // console.log(domCache.map(dom => dom.innerText))
  }

  function putBottomDomToTop() {
    // console.log('------------------------------------putBottomDomToTop  123---------------------------------')
    // console.log('currentScrollTop', currentScrollTop)
    // console.log('currentIndex', currentIndex)
    // console.log('cacheIndex', cacheIndex)
    const fragment = document.createDocumentFragment()
    const moveCount = Math.min(currentIndex - cacheIndex, maxMoveCount)
    for (let i = 0; i < moveCount; i++) {
      const dom = domCache.pop()
      dom.innerText = data[currentIndex - cacheIndex - 1 - i]
      fragment.prepend(dom)
      domCache.unshift(dom)
    }

    resetSelectDom()

    listWraper.prepend(fragment)
    // console.log(domCache.map(dom => dom.innerText))
  }

  const upperSide = BoundaryCount * domHeight
  const downSide = (domCacheLength - BoundaryCount - visibleItemCount) * domHeight

  let isScroll = false, startY
  const maxTop = listWraperHeight - scrollBarHeight
  const maxIndex = dataLen - Math.ceil(listWraperHeight/domHeight)
  const maxCount = domCacheLength - Math.ceil(listWraperHeight/domHeight)
  const maxScrollHeight = listWraper.scrollHeight

  function listScroll() {
    console.log('scroll')
    currentScrollTop = listWraper.scrollTop
    cacheIndex = Math.floor(currentScrollTop / domHeight)
    currentIndex = +domCache[cacheIndex].innerText
    scrollBar.style.top = Math.min(currentIndex / (dataLen - visibleItemCount), 1) * maxTop + 'px'
    if (currentScrollTop > lastScrollTop) {
      // 向下滚动时，如果底部只剩下50个元素，并且底部还剩下超过50条数据，就从顶部挪过来一部分元素，保持页面的上下对称
      if (currentScrollTop >= downSide && currentIndex < dataLen - 1) {
        putTopDomToBottom()
      }
    } else if (currentScrollTop < lastScrollTop) {
      // 向上滚动时，如果顶部只剩下50个元素，并且顶部还剩下超过50条数据，就从底部挪过来一部分元素，保持页面的上下对称
      if (currentScrollTop <= upperSide && currentIndex > 0) {
        putBottomDomToTop()
      }
    }
    lastScrollTop = currentScrollTop
    document.onkeydown = keydownFun
  }

  // 当用鼠标滚动
  listWraper.addEventListener('scroll', listScroll)

  scrollBar.addEventListener('mousedown', function(e) {
    isScroll = true
    startY = e.pageY
    listWraper.removeEventListener('scroll', listScroll)
  })
  document.body.addEventListener('mousemove', function(e) {
    if (!isScroll) return
    const offsetY = e.pageY - startY

    const curTop = parseFloat(scrollBar.style.top) || 0
    const toTop = Math.max(0, Math.min(maxTop, curTop + offsetY))
    scrollBar.style.top = toTop + 'px'

    const startIndex = toTop === 0 ? 0 : toTop === maxTop ? maxIndex : Math.floor((toTop / maxTop) * maxIndex) // 当前可视区域顶端索引
    const topCount = toTop === 0 ? 0 : toTop === maxTop ? maxCount : Math.floor((toTop / maxTop) * maxCount)// 可视区域顶部以上元素条数
    const scrollPos = toTop === 0 ? 0 : toTop === maxTop ? maxScrollHeight : Math.floor((toTop / maxTop) * maxScrollHeight)// wrapper滚动位置
    for (let i = 0; i < domCacheLength; i++) {
      const dom = domCache[i]
      dom.innerText = data[startIndex - topCount + i]
    }
    startY = e.pageY
    currentIndex = startIndex

    listWraper.scrollTo({
      top: scrollPos
    })

    resetSelectDom()
  })
  document.body.addEventListener('mouseup', function(e) {
    isScroll = false
    listWraper.addEventListener('scroll', listScroll)
  })

  document.body.addEventListener('click', function(e) {
    if(e.target.className.includes('item')) {
      if (selectDom) {
        selectDom.className = 'item'
      }
      selectDom = e.target
      selectIndex = +selectDom.innerText
      selectDom.className = 'item selected'
    }
  })

  function keydownFun(e) {
    e.preventDefault()
    if (e.keyCode === 38) {
      const preVisible = selectIndex >= currentIndex && selectIndex <= currentIndex + visibleItemCount - 1
      selectIndex -= 1
      selectIndex = Math.min(dataLen - 1, Math.max(0, selectIndex))

      if (selectIndex < currentIndex && preVisible) {
        document.onkeydown = function(){}
        listWraper.scrollTo({
          top: listWraper.scrollTop - (currentIndex - selectIndex) * domHeight
        })
      }

      resetSelectDom()
    } else if (e.keyCode === 40) {
      const preVisible = selectIndex >= currentIndex && selectIndex <= currentIndex + visibleItemCount - 1
      selectIndex += 1
      selectIndex = Math.min(dataLen - 1, Math.max(0, selectIndex))
      if (selectIndex > currentIndex + visibleItemCount - 1 && preVisible) {
        document.onkeydown = function(){}
        listWraper.scrollTo({
          top: listWraper.scrollTop + (selectIndex - (currentIndex + visibleItemCount - 1)) * domHeight
        })
      }
      resetSelectDom()
    }
  }
  document.onkeydown = keydownFun
})()
