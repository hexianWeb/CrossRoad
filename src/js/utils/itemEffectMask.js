// 道具类型与 Tailwind 渐变色映射
const ITEM_TYPE_GRADIENTS = {
  SHOE: 'radial-gradient(ellipse at center, transparent 70%, rgba(255,0,0,0.7) 100%)', // 红色
  CLOCK: 'radial-gradient(ellipse at center, transparent 70%, rgba(0,120,255,0.7) 100%)', // 蓝色
  SHEID: 'radial-gradient(ellipse at center, transparent 70%, rgba(255,255,0,0.7) 100%)', // 黄色
}

const FLASH_TIME = 800 // ms，快结束时闪烁

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
    // 如需更强烈闪烁可用自定义 .flash
    mask.classList.add('flash')
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
