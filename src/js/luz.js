import * as THREE from 'three'

const iluminacao = new THREE.DirectionalLight(0xffffff, -1.5)
iluminacao.position.y = 10
iluminacao.position.z = 1
iluminacao.castShadow = true

export { iluminacao }