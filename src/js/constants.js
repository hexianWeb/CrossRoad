export const MIN_TILE_INDEX = -12
export const MAX_TILE_INDEX = 12
export const tilesPerRow = MAX_TILE_INDEX - MIN_TILE_INDEX + 1

// 车辆X轴循环边界
export const CAR_BOUNDARY_MIN = -16
export const CAR_BOUNDARY_MAX = 16

// 地图生成数量
export const GENERATION_COUNT = 10

// 滑动判定的最小距离（像素），小于该值不触发滑动
export const SWIPE_THRESHOLD = 10

export const CLOCK_EFFECT_DURATION_MS = 5000 // 时停道具效果持续时间（毫秒）

// 时停道具效果倍率
export const TIME_MULTIPLIER = 0.1

export const SHEID_EFFECT_DURATION_MS = 5000 // 无敌盾道具效果持续时间（毫秒）

export const ZONGZI_EFFECT_DURATION_MS = 5000 // 粽子道具效果持续时间（毫秒）

export const SHOE_EFFECT_DURATION_MS = 7000 // 加速鞋道具效果持续时间（毫秒）

export const SPEEDUP_STEP_TIME = 0.11 // 加速状态下单步时长（秒）
export const NORMAL_STEP_TIME = 0.2 // 正常单步时长（秒）

// Supabase 配置，敏感信息请放在 .env 文件中，并通过 Vite 环境变量读取
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
export const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY
export const SUPABASE_TABLE = import.meta.env.VITE_SUPABASE_TABLE || 'leaderboard'
