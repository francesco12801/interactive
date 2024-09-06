import { THREE, OrbitControls } from './import-three.js';

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

// Create star-shaped geometry
function createStarShape(radius) {
    const shape = new THREE.Shape();

    // Number of points of the star
    const points = 5;
    const outerRadius = radius;
    const innerRadius = radius / 2;

    // Generate star vertices
    for (let i = 0; i < points * 2; i++) {
        const angle = (i / (points * 2)) * Math.PI * 2;
        const r = (i % 2 === 0) ? outerRadius : innerRadius;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        if (i === 0) {
            shape.moveTo(x, y);
        } else {
            shape.lineTo(x, y);
        }
    }
    shape.closePath();

    return shape;
}

// Create textured star geometry
function createTexturedStar(radius, textureUrl) {
    const starShape = createStarShape(radius);
    
    // Extrude the 2D star shape into 3D
    const extrudeSettings = { depth: 0.3, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.1, bevelSegments: 5 }; // Increased bevelSegments
    const geometry = new THREE.ExtrudeGeometry(starShape, extrudeSettings);

    // Apply texture
    const texture = textureLoader.load(textureUrl);
    const material = new THREE.MeshStandardMaterial({ map: texture, emissive: 0x000000 });
    
    // Center UV mapping for better texture alignment
    geometry.center();
    geometry.computeBoundingBox();
    const max = geometry.boundingBox.max;
    const min = geometry.boundingBox.min;
    
    const uvAttribute = geometry.attributes.uv;
    for (let i = 0; i < uvAttribute.count; i++) {
        const u = (uvAttribute.getX(i) - min.x) / (max.x - min.x);
        const v = (uvAttribute.getY(i) - min.y) / (max.y - min.y);
        uvAttribute.setXY(i, u, v);
    }

    const mesh = new THREE.Mesh(geometry, material);

    // Create a bounding box for more accurate raycasting
    mesh.geometry.computeBoundingBox();
    return mesh;
}

const radius = 1.5;  // Raggio del poliedro
const spacing = 5;   // Spaziatura tra i poliedri
const rows = 2;
const cols = 4;

// Crea e posiziona i poliedri in una matrice
const objects = [];
for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
        const index = row * cols + col;
        if (index < textureUrls.length) {
            const star = createTexturedStar(radius, textureUrls[index]);
            star.position.x = (col - (cols - 1) / 2) * spacing;
            star.position.y = (row - (rows - 1) / 2) * spacing;
            scene.add(star);
            objects.push(star);
        }
    }
}

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

// Focus directional light 
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 7.5); // from the top 
directionalLight.castShadow = true; // Attiva le ombre
scene.add(directionalLight);

// PointLight per riflessi sulle stelle
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
let hoveredObject = null;

function updateRaycaster() {

    raycaster.setFromCamera(mouse, camera);

    // Find Object 
    const intersects = raycaster.intersectObjects(objects);

    if (intersects.length > 0) {
        if (hoveredObject && hoveredObject !== intersects[0].object) {
            // Deseleziona l'oggetto 
            hoveredObject.material.emissive.set(0x000000);
        }

        hoveredObject = intersects[0].object;
        hoveredObject.material.emissive.set(0xffcc00); // Colore brillante quando passo il mouse on 
    } else {
        if (hoveredObject) {
            hoveredObject.material.emissive.set(0x000000); // Reset emissive when not hovered
            hoveredObject = null;
        }
    }
}

// Ascolta i movimenti del mouse
window.addEventListener('mousemove', (event) => {
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
