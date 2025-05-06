export default class Tree {
  /**
   * @param {THREE.Scene} scene - threejs场景
   * @param {object} resources - 资源加载器实例
   * @param {Array} trees - 当前行的树木数组，每项包含tileIndex和type
   * @param {number} rowIndex - 当前行的z坐标
   */
  constructor(scene, resources, trees, rowIndex = 0) {
    this.scene = scene
    this.resources = resources
    this.trees = trees
    this.rowIndex = rowIndex
    this.treeMeshes = []
    this.addTrees()
  }

  // 添加所有树木到当前行
  addTrees() {
    this.trees.forEach((treeData) => {
      const { tileIndex, type } = treeData
      // 获取对应类型的树模型
      const treeResource = this.resources.items[type]
      if (!treeResource) {
        console.warn(`未找到资源: ${type}`)
        return
      }
      // 克隆树模型
      const treeMesh = treeResource.scene.clone()
      // 设置树的位置（x轴为tileIndex，z轴为rowIndex）
      treeMesh.position.set(tileIndex, 0, this.rowIndex)
      // 添加到场景
      this.scene.add(treeMesh)
      // 存储树对象，便于后续移除
      this.treeMeshes.push(treeMesh)
    })
  }

  // 移除所有树木
  remove() {
    this.treeMeshes.forEach((tree) => {
      this.scene.remove(tree)
    })
    this.treeMeshes = []
  }
}
