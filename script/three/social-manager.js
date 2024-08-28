import { THREE, OrbitControls} from './import-three.js';

// Seleziona il container
const container = document.getElementById('social-container');

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
    '../assets/textures/insta.jpg',  
    '../assets/textures/linkedin.png',
    '../assets/textures/facebook.jpg',
    '../assets/textures/x.jpg',
];

// Array di URL dei link
const linkUrls = [
    'https://www.instagram.com/',
    'https://www.linkedin.com/',
    'https://www.facebook.com/',
    'https://twitter.com/',
];

// Funzione per creare un poliedro con texture e materiali riflettenti/rifrangenti
function createTexturedPolyhedron(radius, textureUrl) {
    const geometry = new THREE.SphereGeometry(radius, 32, 32); 
    const texture = textureLoader.load(textureUrl);
    
    const material = new THREE.MeshPhysicalMaterial({
        map: texture,
        metalness: 0.7,
        roughness: 0.2,
        reflectivity: 0.9,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        envMapIntensity: 1.0
    });

    texture.repeat.set(2, 2);
    return new THREE.Mesh(geometry, material);
}

const radius = 1.5;  // Raggio del poliedro
const spacing = 7; // Spaziatura tra i poliedri
const rows = 1;
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
            polyhedron.userData = { url: linkUrls[index] };  // Assegna l'URL al poliedro
            objects.push(polyhedron);
        }
    }
}

// Aggiungi luci globali alla scena
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

// Aggiungi una luce direzionale più potente
const directionalLight = new THREE.DirectionalLight(0xffffff, 6); // Maggiore intensità
directionalLight.position.set(5, 5, 7.5); // Posiziona sopra la scena
directionalLight.castShadow = true; // Attiva le ombre
directionalLight.shadow.mapSize.width = 2048; // Maggiore risoluzione della mappa delle ombre
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 3; // Imposta il range della luce
directionalLight.shadow.camera.far = 500;
directionalLight.shadow.camera.left = -50; 
directionalLight.shadow.camera.right = 50;
directionalLight.shadow.camera.top = 50;
directionalLight.shadow.camera.bottom = -50;
scene.add(directionalLight);

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

// Costanti per l'effetto di animazione
const scaleUpFactor = 2.0;
const normalRotationSpeed = 0.01;
const hoverRotationSpeed = 0.05;

// Funzione per aggiornare il raycaster
function updateRaycaster() {
    
    const vector = new THREE.Vector3(mouse.x, mouse.y, 1).unproject(camera);
    const direction = vector.sub(camera.position).normalize();

    raycaster.ray.origin.copy(camera.position);
    raycaster.ray.direction.copy(direction);

    const intersects = raycaster.intersectObjects(objects);

    if (intersects.length > 0) {
        if (selectedObject && selectedObject !== intersects[0].object) {
            selectedObject.scale.set(1, 1, 1);  
        }

        selectedObject = intersects[0].object;
        selectedObject.scale.set(scaleUpFactor, scaleUpFactor, scaleUpFactor); // bigger obj
    } else {
        if (selectedObject) {
            selectedObject.scale.set(1, 1, 1);  // Ripristina la scala originale se non c'è selezione
            selectedObject = null;
        }
    }
}

// Gestione degli eventi del mouse
window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    updateRaycaster();
});

window.addEventListener('mousedown', (event) => {
    updateRaycaster();

    if (selectedObject) {
        // Se un poliedro è selezionato, reindirizza all'URL associato
        const url = selectedObject.userData.url;
        if (url) {
            window.open(url, '_blank');
        }
    }
});

// Funzione di animazione
function animate() {
    requestAnimationFrame(animate);

    // Ruota i poliedri con velocità diverse in base alla selezione
    objects.forEach(obj => {
        if (obj === selectedObject) {
            obj.rotation.y += hoverRotationSpeed;
            obj.rotation.x += hoverRotationSpeed;
        } else {
            obj.rotation.y += normalRotationSpeed;
            obj.rotation.x += normalRotationSpeed;
        }
    });

    controls.update(); 
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
