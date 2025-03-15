import * as THREE from 'three'

// 获取边界
export function getBound(object, precise = true) {
  const box3 = new THREE.Box3().setFromObject(object, precise)

  const center = new THREE.Vector3()
  const sphere = new THREE.Sphere()
  box3.getCenter(center)
  box3.getBoundingSphere(sphere)

  const width = box3.max.x - box3.min.x
  const height = box3.max.y - box3.min.y
  const depth = box3.max.z - box3.min.z

  return {
    boundingBox: box3,
    center,
    boundingSphere: sphere,
    width,
    height,
    depth,
  }
}
