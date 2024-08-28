import { THREE, OrbitControls} from './import-three.js';

// Seleziona il container
const container = document.getElementById('skils-container');

// Crea la scena
const scene = new THREE.Scene();

// Crea la camera
const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.z = 10;

// Crea il renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// Crea un TextureLoader
const textureLoader = new THREE.TextureLoader();

// Array di URL delle texture (loghi)
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

// Funzione per creare un poliedro con texture
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

// Crea e posiziona i poliedri in una griglia
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

// Aggiungi una luce ambientale debole per le ombre di base
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

// Aggiungi una luce direzionale potente per simulare una fonte luminosa principale
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 7.5); // Posiziona la luce dall'alto a destra
directionalLight.castShadow = true; // Attiva le ombre
scene.add(directionalLight);

// Aggiungi una PointLight per aggiungere riflessi brillanti sulle sfere
const pointLight = new THREE.PointLight(0xffffff, 1, 50);
pointLight.position.set(-10, 10, 10);
scene.add(pointLight);

// Aggiungi una HemisphericLight per un'illuminazione più naturale
const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.3);
scene.add(hemisphereLight);

// Aggiungi i controlli OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;
controls.enablePan = true;

// Crea un raycaster e un vettore per il mouse
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selectedObject = null;  // L'oggetto attualmente selezionato

// Funzione per aggiornare il raycaster
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

// Gestione degli eventi del mouse
window.addEventListener('mousedown', (event) => {
    // Calcola la posizione del mouse in [-1, 1] per x e y
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    updateRaycaster();
});

// Funzione di animazione
function animate() {
    requestAnimationFrame(animate);

    // Ruota i poliedri
    objects.forEach(obj => {
        obj.rotation.y += 0.01;
        obj.rotation.x += 0.01;
    });

    controls.update(); // Aggiorna i controlli

    renderer.render(scene, camera);
}

// Avvia l'animazione
animate();

// Gestione del resize
window.addEventListener('resize', () => {
    renderer.setSize(container.clientWidth, container.clientHeight);
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
});
