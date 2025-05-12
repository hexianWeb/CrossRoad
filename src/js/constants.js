export const minTileIndex = -12
export const maxTileIndex = 12
export const tilesPerRow = maxTileIndex - minTileIndex + 1

// 车辆X轴循环边界
export const CAR_BOUNDARY_MIN = -12
export const CAR_BOUNDARY_MAX = 12

// 地图生成数量
export const GENERATION_COUNT = 10

// 滑动判定的最小距离（像素），小于该值不触发滑动
export const SWIPE_THRESHOLD = 10

export const CLOCK_EFFECT_DURATION_MS = 5000 // 时停道具效果持续时间（毫秒）

// 时停道具效果倍率
export const TIME_MULTIPLIER = 0.1

export const SHEID_EFFECT_DURATION_MS = 10000 // 无敌盾道具效果持续时间（毫秒）

export const SHOE_EFFECT_DURATION_MS = 10000 // 加速鞋道具效果持续时间（毫秒）
export const SPEEDUP_STEP_TIME = 0.05 // 加速状态下单步时长（秒）
export const NORMAL_STEP_TIME = 0.2 // 正常单步时长（秒）
