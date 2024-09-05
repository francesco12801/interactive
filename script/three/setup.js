

import { THREE, OrbitControls, FontLoader, TextGeometry } from './import-three.js';

// Shaders
const vertexShader = `
    varying vec2 vUv;
    uniform float time;

    void main() {
        vUv = uv;
        vec3 pos = position;
        // Apply more distortion to the vertex position
        pos.z += sin(vUv.x * 20.0 + time) * 20.0;
        pos.y += cos(vUv.y * 20.0 + time) * 20.0;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
`;

const fragmentShader = `
    varying vec2 vUv;

    void main() {
        // Color output with gradient effect based on distortion
        gl_FragColor = vec4(vUv, 0.0, 1.0);
    }
`;

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('land-section');

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.15;
    controls.enableZoom = true;

    // Create a sphere
    const sphereGeometry = new THREE.SphereGeometry(200, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa, wireframe: true });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.y = -250; // Offset per spostare la sfera verso il basso
    scene.add(sphere);

    function createDistortedText() {
        const loader = new FontLoader();
        loader.load('../font/montserrat.json', (font) => {
            const text = 'WELCOME EVERYONE';
            const letterMeshes = [];
            const radius = 300; // Radius of the circle where letters will be positioned, must be grater than the sphere

            // Create a temporary text geometry to calculate total text width
            const tempGeometry = new TextGeometry(text, {
                font: font,
                size: 50, // Reduced size
                height: 10, // Reduced height
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 3,
                bevelSize: 1,
                bevelOffset: 0,
                bevelSegments: 5,
            });

            tempGeometry.computeBoundingBox();
            const boundingBox = tempGeometry.boundingBox;
            const totalTextWidth = boundingBox.max.x - boundingBox.min.x;

            // Create individual letter meshes
            let accumulatedWidth = 0;
            const totalLetterWidth = totalTextWidth;
            for (let i = 0; i < text.length; i++) {
                const letter = text[i];
                const textGeometry = new TextGeometry(letter, {
                    font: font,
                    size: 50, // Reduced size
                    height: 10, // Reduced height
                    curveSegments: 12,
                    bevelEnabled: true,
                    bevelThickness: 3,
                    bevelSize: 1,
                    bevelOffset: 0,
                    bevelSegments: 5,
                });

                textGeometry.computeBoundingBox();
                const boundingBox = textGeometry.boundingBox;
                const letterWidth = boundingBox.max.x - boundingBox.min.x;

                // Update the geometry to center each letter correctly
                textGeometry.translate(-letterWidth / 2, 0, 0);

                const textMaterial = new THREE.ShaderMaterial({
                    vertexShader,
                    fragmentShader,
                    uniforms: {
                        time: { value: 0 },
                    },
                });

                const letterMesh = new THREE.Mesh(textGeometry, textMaterial);

                // Calculate the angle and position for each letter (inverted direction)
                const angle = -(accumulatedWidth / totalLetterWidth) * Math.PI * 2;
                letterMesh.position.set(
                    radius * Math.cos(angle),
                    -100, // Offset per spostare le scritte verso il basso
                    radius * Math.sin(angle)
                );

                // Rotate each letter to face outward correctly without mirroring
                letterMesh.rotation.y = angle + Math.PI; // Correct rotation to face outward

                scene.add(letterMesh);
                letterMeshes.push(letterMesh);

                accumulatedWidth += letterWidth;
            }

            // Add one more letter to complete the loop and create space
            const spaceGeometry = new TextGeometry(' ', {
                font: font,
                size: 50, // Reduced size
                height: 10, // Reduced height
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 3,
                bevelSize: 1,
                bevelOffset: 0,
                bevelSegments: 5,
            });

            spaceGeometry.computeBoundingBox();
            const spaceBoundingBox = spaceGeometry.boundingBox;
            const spaceWidth = spaceBoundingBox.max.x - spaceBoundingBox.min.x;

            const spaceMesh = new THREE.Mesh(spaceGeometry, new THREE.MeshBasicMaterial({ color: 0xffffff }));
            const spaceAngle = -((accumulatedWidth + spaceWidth) / totalLetterWidth) * Math.PI * 2;
            spaceMesh.position.set(
                radius * Math.cos(spaceAngle),
                -100, // Offset per spostare lo spazio verso il basso
                radius * Math.sin(spaceAngle)
            );
            spaceMesh.rotation.y = spaceAngle + Math.PI; // Correct rotation to face outward

            scene.add(spaceMesh);
            letterMeshes.push(spaceMesh);

            // Animate the shader for each letter
            function animateShader() {
                requestAnimationFrame(animateShader);

                const time = Date.now() * 0.001; // Time in seconds
                letterMeshes.forEach((letterMesh, index) => {
                    letterMesh.material.uniforms.time.value = time + index * 0.5; // Offset time for each letter
                });

                // Rotate the entire scene in the opposite direction to make the letters orbit around the sphere
                scene.rotation.y -= 0.001; // Inverted direction

                controls.update();
                renderer.render(scene, camera);
            }

            animateShader();
        });
    }

    function createStarField() {
        const starGeometry = new THREE.BufferGeometry();
        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 1.0,
            sizeAttenuation: true,
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
    createDistortedText();

    camera.position.z = 700;
    camera.position.y = 200;

    function animate() {
        requestAnimationFrame(animate);

        scene.rotation.y -= 0.003; // Inverted direction
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
