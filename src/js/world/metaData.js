// 地图元数据示例，前五行为 forest 行
const metaData = [
  {
    type: 'forest',
    trees: [
      { tileIndex: -7, type: 'tree01' },
      { tileIndex: -3, type: 'tree02' },

    ],
  },
  {
    type: 'forest',
    trees: [

      { tileIndex: -5, type: 'tree01' },
      { tileIndex: 5, type: 'tree04' },
    ],
  },
  {
    type: 'forest',
    trees: [
      { tileIndex: -6, type: 'tree03' },

    ],
  },
  {
    type: 'forest',
    trees: [
      { tileIndex: 8, type: 'tree03' },
    ],
  },
  {
    type: 'forest',
    trees: [
      { tileIndex: -3, type: 'tree02' },
      { tileIndex: 6, type: 'tree04' },
    ],
  },
  {
    type: 'road',
    direction: false, // false 向左，true 向右
    speed: 1,
    vehicles: [
      { initialTileIndex: 2, type: 'car01' },
      { initialTileIndex: -3, type: 'car02' },
    ],
  },
  {
    type: 'road',
    direction: true, // false 向左，true 向右
    speed: 1,
    vehicles: [
      { initialTileIndex: 4, type: 'car01' },
      { initialTileIndex: -1, type: 'car02' },
    ],
  },
  {
    type: 'forest',
    trees: [
      { tileIndex: -3, type: 'tree02' },
      { tileIndex: 6, type: 'tree04' },
    ],
  },
  {
    type: 'road',
    direction: true, // false 向左，true 向右
    speed: 1,
    vehicles: [
      { initialTileIndex: 4, type: 'car01' },
      { initialTileIndex: -1, type: 'car02' },
    ],
  },
]

export default metaData
