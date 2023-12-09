import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/loaders/GLTFLoader.js';
import { chao } from './chao.js'
// import {Box} from './classeBox.js'
// import {cube} from './cube.js'
import { iluminacao } from './luz.js'

// Definição da classe GLTFBox

let lives = 3;

document.addEventListener('DOMContentLoaded', (event) => {
  document.getElementById('scoreBoard').style.display = 'none';
  document.getElementById('lifeBoard').style.display = 'none';
});

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)
camera.position.set(4.61, 2.74, 8)

const renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true
})
renderer.shadowMap.enabled = true
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)

export class Box extends THREE.Mesh {
  constructor({
    width,
    height,
    depth,
    color = '#00ff00',
    velocity = {
      x: 0,
      y: 0,
      z: 0
    },
    position = {
      x: 0,
      y: 0,
      z: 0
    },
    zAcceleration = false,
    isTransparent = false // Parâmetro para transparência
  }) {
    const materialOptions = {
      color,
      transparent: isTransparent,
      opacity: isTransparent ? 0 : 1
    };

    super(new THREE.BoxGeometry(width, height, depth), new THREE.MeshStandardMaterial(materialOptions));

    this.width = width;
    this.height = height;
    this.depth = depth;

    this.position.set(position.x, position.y, position.z);

    this.velocity = velocity;
    this.gravity = -0.002;
    this.zAcceleration = zAcceleration;

    this.updateSides();
  }

  updateSides() {
    this.right = this.position.x + this.width / 2;
    this.left = this.position.x - this.width / 2;
    this.bottom = this.position.y - this.height / 2;
    this.top = this.position.y + this.height / 2;
    this.front = this.position.z + this.depth / 2;
    this.back = this.position.z - this.depth / 2;
  }

  update(chao) {
    this.updateSides();

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.position.z += this.velocity.z;

    if(this.position.y > 0)
      this.velocity.y += this.gravity;

    if (boxCollision({ box1: this, box2: chao })) {
      this.position.y = 0;
      this.velocity.y = 0;
    }
  }
}

function boxCollision({ box1, box2 }) {
  const xCollision = box1.right >= box2.left && box1.left <= box2.right;
  const yCollision = box1.bottom <= box2.top && box1.top >= box2.bottom;
  const zCollision = box1.front >= box2.back && box1.back <= box2.front;

  return xCollision && yCollision && zCollision;
}


class GLTFMain extends Box {
  constructor({
    url,
    scale = 1,
    width,
    height,
    depth,
    velocity = { x: 0, y: 0.08, z: 0 },
    position = { x: 0, y: 1, z: 0 },
    zAcceleration = false
  }) {
    super({
      width,
      height,
      depth,
      color: '#FFFFFF', // Cor branca, mas será transparente
      velocity,
      position,
      zAcceleration,
      isTransparent: true
    });

    // Carregar o modelo GLTF
    const loader = new GLTFLoader();
    loader.load(url, (gltf) => {
      this.gltfModel = gltf.scene;
      this.gltfModel.scale.set(scale, scale, scale);
      this.gltfModel.position.set(0, -1.3, 0);
      this.add(this.gltfModel);
    });
  }
}

class GLTFEnemy extends Box {
  constructor({
    url, // URL do modelo 3D do inimigo
    scale = 1,
    width,
    height,
    depth,
    velocity = { x: 0, y: 0, z: 0 },
    position = { x: 0, y: 0, z: 0 },
    zAcceleration = false
  }) {
    super({
      width,
      height,
      depth,
      color: '#FFFFFF',
      velocity,
      position,
      zAcceleration,
      isTransparent: true
    });

    const loader = new GLTFLoader();
    loader.load(url, (gltf) => {
      this.gltfModel = gltf.scene;
      this.gltfModel.scale.set(scale, scale, scale);
      this.gltfModel.position.set(0, 0.1, 0); // Ajuste a posição conforme necessário
      this.add(this.gltfModel);
    });
  }
}


const cube = new GLTFMain({
  url: '/models/tuner_wheel/scene.gltf',
  scale: 0.5,
  width: 0.8,
  height: 2.38,
  depth: 2.55,
  position: { x: 0, y: 0, z: 0 },
  velocity: { x: 0, y: 0.06, z: 0 },
  isTransparent: true // Torna o cubo transparente
});

cube.castShadow = true
scene.add(cube)

scene.add(chao)

scene.add(iluminacao)

scene.add(new THREE.AmbientLight(0xffffff, 0.5))

camera.position.z = 5
console.log(chao.top)
console.log(chao.bottom)

const keys = {
  a: {
    pressed: false
  },
  d: {
    pressed: false
  },
  s: {
    pressed: false
  },
  w: {
    pressed: false
  }
}

window.addEventListener('keydown', (event) => {
  switch (event.code) {
    case 'KeyA':
      keys.a.pressed = true
      break
    case 'KeyD':
      keys.d.pressed = true
      break
    case 'KeyS':
      keys.s.pressed = true
      break
    case 'KeyW':
      keys.w.pressed = true
      break
    case 'Space':

      cube.velocity.y = 0.06
      console.log(cube.position.y)

      break
  }
})

window.addEventListener('keyup', (event) => {
  switch (event.code) {
    case 'KeyA':
      keys.a.pressed = false
      break
    case 'KeyD':
      keys.d.pressed = false
      break
    case 'KeyS':
      keys.s.pressed = false
      break
    case 'KeyW':
      keys.w.pressed = false
      break
  }
})

let score = 0;
let lastUpdateTime = Date.now();

function updateScore() {
  const now = Date.now();
  score += ((now - lastUpdateTime) / 1000) * 5; // Pontos baseados no tempo em segundos
  lastUpdateTime = now;
  document.getElementById('score').innerText = Math.floor(score).toString();
}

let isPaused = false;

document.getElementById('pauseButton').addEventListener('click', function () {
  isPaused = true;
  document.getElementById('pauseButton').style.display = 'none';
  document.getElementById('resumeButton').style.display = 'block';
});

document.getElementById('resumeButton').addEventListener('click', function () {
  isPaused = false;
  lastUpdateTime = Date.now();
  document.getElementById('pauseButton').style.display = 'block';
  document.getElementById('resumeButton').style.display = 'none';
  animate();
});

const enemies = []

let frames = 0
let spawnRate = 40


function animate() {


  const animationId = requestAnimationFrame(animate)
  renderer.render(scene, camera)

  // movement code
  cube.velocity.x = 0
  cube.velocity.z = 0

  cube.rotation.x -= 0.1

  if (keys.a.pressed && cube.position.x >= -5.0) cube.velocity.x = -0.05
  else if (keys.d.pressed && cube.position.x <= 5.0) cube.velocity.x = 0.05

  if (keys.s.pressed) cube.velocity.z = 0.05
  else if (keys.w.pressed) cube.velocity.z = -0.05

  cube.update(chao)
  enemies.forEach((enemy) => {
    enemy.update(chao)
    if (boxCollision({ box1: cube, box2: enemy }) && !enemy.hasCollided) {
      lives--;
      enemy.hasCollided = true;
      updateLives(); // Atualize a exibição das vidas
    }

    if (lives == 0) {
      showGameOverScreen();
      cancelAnimationFrame(animationId);
    }
  })
  updateScore();

  if (frames % spawnRate === 0) {
    if (spawnRate > 2) spawnRate -= 2;

    const enemy = new GLTFEnemy({
      url: '/models/traffic_cone/scene.gltf', // Substitua pelo caminho do seu modelo 3D
      scale: 0.5, // Ajuste conforme necessário
      width: 1,
      height: 1,
      depth: 1,
      position: {
        x: (Math.random() - 0.5) * 10,
        y: 0,
        z: -20
      },
      velocity: {
        x: 0,
        y: 0,
        z: 0.03
      },
      color: 'red',
      zAcceleration: true,
      isTransparent: false // Garante que os inimigos não sejam transparentes
    })
    enemy.castShadow = true
    enemy.hasCollided = false
    scene.add(enemy)
    enemies.push(enemy)
  }

  frames++

}

// Inclua esta variável para evitar que o loop de animação seja iniciado mais de uma vez
let animationId = null;

function startGame() {
  // Inicialize ou reinicie a pontuação
  score = 0;
  lastUpdateTime = Date.now();
  document.getElementById('scoreBoard').style.display = 'block';
  document.getElementById('lifeBoard').style.display = 'block';


  // Defina ou redefina o estado inicial do jogo, como a posição do jogador, inimigos, etc.
  // Se você tiver uma função separada para reiniciar o jogo, chame-a aqui
  resetGame();

  // Esconda o menu de início, se ele ainda estiver visível
  const startMenu = document.getElementById('startMenu');
  startMenu.style.display = 'none';

  // Inicie o loop de animação, se ainda não estiver em execução
  if (!animationId) {
    animate();
  }
}

function resetGame() {
  // Configure ou redefina a posição e estado inicial do jogador e dos inimigos
  // Se o seu jogo já possui essa lógica em outro lugar, você pode chamar essa função aqui
  // Exemplo:
  // cube.position.set(0, 0, 0);
  // cube.velocity.y = 0;
  // Remova todos os inimigos existentes
  enemies.forEach((enemy) => {
    scene.remove(enemy);
  });
  enemies.length = 0;

  // Reinicie qualquer outra variável de estado do jogo
  frames = 0;
  spawnRate = 200;
  lives = 3; // Reiniciar vidas
  updateLives(); // Atualizar display de vidas

  // Atualize a pontuação na tela
  updateScore();
}



// Agora você precisa chamar startGame() quando o DOM estiver carregado e o botão de início for clicado
document.addEventListener('DOMContentLoaded', (event) => {
  const startButton = document.getElementById('startGame');

  startButton.addEventListener('click', function () {
    startGame();
  });
});


function showGameOverScreen() {

  document.getElementById('lastScore').innerText = Math.floor(score).toString();
  const gameOverPopup = document.getElementById('gameOverPopup');
  gameOverPopup.style.display = 'flex';
  document.getElementById('scoreBoard').style.display = 'none';

}

document.getElementById('restartGame').addEventListener('click', function () {
  // Aqui você adiciona a lógica para reiniciar o jogo
  window.location.reload(); // Esta é uma maneira simples de reiniciar recarregando a página
});

function updateLives() {
  document.getElementById('life').innerText = lives;
}
