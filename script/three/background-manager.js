// import * as THREE from 'three';
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// const scene = new THREE.Scene();
// const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// const renderer = new THREE.WebGLRenderer();
// renderer.setSize(window.innerWidth, window.innerHeight);


// // Landing Manager 
// const landingManager = document.querySelector('#land-section'); 
// landingManager.appendChild(renderer.domElement); 

// // 3D model 
// let model; 
// const loader = new GLTFLoader();

// loader.load( '../assets/scene.gltf', function ( gltf ) {
//     model = gltf.scene; 
// 	scene.add( gltf.scene );

// }, undefined, function ( error ) {

// 	console.error( error );

// } );

// // Orbit Controls
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableZoom = false; 
// // lights 
// const ambientLight = new THREE.AmbientLight(0xffffff); 
// const light = new THREE.AmbientLight(0x404040); 
// scene.add(ambientLight, light); 

// // Camera 
// camera.position.z = 5;
// camera.position.y = 1;
// camera.position.x = 4;
// controls.update();

// // Animate 

// function animate(){
//     requestAnimationFrame(animate);
//     controls.update();
//     renderer.render(scene,camera); 
// }

// animate(); 

import { THREE, OrbitControls, OBJLoader} from './import-three.js';

// Funzione per inizializzare il background scorrevole
function initScrollingBackground(containerId) {
    const container = document.getElementById(containerId);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.domElement.style.position = 'fixed'; 
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.zIndex = '-1';
    container.appendChild(renderer.domElement);

    // Carica la texture per il background
    const textureLoader = new THREE.TextureLoader();
    const backgroundTexture = textureLoader.load('../assets/textures/color_emissive.png');
    backgroundTexture.wrapS = THREE.RepeatWrapping;
    backgroundTexture.wrapT = THREE.RepeatWrapping;
    backgroundTexture.repeat.set(4, 4); // Puoi regolare i valori per adattare la texture

    // Crea un piano con la texture
    const geometry = new THREE.PlaneGeometry(100, 100); // Dimensione del piano
    const material = new THREE.MeshBasicMaterial({ map: backgroundTexture });
    const plane = new THREE.Mesh(geometry, material);
    plane.position.z = -50; // Posiziona il piano più lontano dalla camera
    scene.add(plane);

    camera.position.z = 5;

    function animate() {
        requestAnimationFrame(animate);

        // Scorrimento della texture
        backgroundTexture.offset.y -= 0.01; // Velocità di scorrimento verticale
        backgroundTexture.offset.x -= 0.005; // Velocità di scorrimento orizzontale (opzionale)

        renderer.render(scene, camera);
    }

    animate();

    // Aggiornamento del renderer e della camera quando la finestra cambia dimensione
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}

// Inizializza il background scorrevole
initScrollingBackground('background-container'); // Assicurati di avere un div con id="background-container"
