import { CAR_BOUNDARY_MAX, CAR_BOUNDARY_MIN, MAX_TILE_INDEX, MIN_TILE_INDEX, SWIPE_THRESHOLD } from '../constants'
import { ITEM_TYPES } from './ItemManager.js' // 引入道具类型

// 随机生成 N 行地图元数据

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getRandomFromArray(arr) {
  return arr[getRandomInt(0, arr.length - 1)]
}

/**
 * 随机生成 N 行地图元数据
 * @param {*} startRowIndex 起始行索引
 * @param {*} N 行数
 * @returns
 */
export default function generateMetaRows(startRowIndex, N = 20) {
  const rows = []
  for (let i = 0; i < N; i++) {
    // 随机决定行类型
    const isForest = Math.random() < 0.5
    if (isForest) {
      // forest 行
      const treeCount = getRandomInt(0, 5)
      const usedTileIndex = new Set()
      const trees = []
      while (trees.length < treeCount) {
        const tileIndex = getRandomInt(MIN_TILE_INDEX, MAX_TILE_INDEX)
        if (!usedTileIndex.has(tileIndex)) {
          usedTileIndex.add(tileIndex)
          trees.push({
            tileIndex,
            type: `tree0${getRandomInt(1, 4)}`,
          })
        }
      }
      // 生成道具 items
      const items = []
      const itemTypes = [ITEM_TYPES.CLOCK, ITEM_TYPES.RANDOM, ITEM_TYPES.SHEID, ITEM_TYPES.SHOE, ITEM_TYPES.ZONGZI]
      const itemCount = Math.random() < 0.2 ? getRandomInt(1, 2) : 0 // 20%概率 1~2个
      const usedItemTileIndex = new Set([...usedTileIndex])
      let tryCount = 0
      while (items.length < itemCount && tryCount < 10) {
        const tileIndex = getRandomInt(MIN_TILE_INDEX, MAX_TILE_INDEX)
        if (!usedItemTileIndex.has(tileIndex)) {
          usedItemTileIndex.add(tileIndex)
          items.push({
            tileIndex,
            type: getRandomFromArray(itemTypes),
          })
        }
        tryCount++
      }
      rows.push({
        type: 'forest',
        trees,
        items,
      })
    }
    else {
      // road 行
      const carCount = getRandomInt(1, 4)
      const usedTileIndex = []
      const vehicles = []
      // 只允许偶数 tileIndex
      const evenTileIndices = []
      for (let idx = CAR_BOUNDARY_MIN + 2; idx <= CAR_BOUNDARY_MAX - 2; idx++) {
        if (idx % 2 === 0)
          evenTileIndices.push(idx)
      }
      while (vehicles.length < carCount) {
        let tileIndex
        let valid = false
        while (!valid) {
          tileIndex = getRandomFromArray(evenTileIndices)
          valid = usedTileIndex.every(idx => Math.abs(idx - tileIndex) > 1)
          if (valid)
            usedTileIndex.push(tileIndex)
        }
        vehicles.push({
          initialTileIndex: tileIndex,
          type: `car0${getRandomInt(1, 8)}`,
        })
      }
      // 生成道具 items
      const items = []
      const itemTypes = [ITEM_TYPES.CLOCK, ITEM_TYPES.RANDOM, ITEM_TYPES.SHEID, ITEM_TYPES.SHOE, ITEM_TYPES.ZONGZI]
      const itemCount = Math.random() < 0.2 ? getRandomInt(1, 2) : 0 // 20%概率 1~2个
      const usedItemTileIndex = new Set([...usedTileIndex])
      let tryCount = 0
      while (items.length < itemCount && tryCount < 10) {
        const tileIndex = getRandomInt(MIN_TILE_INDEX, MAX_TILE_INDEX)
        if (!usedItemTileIndex.has(tileIndex)) {
          usedItemTileIndex.add(tileIndex)
          items.push({
            tileIndex,
            type: getRandomFromArray(itemTypes),
          })
        }
        tryCount++
      }
      rows.push({
        type: 'road',
        direction: Math.random() < 0.5,
        speed: 1,
        vehicles,
        items,
      })
    }
  }

  return rows
}

/**
 * 根据移动方向获取目标旋转角度
 * @param {string} dir 方向（forward/left/right/backward）
 * @returns {number} 旋转角度（弧度）
 */
export function getTargetRotation(dir) {
  if (dir === 'forward')
    return Math.PI
  if (dir === 'left')
    return -Math.PI / 2
  if (dir === 'right')
    return Math.PI / 2
  if (dir === 'backward')
    return 0
  return 0
}

/**
 * 判断目标格子是否为有效位置
 * @param {{x:number, z:number}} targetTile 目标格子坐标
 * @param {Array} metaData 地图元数据数组
 * @returns {boolean} 是否为有效位置
 */
export function endsUpInValidPosition(targetTile, metaData) {
  // 1. 边界检查
  if (targetTile.x < MIN_TILE_INDEX || targetTile.x > MAX_TILE_INDEX)
    return false
  if (targetTile.z <= -5)
    return false

  // 2. 检查 metaData 是否有树
  const rowIndex = targetTile.z
  const row = metaData[rowIndex - 1]
  if (row && row.type === 'forest') {
    // 检查该行是否有树在目标 x
    if (row.trees.some(tree => tree.tileIndex === targetTile.x)) {
      return false
    }
  }
  return true
}

/**
 * 计算滑动方向
 * @param {number} startX 起始X
 * @param {number} startY 起始Y
 * @param {number} endX 结束X
 * @param {number} endY 结束Y
 * @returns {string|null} 'forward' | 'backward' | 'left' | 'right' | null
 */
export function getSwipeDirection(startX, startY, endX, endY) {
  const dx = endX - startX
  const dy = endY - startY
  // 使用常量控制滑动灵敏度
  if (Math.abs(dx) < SWIPE_THRESHOLD * 0.5 && Math.abs(dy) < SWIPE_THRESHOLD)
    return null // 滑动距离太短忽略

  if (isPortrait()) {
    // 竖屏时只认斜向滑动
    if (dx !== 0 && dy !== 0) {
      if (dx < 0 && dy < 0) {
        // 左上
        return 'left'
      }
      else if (dx > 0 && dy > 0) {
        // 右下
        return 'right'
      }
      else if (dx < 0 && dy > 0) {
        // 左下
        return 'backward'
      }
      else if (dx > 0 && dy < 0) {
        // 右上
        return 'forward'
      }
    }
    // 非斜向滑动不响应
    return null
  }
  else {
    // 横屏/PC端，保持原有逻辑
    if (Math.abs(dx) > Math.abs(dy)) {
      // 横向滑动
      return dx > 0 ? 'right' : 'left'
    }
    else {
      // 纵向滑动
      return dy > 0 ? 'backward' : 'forward'
    }
  }
}

// 判断是否为移动端
export function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

// 判断是否为横屏
export function isLandscape() {
  return window.innerWidth > window.innerHeight
}

// 判断是否为竖屏
export function isPortrait() {
  return window.innerHeight >= window.innerWidth
}

/**
 * 防抖函数
 * @param {Function} func 需要防抖的函数
 * @param {number} wait 延迟时间（毫秒）
 * @returns {Function} 防抖后的新函数
 */
export function debounce(func, wait = 300) {
  let timeout = null
  return function (...args) {
    // 保留 this 上下文
    const context = this
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      func.apply(context, args)
    }, wait)
  }
}
