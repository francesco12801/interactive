import { THREE, OrbitControls} from './import-three.js';

// Seleziona il container
const container = document.getElementById('skils-container');

// Scene, camera and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.z = 10;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

const textureLoader = new THREE.TextureLoader();

// Texture Arrays
const textureUrls = [
    '../assets/textures/css.png',  
    '../assets/textures/docker.png',
    '../assets/textures/figma.png',
    '../assets/textures/git.png',
    '../assets/textures/html.png',
    '../assets/textures/javascript.png',
    '../assets/textures/nodejs.png',
    '../assets/textures/typescript.png',
];

// Create poliedro con texture
function createTexturedPolyhedron(radius, textureUrl) {
    const geometry = new THREE.SphereGeometry(radius, 32, 32); 
    const texture = textureLoader.load(textureUrl);
    const material = new THREE.MeshStandardMaterial({ map: texture });
    texture.repeat.set(2, 2);
    return new THREE.Mesh(geometry, material);
}

const radius = 1.5;  // Raggio del poliedro
const spacing = 5; // Spaziatura tra i poliedri
const rows = 2;
const cols = 4;

// Crea e posiziona i poliedri in a matrix 
const objects = [];
for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
        const index = row * cols + col;
        if (index < textureUrls.length) {
            const polyhedron = createTexturedPolyhedron(radius, textureUrls[index]);
            polyhedron.position.x = (col - (cols - 1) / 2) * spacing;
            polyhedron.position.y = (row - (rows - 1) / 2) * spacing;
            scene.add(polyhedron);
            objects.push(polyhedron);
        }
    }
}

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

// focus directional light 
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 7.5); // from the top 
directionalLight.castShadow = true; // Attiva le ombre
scene.add(directionalLight);

// PointLight per riflessi sulle sfere
const pointLight = new THREE.PointLight(0xffffff, 1, 50);
pointLight.position.set(-10, 10, 10);
scene.add(pointLight);

// HemisphericLight for natural illumination
const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.3);
scene.add(hemisphereLight);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;
controls.enablePan = true;


const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selectedObject = null;  

function updateRaycaster() {
    // Imposta la posizione del raggio basata sulla posizione del mouse
    raycaster.ray.origin.setFromCamera(mouse, camera);
    raycaster.ray.direction.set(mouse.x, mouse.y, 1).unproject(camera).sub(camera.position).normalize();

    // Trova gli oggetti intersectati
    const intersects = raycaster.intersectObjects(objects);

    if (intersects.length > 0) {
        if (selectedObject) {
            // Deseleziona l'oggetto attualmente selezionato
            selectedObject.material.emissive.set(0x000000);
        }

        selectedObject = intersects[0].object;
        selectedObject.material.emissive.set(0xff0000); // Evidenzia l'oggetto selezionato
    } else {
        if (selectedObject) {
            selectedObject.material.emissive.set(0x000000); // Deseleziona se nulla è selezionato
            selectedObject = null;
        }
    }
}


window.addEventListener('mousedown', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    updateRaycaster();
});


function animate() {
    requestAnimationFrame(animate);

    objects.forEach(obj => {
        obj.rotation.y += 0.01;
        obj.rotation.x += 0.01;
    });

    controls.update(); // Aggiorna i controlli

    renderer.render(scene, camera);
}


animate();

window.addEventListener('resize', () => {
    renderer.setSize(container.clientWidth, container.clientHeight);
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
});
