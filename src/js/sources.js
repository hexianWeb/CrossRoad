/**
 * 定义项目所需的静态资源列表。
 * Resources 类会根据 'type' 属性自动选择合适的加载器。
 *
 * 支持的资源类型 (type) 及其对应的加载器/方式:
 * - gltfModel:   GLTFLoader (支持 Draco 和 KTX2 压缩)
 * - texture:     TextureLoader (普通图像纹理, 如 jpg, png)
 * - cubeTexture: CubeTextureLoader (立方体贴图, 用于环境映射等)
 * - font:        FontLoader (加载字体文件, 通常是 json 格式)
 * - fbxModel:    FBXLoader (加载 FBX 模型)
 * - audio:       AudioLoader (加载音频文件)
 * - objModel:    OBJLoader (加载 OBJ 模型)
 * - hdrTexture:  RGBELoader (加载 HDR 环境贴图)
 * - svg:         SVGLoader (加载 SVG 文件作为纹理或数据)
 * - exrTexture:  EXRLoader (加载 EXR 高动态范围图像)
 * - video:       自定义加载逻辑，创建 VideoTexture (加载视频作为纹理)
 * - ktx2Texture: KTX2Loader (加载 KTX2 压缩纹理)
 */
export default [
  {
    name: 'fontSource',
    type: 'font',
    path: './fonts/helvetiker_bold.typeface.json',
  },
  {
    name: 'matcapGreen',
    type: 'texture',
    path: './textures/matcap/4A6442_D0AB75_81CD94_181B12-64px.png',
  },
  {
    name: 'environmentMapTexture',
    type: 'cubeTexture',
    path: [
      'textures/environmentMap/px.jpg',
      'textures/environmentMap/nx.jpg',
      'textures/environmentMap/py.jpg',
      'textures/environmentMap/ny.jpg',
      'textures/environmentMap/pz.jpg',
      'textures/environmentMap/nz.jpg',
    ],
  },
  {
    name: 'chicken',
    type: 'gltfModel',
    path: './model/chicken.glb',
  },
  {
    name: 'bigChicken',
    type: 'gltfModel',
    path: './model/bigchickenPbr02.glb',
  },
  {
    name: 'grass',
    type: 'gltfModel',
    path: './model/grass.glb',
  },
  {
    name: 'road',
    type: 'gltfModel',
    path: './model/road.glb',
  },
  {
    name: 'tree01',
    type: 'gltfModel',
    path: './model/tree01.glb',
  },
  {
    name: 'tree02',
    type: 'gltfModel',
    path: './model/tree02.glb',
  },
  {
    name: 'tree03',
    type: 'gltfModel',
    path: './model/tree03.glb',
  },
  {
    name: 'tree04',
    type: 'gltfModel',
    path: './model/tree04.glb',
  },
  {
    name: 'tile',
    type: 'gltfModel',
    path: './model/grass02.glb',
  },
  {
    name: 'car01',
    type: 'gltfModel',
    path: './model/car01.glb',
  },
  {
    name: 'car02',
    type: 'gltfModel',
    path: './model/car02.glb',
  },
  {
    name: 'car03',
    type: 'gltfModel',
    path: './model/car03.glb',
  },
  {
    name: 'car04',
    type: 'gltfModel',
    path: './model/car04.glb',
  },
  {
    name: 'car05',
    type: 'gltfModel',
    path: './model/car05.glb',
  },
  {
    name: 'car06',
    type: 'gltfModel',
    path: './model/car06.glb',
  },
  {
    name: 'car07',
    type: 'gltfModel',
    path: './model/car07.glb',
  },
  {
    name: 'car08',
    type: 'gltfModel',
    path: './model/car08.glb',
  },
  {
    name: 'clock',
    type: 'gltfModel',
    path: './model/clock.glb',
  },
  {
    name: 'random',
    type: 'gltfModel',
    path: './model/random.glb',
  },
  {
    name: 'sheid',
    type: 'gltfModel',
    path: './model/sheid.glb',
  },
  {
    name: 'shoe',
    type: 'gltfModel',
    path: './model/shoe.glb',
  },
]
