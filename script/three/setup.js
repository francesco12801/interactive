import { THREE, GLTFLoader, OrbitControls } from './import-three.js';

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('land-section');

    // Imposta la scena, la camera e il renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Aggiungi i controlli di orbita
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;

    // Funzione per generare le stelle
    function createStarField() {
        const starGeometry = new THREE.BufferGeometry();
        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.1,
            sizeAttenuation: true,
            map: new THREE.TextureLoader().load('../assets/textures/star.jpg'), // Aggiungi il percorso alla tua texture di stella
            transparent: true,
        });

        const starsCount = 10000;
        const positions = new Float32Array(starsCount * 3);

        for (let i = 0; i < starsCount; i++) {
            const x = Math.random() * 2000 - 1000;
            const y = Math.random() * 2000 - 1000;
            const z = Math.random() * 2000 - 1000;

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
        }

        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const stars = new THREE.Points(starGeometry, starMaterial);
        scene.add(stars);
    }

    createStarField();

    // Carica il modello GLTF
    function loadGLTFModel(url) {
        const loader = new GLTFLoader();
        loader.load(url, (gltf) => {
            const model = gltf.scene;
            scene.add(model);
            
            // Posizionare e scalare il modello
            model.position.set(0, 0, 0);
            model.scale.set(10, 10, 10);
            
            // Impostare l'illuminazione per il modello
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
            directionalLight.position.set(1, 1, 1).normalize();
            scene.add(ambientLight);
            scene.add(directionalLight);
        }, undefined, (error) => {
            console.error('Errore nel caricamento del modello GLTF:', error);
        });
    }

    // Aggiungi l'URL del tuo modello GLTF qui
    loadGLTFModel('../assets/textures/blackhole.glb');

    // Posizionare la camera
    camera.position.z = 500;

    // Funzione di animazione
    function animate() {
        requestAnimationFrame(animate);
        
        // Rotazione della scena per dare l'effetto di movimento
        scene.rotation.y += 0.0005;

        // Controlli di orbita
        controls.update();

        renderer.render(scene, camera);
    }

    animate();

    // Aggiorna il renderer e la camera se la finestra viene ridimensionata
    window.addEventListener('resize', () => {
        const width = container.clientWidth;
        const height = container.clientHeight;

        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    });
});
