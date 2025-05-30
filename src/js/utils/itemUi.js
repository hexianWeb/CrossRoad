/**
 * 道具UI相关工具函数
 */

// ===== 常量定义 =====

// 道具类型与渐变色映射
const ITEM_TYPE_GRADIENTS = {
  SHOE: 'radial-gradient(ellipse at center, transparent 70%, rgba(255,0,0,0.7) 100%)', // 红色
  CLOCK: 'radial-gradient(ellipse at center, transparent 70%, rgba(0,120,255,0.7) 100%)', // 蓝色
  SHEID: 'radial-gradient(ellipse at center, transparent 70%, rgba(255,255,0,0.7) 100%)', // 黄色
  ZONGZI: 'radial-gradient(ellipse at center, transparent 70%, rgba(0,255,0,0.7) 100%)', // 绿色
}

// 道具图标映射
const ITEM_ICONS = {
  shoe: '/image/shoe.png',
  clock: '/image/clock.png',
  sheid: '/image/sheid.png',
  zongzi: '/image/zongzi.png',
  // 可扩展更多道具
}

const FLASH_TIME = 800 // ms，快结束时闪烁

// ===== 道具效果遮罩 =====

/**
 * 显示道具效果遮罩
 * @param {string} type 道具类型（SHOE/CLOCK/SHEID）
 * @param {number} duration 遮罩持续时间（毫秒）
 */
export function showItemEffectMask(type, duration) {
  const mask = document.getElementById('item-effect-mask')
  if (!mask)
    return

  // 设置椭圆渐变背景
  mask.style.background = ITEM_TYPE_GRADIENTS[type.toUpperCase()] || ITEM_TYPE_GRADIENTS.SHOE
  mask.style.display = 'block'
  mask.classList.remove('opacity-0')
  mask.classList.add('opacity-100')
  mask.classList.remove('animate-pulse', 'flash') // 移除旧动画

  // 清除旧定时器
  clearTimeout(mask._hideTimer)
  clearTimeout(mask._flashTimer)

  // 快结束时闪烁
  mask._flashTimer = setTimeout(() => {
    mask.classList.add('animate-pulse')
    mask.classList.add('flash') // 添加自定义闪烁效果
  }, duration - FLASH_TIME)

  // 遮罩结束时隐藏
  mask._hideTimer = setTimeout(() => {
    mask.classList.remove('animate-pulse', 'flash')
    mask.classList.remove('opacity-100')
    mask.classList.add('opacity-0')
    setTimeout(() => {
      mask.style.display = 'none'
    }, 300)
  }, duration)
}

// ===== 道具状态指示器 =====

// 存储激活的道具效果
const activeEffects = {}

/**
 * 获取或创建道具状态容器
 */
function getContainer() {
  let container = document.getElementById('item-effect-indicator')
  if (!container) {
    container = document.createElement('div')
    container.id = 'item-effect-indicator'
    document.body.appendChild(container)
  }
  // 响应式定位，PC右中，移动端右下
  container.className = `
    fixed right-6 top-1/2 -translate-y-1/2
    flex flex-col gap-4 z-[9999] transform
    select-none
    sm:right-6 sm:top-1/2 sm:-translate-y-1/2
    right-2 top-[60%] -translate-y-[60%]
  `.replace(/\s+/g, ' ')
  return container
}

/**
 * 渲染道具状态指示器
 */
function render() {
  const container = getContainer()
  container.innerHTML = ''
  Object.entries(activeEffects).forEach(([type, effect]) => {
    const item = document.createElement('div')
    item.className = `
      flex items-center justify-center bg-black/70 rounded-xl px-4 py-3 shadow-2xl pixel
      select-none
      pointer-events-none
      sm:px-4 sm:py-3
      px-2 py-2
    `.replace(/\s+/g, ' ')
    item.innerHTML = `
      <div class="w-16 h-16 mx-auto sm:w-16 sm:h-16 w-12 h-12 ">
        <img src="${effect.icon}" alt="${type}" class="w-full h-full object-contain" draggable="false" />
      </div>
      <span class="flex items-center justify-center text-white font-extrabold sm:text-4xl text-2xl drop-shadow mx-auto">${effect.remain}s</span>
    `
    container.appendChild(item)
  })
}

/**
 * 启动道具效果计时器
 */
function startEffect(type, duration) {
  const icon = ITEM_ICONS[type]
  if (!icon)
    return

  // 更新或创建效果状态
  if (activeEffects[type]) {
    clearInterval(activeEffects[type].timer)
    activeEffects[type].remain = Math.ceil(duration / 1000)
  }
  else {
    activeEffects[type] = {
      remain: Math.ceil(duration / 1000),
      icon,
      timer: null,
    }
  }

  // 启动倒计时
  activeEffects[type].timer = setInterval(() => {
    activeEffects[type].remain--
    if (activeEffects[type].remain <= 0) {
      clearInterval(activeEffects[type].timer)
      delete activeEffects[type]
      render()
    }
    else {
      render()
    }
  }, 1000)
  render()
}

/**
 * 显示道具状态UI（供外部调用）
 * @param {string} type 道具类型
 * @param {number} duration 持续时间（毫秒）
 */
export function showItemDom(type, duration) {
  startEffect(type, duration)
}
