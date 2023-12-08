import { GLTFLoader } from 'three/loaders/GLTFLoader.js';
import { Box } from './main.js';

export class GLTFBox extends Box {
  constructor({
    url, // URL do modelo GLTF
    scale = 1,
    width,
    height,
    depth,
    color = '#00ff00',
    velocity = { x: 0, y: 0, z: 0 },
    position = { x: 0, y: 0, z: 0 },
    zAcceleration = false
  }) {
    // Chame o construtor da classe Box com os parâmetros adequados
    super({ width, height, depth, color, velocity, position, zAcceleration });

    // Defina o material do Box como transparente
    this.material.transparent = true;
    this.material.opacity = 0;

    // Carregue o modelo GLTF
    this.loadGLTFModel(url, scale);
  }

  loadGLTFModel(url, scale) {
    const loader = new GLTFLoader();
    loader.load(url, (gltf) => {
      this.gltfModel = gltf.scene;
      this.gltfModel.scale.set(scale, scale, scale);
      this.gltfModel.position.set(this.position.x, this.position.y, this.position.z);
      
      // Adicione o modelo GLTF como filho do Box
      this.add(this.gltfModel);
    });
  }
}
