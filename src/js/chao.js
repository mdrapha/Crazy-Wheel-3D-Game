import * as THREE from 'three'
import {texturaChao} from './texturaChao.js'
import {Box} from './classeBox.js'

const chao = new Box ({

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

chao.material.map = texturaChao;
chao.material.needsUpdate = true;
chao.receiveShadow = true;

export { chao }