import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

class GLTFModel {
    constructor({
      url, // URL do modelo GLTF
      scale = 1,
      position = { x: 0, y: 0, z: 0 },
      velocity = { x: 0, y: 0, z: 0 },
      zAcceleration = false
    }) {
      this.velocity = velocity;
      this.gravity = -0.002;
      this.zAcceleration = zAcceleration;
      this.loaded = false;
  
      const loader = new GLTFLoader();
      loader.load(url, (gltf) => {
        this.model = gltf.scene;
        this.model.scale.set(scale, scale, scale);
        this.model.position.set(position.x, position.y, position.z);
        scene.add(this.model);
        this.loaded = true;
      });
    }
  
    update(ground) {
      if (!this.loaded) return;
  
      this.model.position.x += this.velocity.x;
      this.model.position.z += this.velocity.z;
  
      if (this.zAcceleration) this.velocity.z += 0.0003;
  
      this.applyGravity(ground);
    }
  
    applyGravity(ground) {
      this.velocity.y += this.gravity;
  
      // Colisão com o solo
      if (this.model.position.y + this.velocity.y < ground.position.y + ground.height / 2) {
        this.velocity.y = -this.velocity.y * 0.5; // Aplica um fator de atrito
        this.model.position.y = ground.position.y + ground.height / 2;
      } else {
        this.model.position.y += this.velocity.y;
      }
    }
  }
  