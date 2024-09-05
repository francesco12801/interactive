import { THREE } from './import-three.js';

let scene, 
    camera, 
    renderer,  
    cloudParticles = [], 
    flash, 
    rain, 
    rainGeo, 
    rainCount = 15000; 

function init() {
    const container = document.getElementById('contact-section');  

    // Setup scena
    scene = new THREE.Scene(); 
    scene.fog = new THREE.FogExp2(0x00000f, 0.001);  // Nebbia meno densa

    // Setup camera
    camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 1, 1000);
    camera.position.z = 50;  
    camera.position.y = 10;
    camera.rotation.x = -0.5; 
    // Luci
    const ambient = new THREE.AmbientLight(0x202020); 
    scene.add(ambient);
    const directionalLight = new THREE.DirectionalLight(0xffeedd);
    directionalLight.position.set(0, 10, 10); 
    scene.add(directionalLight);

   
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    flash = new THREE.PointLight(0xffffff, 50, 700, 2.5);
    const pointLightHelper = new THREE.PointLightHelper(flash);
    scene.add( pointLightHelper );
    flash.position.set(0, 100, 100);  // Posizione più centrale
    flash.castShadow = true;  // Abilita le ombre
    scene.add(flash);

    // Debug visuale per il flash
    const flashDebug = new THREE.Mesh(
       new THREE.SphereGeometry(5, 16, 8),
       new THREE.MeshBasicMaterial({ color: 0xffff00 })
    );
    flashDebug.position.copy(flash.position);
    scene.add(flashDebug);

    // Setup renderer
    renderer = new THREE.WebGLRenderer();
    renderer.shadowMap.enabled = true; 
    renderer.setClearColor(scene.fog.color); 
    renderer.setSize(container.clientWidth, container.clientHeight);  
    container.appendChild(renderer.domElement);  

    // Creazione delle particelle di pioggia
    rainGeo = new THREE.BufferGeometry(); 
    let positions = new Float32Array(rainCount * 3);
    let sizes = new Float32Array(rainCount);

    for (let i = 0; i < rainCount; i++) {
        positions[i * 3] = Math.random() * 400 - 200;
        positions[i * 3 + 1] = Math.random() * 500 - 250;
        positions[i * 3 + 2] = Math.random() * 400 - 200;
        sizes[i] = 30;
    }

    rainGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    rainGeo.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

    const rainMaterial = new THREE.PointsMaterial({
        color: 0xaaaaaa, 
        size: 0.1, 
        transparent: true
    });

    rain = new THREE.Points(rainGeo, rainMaterial);
    scene.add(rain);

    // Creazione delle particelle di nuvole
    let loader = new THREE.TextureLoader(); 
    loader.load('../assets/textures/cloud.png', function(texture) {
        const cloudGeo = new THREE.PlaneGeometry(500, 500);  
        const cloudMaterial = new THREE.MeshLambertMaterial({
            map: texture, 
            transparent: true
        });

        for (let p = 0; p < 25; p++) {
            let cloud = new THREE.Mesh(cloudGeo, cloudMaterial); 
            cloud.position.set(
                Math.random() * 800 - 400, 
                500, 
                Math.random() * 500 - 450
            ); 
            cloud.rotation.x = 1.16; 
            cloud.rotation.y = -0.12; 
            cloud.rotation.z = Math.random() * 2 * Math.PI; 
            cloud.material.opacity = 0.55; 
            cloudParticles.push(cloud); 
            scene.add(cloud);
        }

        animate(); 
        window.addEventListener("resize", onWindowResize); 
    });
}

function animate() {
    cloudParticles.forEach((p) => {
        p.rotation.z -= 0.002; 
    });

    const positions = rainGeo.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] -= 0.3;
        if (positions[i + 1] < -200) {
            positions[i + 1] = 200;
        }
    }
    rainGeo.attributes.position.needsUpdate = true;

    // Controllo dei lampi di luce
    if (Math.random() > 0.95 || flash.power > 100) {
        if (flash.power < 100) { 
            flash.position.set(
                Math.random() * 400, 
                300 + Math.random() * 200, 
                100
            ); 
            flash.power = 300 + Math.random() * 700;
            console.log('Flash activated:', flash.power);
        } else {
            flash.power *= 0.98;
        }
    }

    renderer.render(scene, camera); 
    requestAnimationFrame(animate);
}

function onWindowResize() {
    const container = document.getElementById('contact-section');
    camera.aspect = container.clientWidth / container.clientHeight; 
    camera.updateProjectionMatrix(); 
    renderer.setSize(container.clientWidth, container.clientHeight);
}

init();
