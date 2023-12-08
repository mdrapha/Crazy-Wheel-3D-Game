import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
//import { GLTFModel } from '../js/GLTFModel.js'; 


document.addEventListener('DOMContentLoaded', (event) => {
  document.getElementById('scoreBoard').style.display = 'none';
});

// Configurações para o dia
const daySettings = {
  lightIntensity: 1,
  ambientColor: 0xffffff, // Branco
};

// Configurações para a noite
const nightSettings = {
  lightIntensity: 0.3,
  ambientColor: 0x000044, // Azul escuro
};

// Estado atual e temporizador
let isDay = true;
let dayNightTimer = 0;


// Cria um loader de texturas
const textureLoader = new THREE.TextureLoader();
// Carrega a textura do caminho especificado
const roadTexture = textureLoader.load('/imgs/road.jpg');
roadTexture.wrapS = THREE.ClampToEdgeWrapping; // Isso evitará a repetição no eixo Y
roadTexture.wrapT = THREE.RepeatWrapping;
const groundWidth = 10;
const groundDepth = 50;
const textureSize = 512; // Dimensão da textura

roadTexture.repeat.set(1, 10); // Ajuste estes números conforme necessário

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

class Box extends THREE.Mesh {
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
    zAcceleration = false
  }) {
    super(
      new THREE.BoxGeometry(width, height, depth),
      new THREE.MeshStandardMaterial({ color })
    )

    this.width = width
    this.height = height
    this.depth = depth

    this.position.set(position.x, position.y, position.z)

    this.right = this.position.x + this.width / 2
    this.left = this.position.x - this.width / 2

    this.bottom = this.position.y - this.height / 2
    this.top = this.position.y + this.height / 2

    this.front = this.position.z + this.depth / 2
    this.back = this.position.z - this.depth / 2

    this.velocity = velocity
    this.gravity = -0.002

    this.zAcceleration = zAcceleration
  }

  updateSides() {
    this.right = this.position.x + this.width / 2
    this.left = this.position.x - this.width / 2

    this.bottom = this.position.y - this.height / 2
    this.top = this.position.y + this.height / 2

    this.front = this.position.z + this.depth / 2
    this.back = this.position.z - this.depth / 2
  }

  update(ground) {
    this.updateSides()

    if (this.zAcceleration) this.velocity.z += 0.0003

    this.position.x += this.velocity.x
    this.position.z += this.velocity.z

    this.applyGravity(ground)
  }

  applyGravity(ground) {
    this.velocity.y += this.gravity

    // this is where we hit the ground
    if (
      boxCollision({
        box1: this,
        box2: ground
      })
    ) {
      const friction = 0.5
      this.velocity.y *= friction
      this.velocity.y = -this.velocity.y
    } else this.position.y += this.velocity.y
  }
}

function boxCollision({ box1, box2 }) {
  const xCollision = box1.right >= box2.left && box1.left <= box2.right
  const yCollision =
    box1.bottom + box1.velocity.y <= box2.top && box1.top >= box2.bottom
  const zCollision = box1.front >= box2.back && box1.back <= box2.front

  return xCollision && yCollision && zCollision
}

// const cube = new GLTFModel({
//     url: 'models/soccer_ball/scene.gltf',
//     scale: 0.5,
//     position: { x: 0, y: 0, z: 0 },
//     velocity: { x: 0, y: -0.01, z: 0 }
//   });

const cube = new Box({
    width: 1,
    height: 1,
    depth: 1,
    velocity: {
      x: 0,
      y: -0.01,
      z: 0
    }
  })
cube.castShadow = true
scene.add(cube)

const ground = new Box({
  width: 10,
  height: 0.5,
  depth: 50,
  color: '#0369a1',
  position: {
    x: 0,
    y: -2,
    z: 0
  }
})

ground.material.map = roadTexture;
ground.material.needsUpdate = true;
ground.receiveShadow = true
scene.add(ground)

const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.y = 3
light.position.z = 1
light.castShadow = true
scene.add(light)

scene.add(new THREE.AmbientLight(0xffffff, 0.5))

camera.position.z = 5
console.log(ground.top)
console.log(cube.bottom)

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
      cube.velocity.y = 0.08
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
    score += ((now - lastUpdateTime) / 1000)*5; // Pontos baseados no tempo em segundos
    lastUpdateTime = now;
    document.getElementById('score').innerText = Math.floor(score).toString();
}

let isPaused = false;

document.getElementById('pauseButton').addEventListener('click', function() {
    isPaused = true;
    document.getElementById('pauseButton').style.display = 'none';
    document.getElementById('resumeButton').style.display = 'block';
});

document.getElementById('resumeButton').addEventListener('click', function() {
    isPaused = false;
    lastUpdateTime = Date.now(); 
    document.getElementById('pauseButton').style.display = 'block';
    document.getElementById('resumeButton').style.display = 'none';
    animate();
});

const enemies = []

let frames = 0
let spawnRate = 200


function animate() {
  const deltaTime = Date.now() - lastUpdateTime;

  // Atualiza o temporizador de dia e noite
  dayNightTimer += deltaTime;
  if (dayNightTimer >= 30000) { // 30 segundos
    isDay = !isDay;
    dayNightTimer = 0;
  }

  // Interpolação das propriedades de iluminação
  const lerpFactor = deltaTime / 30000;
  const targetSettings = isDay ? daySettings : nightSettings;
  light.intensity = THREE.MathUtils.lerp(light.intensity, targetSettings.lightIntensity, lerpFactor);
  scene.background = new THREE.Color().lerpColors(
    new THREE.Color(scene.background),
    new THREE.Color(targetSettings.ambientColor),
    lerpFactor
  );

  const animationId = requestAnimationFrame(animate)
  renderer.render(scene, camera)

  // movement code
  cube.velocity.x = 0
  cube.velocity.z = 0
  if (keys.a.pressed) cube.velocity.x = -0.05
  else if (keys.d.pressed) cube.velocity.x = 0.05

  if (keys.s.pressed) cube.velocity.z = 0.05
  else if (keys.w.pressed) cube.velocity.z = -0.05

  cube.update(ground)
    enemies.forEach((enemy) => {
      enemy.update(ground)
      if (
        boxCollision({
          box1: cube,
          box2: enemy
        })
      ) {
        showGameOverScreen()
        cancelAnimationFrame(animationId)
      }
    })
  updateScore();

  if (frames % spawnRate === 0) {
    if (spawnRate > 20) spawnRate -= 20

    const enemy = new Box({
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
        z: 0.005
      },
      color: 'red',
      zAcceleration: true
    })
    enemy.castShadow = true
    scene.add(enemy)
    enemies.push(enemy)
  }

  frames++
  lastUpdateTime = Date.now();
  requestAnimationFrame(animate);
}

// Inclua esta variável para evitar que o loop de animação seja iniciado mais de uma vez
let animationId = null;

function startGame() {
  // Inicialize ou reinicie a pontuação
  score = 0;
  lastUpdateTime = Date.now();
  document.getElementById('scoreBoard').style.display = 'block';

  
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

  // Atualize a pontuação na tela
  updateScore();
}



// Agora você precisa chamar startGame() quando o DOM estiver carregado e o botão de início for clicado
document.addEventListener('DOMContentLoaded', (event) => {
  const startButton = document.getElementById('startGame');
  
  startButton.addEventListener('click', function() {
    startGame();
  });
});


function showGameOverScreen() {

    document.getElementById('lastScore').innerText = Math.floor(score).toString();
    const gameOverPopup = document.getElementById('gameOverPopup');
    gameOverPopup.style.display = 'flex';
    document.getElementById('scoreBoard').style.display = 'none';

}

document.getElementById('restartGame').addEventListener('click', function() {
    // Aqui você adiciona a lógica para reiniciar o jogo
    window.location.reload(); // Esta é uma maneira simples de reiniciar recarregando a página
});


//animate()