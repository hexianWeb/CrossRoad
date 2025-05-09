import { CAR_BOUNDARY_MAX, CAR_BOUNDARY_MIN, maxTileIndex, minTileIndex } from '../constants'
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
        const tileIndex = getRandomInt(minTileIndex, maxTileIndex)
        if (!usedTileIndex.has(tileIndex)) {
          usedTileIndex.add(tileIndex)
          trees.push({
            tileIndex,
            type: `tree0${getRandomInt(1, 4)}`,
          })
        }
      }
      rows.push({
        type: 'forest',
        trees,
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
          type: `car0${getRandomInt(1, 2)}`,
        })
      }
      rows.push({
        type: 'road',
        direction: Math.random() < 0.5,
        speed: 1,
        vehicles,
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
  if (targetTile.x < -8 || targetTile.x > 8)
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
