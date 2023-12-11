import * as THREE from 'three'

const iluminacao = new THREE.DirectionalLight(0xffffff, -3)
iluminacao.position.y = 3
iluminacao.position.z = 1
iluminacao.castShadow = true

export { iluminacao }