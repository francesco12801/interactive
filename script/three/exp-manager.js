import { THREE, OrbitControls, OBJLoader} from './import-three.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);


// Landing Manager 
const landingManager = document.querySelector('#exp-section'); 
landingManager.appendChild(renderer.domElement); 

// 3D model 
let model; 
const loader = new GLTFLoader();

loader.load( '../assets/scene.gltf', function ( gltf ) {
    model = gltf.scene; 
	scene.add( gltf.scene );

}, undefined, function ( error ) {

	console.error( error );

} );

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = false; 
// lights 
const ambientLight = new THREE.AmbientLight(0xffffff); 
const light = new THREE.AmbientLight(0x404040); 
scene.add(ambientLight, light); 

// Camera 
camera.position.z = 5;
camera.position.y = 1;
camera.position.x = 4;
controls.update();

// Animate 

function animate(){
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene,camera); 
}

animate(); 