import { THREE, OrbitControls } from './import-three.js';

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('contact-section');

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 2000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.15;
    controls.enableZoom = true;

    function createGalaxy() {
        const starGeometry = new THREE.BufferGeometry();
        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 1.5,
            sizeAttenuation: true,
        });

        const starsCount = 10000;
        const positions = new Float32Array(starsCount * 3);
        const speeds = new Float32Array(starsCount);  // To store rotation speeds

        for (let i = 0; i < starsCount; i++) {
            const radius = Math.random() * 1000 + 200;  // Distance from the center
            const angle = Math.random() * Math.PI * 2;  // Random angle for initial position
            const height = (Math.random() - 0.5) * 200;  // Random height to give thickness to the galaxy

            positions[i * 3] = radius * Math.cos(angle);
            positions[i * 3 + 1] = height;
            positions[i * 3 + 2] = radius * Math.sin(angle);

            speeds[i] = Math.random() * 0.001 + 0.001;  // Random speed for each star
        }

        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const stars = new THREE.Points(starGeometry, starMaterial);
        scene.add(stars);

        // Animate the galaxy
        function animateGalaxy() {
            requestAnimationFrame(animateGalaxy);

            const positions = starGeometry.attributes.position.array;

            for (let i = 0; i < starsCount; i++) {
                const radius = Math.sqrt(positions[i * 3] ** 2 + positions[i * 3 + 2] ** 2);
                const angle = Math.atan2(positions[i * 3 + 2], positions[i * 3]);

                // Increment angle based on speed
                const newAngle = angle + speeds[i];

                positions[i * 3] = radius * Math.cos(newAngle);
                positions[i * 3 + 2] = radius * Math.sin(newAngle);
            }

            starGeometry.attributes.position.needsUpdate = true;

            controls.update();
            renderer.render(scene, camera);
        }

        animateGalaxy();
    }

    createGalaxy();

    camera.position.z = 1500;
    camera.position.y = 300;

    function animate() {
        requestAnimationFrame(animate);

        controls.update();
        renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
        const width = container.clientWidth;
        const height = container.clientHeight;

        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    });
});
