
// main.js (o qualsiasi altro file)
import { THREE, OrbitControls, OBJLoader} from './import-three.js';



function initThreeJS(containerId) {

    const container = document.getElementById(containerId);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 2, 50);
    pointLight.position.set(0, 0, 5);
    scene.add(pointLight);

    const sphereGeometry = new THREE.SphereGeometry(0.002, 16, 16);
    const sphereMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 0.5,
        roughness: 0,
        metalness: 1,
        transparent: true,
        opacity: 0.9
    });

    const particlesCount = 50000;
    const instancedMesh = new THREE.InstancedMesh(sphereGeometry, sphereMaterial, particlesCount);
    scene.add(instancedMesh);

    const dummyObject = new THREE.Object3D();

    for (let i = 0; i < particlesCount; i++) {
        const x = (Math.random() - 0.5) * 2;
        const y = (Math.random() - 0.5) * 2;
        const z = (Math.random() - 0.5) * 2;

        dummyObject.position.set(x, y, z);
        dummyObject.updateMatrix();
        instancedMesh.setMatrixAt(i, dummyObject.matrix);
    }

    const shockwaveGeometry = new THREE.RingGeometry(1, 1.5, 32);
    const shockwaveMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5
    });
    const shockwave = new THREE.Mesh(shockwaveGeometry, shockwaveMaterial);
    scene.add(shockwave);
    shockwave.scale.set(0.01, 0.01, 0.01);

    camera.position.set(2, 2, 2);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;
    controls.zoomSpeed = 1.2;

    let aggregationParticle = 0; 
    let explosionSpeed = 1;
    let maxParticleSize = 15;
    let expanding = true;
    let isCondensing = false;
    const centerPosition = new THREE.Vector3(0, 0, 0);

    // Carica la texture
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('../assets/textures/particle_texture.jpg');

    // Carica il modello .obj
    const objLoader = new OBJLoader();
    let models = [];

    objLoader.load(
        '../assets/atom.obj', // Sostituisci con il percorso del tuo file .obj
        function (object) {
            // Clona il modello e aggiungi quattro istanze
            for (let i = 0; i < 4; i++) {
                const model = object.clone();
                
                // Applica la texture a tutti i materiali del modello
                model.traverse(function (child) {
                    if (child.isMesh) {
                        child.material.map = texture;
                        child.material.needsUpdate = true;
                    }
                });

                // Posiziona i modelli
                const angle = (i / 4) * Math.PI * 2; // Distribuzione circolare
                const radius = 1.5; // Distanza dal centro
                model.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);

                model.visible = false; // Nascondi inizialmente i modelli
                scene.add(model);
                models.push(model);
            }
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% caricato');
        },
        function (error) {
            console.error('Errore nel caricamento del modello', error);
        }
    );

    function condenseParticles() {
        for (let i = 0; i < particlesCount; i++) {
            instancedMesh.getMatrixAt(i, dummyObject.matrix);
            dummyObject.position.setFromMatrixPosition(dummyObject.matrix);

            const directionToCenter = centerPosition.clone().sub(dummyObject.position);
            const distanceToCenter = directionToCenter.length();
            directionToCenter.normalize();

            const speed = Math.max(0.001, distanceToCenter * 0.0001);
            dummyObject.position.add(directionToCenter.multiplyScalar(speed));

            dummyObject.updateMatrix();
            instancedMesh.setMatrixAt(i, dummyObject.matrix);
            aggregationParticle += 1; 
        }
        console.log(aggregationParticle); 
        instancedMesh.instanceMatrix.needsUpdate = true;

        if (aggregationParticle > 88750000){
            models.forEach(model => model.visible = true);
        } else {
            models.forEach(model => model.visible = false);
        }
    }

    container.addEventListener('mouseenter', () => {
        isCondensing = true;
    });

    container.addEventListener('mouseleave', () => {
        isCondensing = false;        
    });

    let cameraAngle = 0; // Angolo iniziale della telecamera
    let cameraStartPosition = { x: 2, y: 2, z: 2 }; // Posizione iniziale della telecamera
    let cameraEndPosition = { x: -8, y: -4, z: -4 }; // Posizione finale della telecamera
    let cameraSpeed = 0.01; // Velocità di spostamento della telecamera

    function animate() {
        requestAnimationFrame(animate);

        if (isCondensing) {
            condenseParticles();

            // Calcola la nuova posizione della telecamera basata sul progresso della condensazione
            const progress = Math.min(1, aggregationParticle / 88750000); // Normalizza il progresso tra 0 e 1
            camera.position.x = cameraStartPosition.x - (cameraStartPosition.x - cameraEndPosition.x) * progress;
            camera.position.y = cameraStartPosition.y - (cameraStartPosition.y - cameraEndPosition.y) * progress;
            camera.position.z = cameraStartPosition.z - (cameraStartPosition.z - cameraEndPosition.z) * progress;

        } else if (expanding) {
            explosionSpeed += 0.007;
            instancedMesh.scale.set(explosionSpeed, explosionSpeed, explosionSpeed);
            shockwave.scale.set(explosionSpeed * 5, explosionSpeed * 5, explosionSpeed * 5);

            if (explosionSpeed > maxParticleSize) {
                expanding = false;
            }
        } else {
            explosionSpeed -= 0.0005;

            if (explosionSpeed < 1) {
                explosionSpeed = 1;
                expanding = true;
            }
        }

        // Ruota la telecamera attorno all'asse X
        cameraAngle += 0.01;
        camera.position.y = Math.sin(cameraAngle) * 2;
        camera.position.z = Math.cos(cameraAngle) * 2;
        camera.lookAt(centerPosition);

        // Ruota anche la luce direzionale
        directionalLight.position.y = Math.sin(cameraAngle) * 2;
        directionalLight.position.z = Math.cos(cameraAngle) * 2;

        // Ruota gli oggetti se sono visibili
        models.forEach(model => {
            if (model.visible) {
                model.rotation.y += 0.01; 
            }
        });

        controls.update();
        renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}

initThreeJS('heart-container');
