import { THREE, GLTFLoader, OrbitControls } from './import-three.js';

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('exp-section');

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

    // Aggiungi la luce ambientale e la luce direzionale
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(ambientLight);
    scene.add(directionalLight);

    // Funzione per generare le stelle
    let stars, starGeometry, starMaterial;
    function createStarField() {
        starGeometry = new THREE.BufferGeometry();
        starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 1.0,
            sizeAttenuation: true,
            map: new THREE.TextureLoader().load('../assets/textures/star.jpg'), 
            transparent: true,
        });

        const starsCount = 100000;
        const positions = new Float32Array(starsCount * 3);
        const initialY = 1000; // Altezza iniziale delle stelle

        for (let i = 0; i < starsCount; i++) {
            const x = Math.random() * 2000 - 1000;
            const y = initialY; // Tutte le stelle partono dalla stessa altezza
            const z = Math.random() * 2000 - 1000;

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
        }

        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        stars = new THREE.Points(starGeometry, starMaterial);
        scene.add(stars);
    }
    
    createStarField();

    // Carica il modello GLTF
    function loadGLTFModel(url) {
        const loader = new GLTFLoader();
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load('../assets/textures/rock.jpg');

        loader.load(url, (gltf) => {
            const model = gltf.scene;

            // Applica la texture ai materiali del modello
            model.traverse((node) => {
                if (node.isMesh) {
                    node.material.map = texture;
                    node.material.needsUpdate = true;
                }
            });

            // Aggiungi il modello alla scena
            scene.add(model);
            
            // Posizionare e scalare il modello
            model.position.set(0, 0, 0);
            model.scale.set(10, 10, 10);
        }, undefined, (error) => {
            console.error('Errore nel caricamento del modello GLTF:', error);
        });
    }

    // Aggiungi l'URL del tuo modello GLTF qui
    loadGLTFModel('../assets/stonehenge.gltf');

    // Posizionare la camera
    camera.position.z = 700;
    camera.position.y = 400;

    // Variabili per controllare l'animazione ondulatoria
    let time = 0;
    const waveAmplitude = 10; // Altezza delle onde
    const waveFrequency = 0.02; // Frequenza delle onde (più bassa per onde più larghe e fluide)
    const waveSpeed = 0.02; // Velocità del movimento ondulatorio

    // Funzione di animazione
    function animate() {
        requestAnimationFrame(animate);
        
        // Aggiorna la posizione delle stelle per simulare la caduta e l'ondulazione
        const positions = starGeometry.attributes.position.array;
        const speed = 1; // Velocità di caduta
        const stopY = 0; // Altezza a cui fermarsi

        for (let i = 0; i < positions.length; i += 3) {
            // Simula la caduta delle stelle
            if (positions[i + 1] > stopY) {
                positions[i + 1] -= speed;
                if (positions[i + 1] < stopY) {
                    positions[i + 1] = stopY;
                }
            } else {
                // Applica l'onda sinusoidale dopo che le stelle si sono fermate
                positions[i + 1] = stopY + Math.sin(time + positions[i] * waveFrequency + positions[i + 2] * waveFrequency) * waveAmplitude;
            }
        }

        starGeometry.attributes.position.needsUpdate = true;

        // Incrementa il tempo per l'effetto ondulatorio
        time += waveSpeed;

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
