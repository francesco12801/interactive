const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('webgl-canvas'), alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// Caricare le texture
const textureLoader = new THREE.TextureLoader();
const textures = [
    textureLoader.load('../assets/t_green.png'),
    textureLoader.load('../assets/t_yellow.png'),
    textureLoader.load('../assets/t_purple.png')
];

const particleCount = 1000;
const yOffset = 1.0;
const innerRadius = 3.0;
const outerRadius = 4.0;

function createParticleGroup(texture) {
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        const r = outerRadius;

        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta) + yOffset;
        const z = r * Math.cos(phi);

        positions[i] = x;
        positions[i + 1] = y;
        positions[i + 2] = z;

        velocities[i] = 0;
        velocities[i + 1] = 0;
        velocities[i + 2] = 0;
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

    const particleMaterial = new THREE.PointsMaterial({
        size: 0.3,
        map: texture,
        transparent: true,
        depthTest: true,
        depthWrite: false,
        blending: THREE.NormalBlending
    });

    return new THREE.Points(particles, particleMaterial);
}

function createTextParticleGroup(text, font, size, position) {
    const shapes = font.generateShapes(text, size);
    const geometry = new THREE.ShapeGeometry(shapes);
    geometry.computeBoundingBox();
    
    const midX = (geometry.boundingBox.max.x - geometry.boundingBox.min.x) / 2;
    const midY = (geometry.boundingBox.max.y - geometry.boundingBox.min.y) / 2;

    geometry.translate(-midX + position.x, -midY + position.y + 2, position.z); // Sposta in alto

    const vertices = geometry.attributes.position.array;
    const positions = [];

    for (let i = 0; i < vertices.length; i += 3) {
        positions.push(new THREE.Vector3(vertices[i], vertices[i + 1], vertices[i + 2]));
    }

    const textParticles = new THREE.BufferGeometry();
    const positionsArray = new Float32Array(positions.length * 3);

    positions.forEach((position, index) => {
        positionsArray[index * 3] = position.x;
        positionsArray[index * 3 + 1] = position.y;
        positionsArray[index * 3 + 2] = position.z;
    });

    textParticles.setAttribute('position', new THREE.BufferAttribute(positionsArray, 3));

    const particleMaterial = new THREE.PointsMaterial({
        size: 0.2, // Ridotto per rendere il testo più piccolo
        map: textureLoader.load('../assets/t_green.png'), // Usa una texture qualsiasi
        transparent: true,
        depthTest: true,
        depthWrite: false,
        blending: THREE.NormalBlending
    });

    return new THREE.Points(textParticles, particleMaterial);
}

const particleGroups = textures.map(createParticleGroup);
particleGroups.forEach(group => scene.add(group));

camera.position.z = 10;

let clock = new THREE.Clock();
let mouse = new THREE.Vector2();
let mouseEffectRadius = 0.5;
let textCreated = false;
let photoDisplayed = false;

window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

function animate() {
    requestAnimationFrame(animate);

    let time = clock.getElapsedTime();

    // Calcola cursorPosition all'inizio dell'animazione
    let vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
    vector.unproject(camera);

    let dir = vector.sub(camera.position).normalize();
    let distance = -camera.position.z / dir.z;
    let cursorPosition = camera.position.clone().add(dir.multiplyScalar(distance));

    if (time > 15 && !textCreated) {
        // Rimuovi tutte le particelle esistenti
        particleGroups.forEach(group => scene.remove(group));

        // Carica il font e crea le particelle per il testo
        const loader = new THREE.FontLoader();
        loader.load('../font/montserrat.json', function (font) {
            const textParticleGroup = createTextParticleGroup('Francesco Tinessa', font, 1, { x: 0, y: 0, z: 0 }); // Dimensioni ridotte
            scene.add(textParticleGroup);
        });

        textCreated = true;
    }

    if (time > 15 && !photoDisplayed) {
        // Creazione del riquadro tondo
        const photoTexture = textureLoader.load('../assets/bsc.jpeg');
        const photoMaterial = new THREE.MeshBasicMaterial({ map: photoTexture, side: THREE.DoubleSide });
        const photoGeometry = new THREE.CircleGeometry(4, 32); // Aumenta il raggio per ingrandire la foto
        const photoMesh = new THREE.Mesh(photoGeometry, photoMaterial);
        photoMesh.position.set(0, 0, -5);
        scene.add(photoMesh);
        photoDisplayed = true;
    }

    particleGroups.forEach(group => {
        const positionsAttribute = group.geometry.getAttribute('position');
        const velocitiesAttribute = group.geometry.getAttribute('velocity');

        for (let i = 0; i < particleCount; i++) {
            const index = i * 3;

            let currentPosition = new THREE.Vector3(
                positionsAttribute.getX(i),
                positionsAttribute.getY(i),
                positionsAttribute.getZ(i)
            );

            let distanceFromCenter = currentPosition.length();
            let waveEffect = Math.sin(time * 2 + distanceFromCenter * 2) * 0.5;

            positionsAttribute.setXYZ(
                i,
                positionsAttribute.getX(i) + waveEffect * (outerRadius - innerRadius),
                positionsAttribute.getY(i) + waveEffect * (outerRadius - innerRadius),
                positionsAttribute.getZ(i) + waveEffect * (outerRadius - innerRadius)
            );

            let particlePosition = new THREE.Vector3(
                positionsAttribute.getX(i),
                positionsAttribute.getY(i),
                positionsAttribute.getZ(i)
            );
            let distanceToCursor = particlePosition.distanceTo(cursorPosition);

            if (distanceToCursor < mouseEffectRadius) {
                let attraction = cursorPosition.clone().sub(particlePosition).multiplyScalar(0.1);
                velocitiesAttribute.setXYZ(
                    i,
                    velocitiesAttribute.getX(i) + attraction.x,
                    velocitiesAttribute.getY(i) + attraction.y,
                    velocitiesAttribute.getZ(i) + attraction.z
                );
            }

            positionsAttribute.setXYZ(
                i,
                positionsAttribute.getX(i) + velocitiesAttribute.getX(i),
                positionsAttribute.getY(i) + velocitiesAttribute.getY(i),
                positionsAttribute.getZ(i) + velocitiesAttribute.getZ(i)
            );

            velocitiesAttribute.setXYZ(
                i,
                velocitiesAttribute.getX(i) * 0.9,
                velocitiesAttribute.getY(i) * 0.9,
                velocitiesAttribute.getZ(i) * 0.9
            );
        }

        positionsAttribute.needsUpdate = true;
        velocitiesAttribute.needsUpdate = true;
    });

    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});
