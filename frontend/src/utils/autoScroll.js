let scrollBottomTimer = null
let mobileStartX = 0
let mobileStartY = 0
/**
 * 处理向上向下滚动业务逻辑
 * @event 事件对象
 * @id Dom操作对象id值
 * @distance 距离底部多少时触发
 */
function scrollFunc(event, id, distance) {
  const e = event || window.event
  if (e.wheelDelta) {
    if (e.wheelDelta > 0) {
      // 当鼠标滚轮向上滚动时
      clearScrollBottomTimer()
    }
    if (e.wheelDelta < 0) {
      // 当鼠标滚轮向下滚动时
      const ele = document.getElementById(id)
      if (!ele) return
      if (!scrollBottomTimer && ele.clientHeight + ele.scrollTop >= ele.scrollHeight - distance) {
        scrollBottom(id)
      }
    }
  } else if (e.detail) {
    if (e.detail < 0) {
      // 当鼠标滚轮向上滚动时
      clearScrollBottomTimer()
    }
    if (e.detail > 0) {
      // 当鼠标滚轮向下滚动时
      const ele = document.getElementById(id)
      if (!ele) return
      if (!scrollBottomTimer && ele.clientHeight + ele.scrollTop >= ele.scrollHeight - distance) {
        scrollBottom(id)
      }
    }
  }
}

/**
 * 处理向上向下滚动业务逻辑
 * @event 事件对象
 * @id Dom操作对象id值
 */
function scrollMobileStartFunc(event, id) {
  mobileStartX = event.changedTouches[0].pageX
  mobileStartY = event.changedTouches[0].pageY
}

function scrollMobileMoveFunc(event, id, distance) {
  const moveEndX = event.changedTouches[0].pageX
  const moveEndY = event.changedTouches[0].pageY
  const X = moveEndX - mobileStartX
  const Y = moveEndY - mobileStartY

  if (Math.abs(X) > Math.abs(Y)) {
    if (X > 0) {
      // 向右
      // console.log('向右')
    } else if (X < 0) {
      // 向左
      // console.log('向左')
    }
  } else if (Math.abs(X) < Math.abs(Y)) {
    // 认定为垂直方向滑动
    if (Y > 0) {
      // 向下
      // console.log('向下')
      clearScrollBottomTimer()
    } else if (Y < 0) {
      // 向上
      // console.log('向上')
      const ele = document.getElementById(id)
      if (!ele) return
      if (!scrollBottomTimer && ele.clientHeight + ele.scrollTop >= ele.scrollHeight - distance) {
        scrollBottom(id)
      }
    }
  } else {
    console.log('just touch')
  }
}

/**
 * 绑定滚动监听
 * @id Dom操作对象id值
 */
export function listenWheel(id, mobile = false, distance = 0) {
  const ele = document.getElementById(id)
  if (!ele) return
  if (mobile) {
    // 针对移动端
    ele.addEventListener('touchstart', event => scrollMobileStartFunc(event, id))
    ele.addEventListener('touchmove', event => scrollMobileMoveFunc(event, id, distance))
  } else {
    // 针对PC端
    //    给页面绑定鼠标滚轮事件,针对火狐的非标准事件
    ele.addEventListener('DOMMouseScroll', event => scrollFunc(event, id, distance))
    //    给页面绑定鼠标滚轮事件，针对Google，mousewheel非标准事件已被弃用，请使用 wheel事件代替
    ele.addEventListener('wheel', event => scrollFunc(event, id, distance))
    //    ie不支持wheel事件，若一定要兼容，可使用mousewheel
    ele.addEventListener('mousewheel', event => scrollFunc(event, id, distance))
  }
}

/**
 * 解绑滚动监听
 * @id Dom操作对象id值
 */
export function removeListenWheel(id, mobile = false, distance = 0) {
  const ele = document.getElementById(id)
  if (!ele) return
  if (mobile) {
    // 针对移动端
    ele.removeEventListener('touchstart', event => scrollMobileStartFunc(event, id))
    ele.removeEventListener('touchmove', event => scrollMobileMoveFunc(event, id, distance))
  } else {
    // 针对PC端
    ele.removeEventListener('DOMMouseScroll', event => scrollFunc(event, id, distance))
    ele.removeEventListener('wheel', event => scrollFunc(event, id, distance))
    ele.removeEventListener('mousewheel', event => scrollFunc(event, id, distance))
  }
}

/**
 * 开始向下滚动
 * @id Dom操作对象id值
 */
export function scrollBottom(id) {
  const ele = document.getElementById(id)
  if (!ele) return
  clearScrollBottomTimer()
  scrollBottomTimer = setInterval(() => {
    // 判断元素是否出现了滚动条
    if (ele.scrollHeight > ele.clientHeight) {
      // 设置滚动条到最底部
      ele.scrollTop = ele.scrollHeight
    }
  }, 20)
}

/**
 * 清除滚动定时器
 */
export function clearScrollBottomTimer() {
  if (scrollBottomTimer) {
    clearInterval(scrollBottomTimer)
    scrollBottomTimer = null
  }
}
