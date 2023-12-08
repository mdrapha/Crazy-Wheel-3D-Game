import * as THREE from 'three'

//Criando um 'loader' para carregar a textura do chão
const textureLoader = new THREE.TextureLoader();

const texturaChao = textureLoader.load('/imgs/road.jpg');
texturaChao.wrapS = THREE.ClampToEdgeWrapping; //Isso evitará a repetição no eixo Y
texturaChao.wrapT = THREE.RepeatWrapping;

texturaChao.repeat.set(1, 10);

export { texturaChao }
