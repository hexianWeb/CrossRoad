import { minTileIndex, maxTileIndex, CAR_BOUNDARY_MIN, CAR_BOUNDARY_MAX } from '../constants'
// 随机生成 N 行地图元数据

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getRandomFromArray(arr) {
  return arr[getRandomInt(0, arr.length - 1)]
}

export default function generateMetaRows(startRowIndex, N = 20) {
  const rows = []
  for (let i = 0; i < N; i++) {
    // 随机决定行类型
    const isForest = Math.random() < 0.5
    if (isForest) {
      // forest 行
      const treeCount = getRandomInt(1, 5)
      const usedTileIndex = new Set()
      const trees = []
      while (trees.length < treeCount) {
        const tileIndex = getRandomInt(minTileIndex, maxTileIndex)
        if (!usedTileIndex.has(tileIndex)) {
          usedTileIndex.add(tileIndex)
          trees.push({
            tileIndex,
            type: `tree0${getRandomInt(1, 4)}`
          })
        }
      }
      rows.push({
        type: 'forest',
        trees
      })
    } else {
      // road 行
      const carCount = getRandomInt(1, 4)
      const usedTileIndex = []
      const vehicles = []
      // 只允许偶数 tileIndex
      const evenTileIndices = []
      for (let idx = CAR_BOUNDARY_MIN +2; idx <= CAR_BOUNDARY_MAX-2; idx++) {
        if (idx % 2 === 0) evenTileIndices.push(idx)
      }
      while (vehicles.length < carCount) {
        let tileIndex
        let valid = false
        while (!valid) {
          tileIndex = getRandomFromArray(evenTileIndices)
          valid = usedTileIndex.every(idx => Math.abs(idx - tileIndex) > 1)
          if (valid) usedTileIndex.push(tileIndex)
        }
        vehicles.push({
          initialTileIndex: tileIndex,
          type: `car0${getRandomInt(1, 2)}`
        })
      }
      rows.push({
        type: 'road',
        direction: Math.random() < 0.5,
        speed: 1,
        vehicles
      })
    }
  }
  return rows
} 