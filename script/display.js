import { ParticleUniverse } from './gravity_manager.js';
import { Particle } from './particle.js';

var galaxy_background = ParticleUniverse.nebular;
ParticleUniverse.mesh = new THREE.PointCloud();
ParticleUniverse.meshGas = new THREE.PointCloud();
ParticleUniverse.meshVfx = new THREE.PointCloud();
// Maybe i need also the Schwarzschild Metric for Gargantua. Let's go ahead. 
// General variables  
var scene;
var camera;
var renderer;
var meshGas;
var meshVfx;
var mesh;
var bodies;
var loader; 
var bodiesVfx;
var bodiesGas;
// White Hole 
var cone1;
var cone2;
// Nana Rossa Mesh 
var red_dwarf_mesh;
var red_dwarf_material;
var red_dwarf_geometry;
const red_dwarf_texture = new THREE.TextureLoader().load('../assets/nanaRossa.png');
var animationInProgress = false;

(function () {

    ParticleUniverse.updateViewport = function (window, renderer, camera, skybox) {
        var w = window.innerWidth;
        var h = window.innerHeight;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        skybox.camera.aspect = w / h;
        skybox.camera.updateProjectionMatrix();
    };

    function createWhiteHole() {
        var height = 1000;  // Height of the cone
        var bottomRadius = 1000;  // Radius of the bottom of the cone
        var topRadius = 0;  // Radius of the top of the cone (0 for hollow)
        var radialSegments = 64;  // Number of segmented faces around the circumference
        var heightSegments = 1;  // Number of segmented faces along the height of the cone

        var coneGeometry = new THREE.CylinderGeometry(
            topRadius,     // radiusTop
            bottomRadius,  // radiusBottom
            height,        // height
            radialSegments,// radialSegments
            heightSegments,// heightSegments
            true           // openEnded (true for hollow)
        );

        var coneMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.5,
            shininess: 0,
            emissive: 0xffffff,
            emissiveIntensity: 1
        });

        // Create first cone and position it
        cone1 = new THREE.Mesh(coneGeometry, coneMaterial);
        cone1.position.set(0, -height/2, 0);  // Adjust position to center correctly
        scene.add(cone1);

        // Create second cone, rotate and position it
        cone2 = new THREE.Mesh(coneGeometry, coneMaterial);
        cone2.rotation.x = Math.PI;
        cone2.position.set(0, height/2, 0);  // Adjust position to center correctly
        scene.add(cone2);
    }


    function createCloudGeometryFromBodies(bodies) {
        // create the particle variables
        var particleCount = bodies.length;
        var particles = new THREE.Geometry();
        var colors = new Array(particleCount);

        // now create the individual particles
        for (var p = 0; p < particleCount; p++) {
            particle = bodies[p].position;
            // add it to the geometry
            particles.vertices.push(particle);
            colors[p] = new THREE.Color(1, 1, 1);
        }
        particles.colors = colors;
        return particles;
    }

    function colorParticles(bodies, pointCloud, colorSelectingFunc) {
        var particleCount = bodies.length;
        var particles = new THREE.Geometry();

        for (var p = 0; p < particleCount; p++) {
            particles = bodies[p].position;
            var massFactor = bodies[p].mass / ParticleUniverse.TYPICAL_STAR_MASS;

            colorSelectingFunc(bodies[p], pointCloud.geometry.colors[p]);
        }
        pointCloud.geometry.colorsNeedUpdate = true;
    }


    function colorStar(body, existingColor) {
        if (body.mass > 0.9999 * ParticleUniverse.TYPICAL_STAR_MASS * 300) {
            // Black hole color
            color = new THREE.Color(0, 0, 0);
        }
        else {
            // Normal color
            var massFactor = body.mass / ParticleUniverse.TYPICAL_STAR_MASS;

            if (massFactor < 0.002) {
                existingColor.setRGB(
                    0.9 + 0.1 * Math.random(),
                    0.4 + 0.4 * Math.random(),
                    0.4 + 0.4 * Math.random()
                );
            }
            else if (massFactor < 0.004) {
                existingColor.setRGB(
                    0.5 + 0.1 * Math.random(),
                    0.5 + 0.2 * Math.random(),
                    0.9 + 0.1 * Math.random()
                );
            } else {
                existingColor.setRGB(
                    0.6 + 0.4 * massFactor,
                    0.6 + 0.4 * massFactor,
                    0.5 + 0.3 * massFactor
                );
            }
        }
    }

    function colorGasCloud(body, existingColor) {
        var massFactor = body.mass / ParticleUniverse.TYPICAL_STAR_MASS;
        existingColor.setHSL(0.665 + Math.random() * 0.335, 0.9, 0.5 + 0.5 * Math.random());
    }


    function animateRedDwarf() {

        requestAnimationFrame(animateRedDwarf);
        // Rotation update 
        red_dwarf_mesh.rotation.x = Date.now() * 0.00005;
        red_dwarf_mesh.rotation.y = Date.now() * 0.0001;
    }

    function transitionToBlackHole() {
        animationInProgress = true;

        requestAnimationFrame(transitionToBlackHole);
        // Scale update 
        if (animationInProgress) {
            var scale = red_dwarf_mesh.scale.x - 0.02;
            if (scale <= 0) {
                scale = 0; // deal with negative scale 
            }
            red_dwarf_mesh.scale.set(scale, scale, scale);
        }
        red_dwarf_material.map.needsUpdate = true;
        renderer.render(scene, camera);
    }

    function createSkyboxStuff(urls) {
        // Make a skybox

        var skyboxScene = new THREE.Scene();
        var skyboxCamera = new THREE.PerspectiveCamera(
            65,
            window.innerWidth / window.innerHeight,
            100,
            60000
        );

        var cubemap = new THREE.CubeTextureLoader()
            .setPath(ParticleUniverse.backPath)
            .load(urls);

        cubemap.format = THREE.RGBFormat;

        var skyboxShader = THREE.ShaderLib['cube']; // init cube shader from built-in lib
        skyboxShader.uniforms['tCube'].value = cubemap; // apply textures to shader

        // create shader material
        var skyBoxMaterial = new THREE.ShaderMaterial({
            fragmentShader: skyboxShader.fragmentShader,
            vertexShader: skyboxShader.vertexShader,
            uniforms: skyboxShader.uniforms,
            depthWrite: false,
            side: THREE.BackSide
        });

        // create skybox mesh
        var skybox = new THREE.Mesh(
            new THREE.BoxGeometry(50000, 50000, 50000),
            skyBoxMaterial
        );
        skyboxScene.add(skybox);

        ParticleUniverse.skyBoxMaterial = skyBoxMaterial;

        return { scene: skyboxScene, camera: skyboxCamera };
    }




    function render_all(urls) {
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(300, 200);
        renderer.setClearColor(0x000000);
        renderer.sortObjects = false;
        document.body.appendChild(renderer.domElement);
        scene = new THREE.Scene();


        camera = new THREE.PerspectiveCamera(
            45,         // Field of view
            1200 / 800,  // Aspect ratio
            .0001 * ParticleUniverse.MILKY_WAY_DIAMETER * ParticleUniverse.UNIVERSE_SCALE,         // Near
            20 * ParticleUniverse.MILKY_WAY_DIAMETER * ParticleUniverse.UNIVERSE_SCALE       // Far
        );

        var controls = new THREE.OrbitControls(camera, renderer.domElement);

        controls.minDistance = 300;
        controls.maxDistance = 100000;

        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.4;

        camera.position.set(2870, 1070, -275);

        var skybox = createSkyboxStuff(urls);
        ParticleUniverse.updateViewport(window, renderer, camera, skybox);
        window.addEventListener('resize', function () {
            ParticleUniverse.updateViewport(window, renderer, camera, skybox)
        }
        );


        var materials = ParticleUniverse.createParticleMaterial();

        var FAR_UPDATE_PERIOD = 2.0; // How long between updates of far interactions
        var FAR_BODYCOUNT_PER_60FPS_FRAME = Math.max(1, Math.ceil(ParticleUniverse.BODYCOUNT /
            (120 * FAR_UPDATE_PERIOD)));

        var blackholearray = []
        bodies = ParticleUniverse.createGravitySystem(ParticleUniverse.BODYCOUNT,
            ParticleUniverse.TYPICAL_STAR_MASS, ParticleUniverse.NUMBLACKHOLES, blackholearray);
        for (var i = 0; i < ParticleUniverse.NUMBLACKHOLES; i++) {
            blackholearray.push(bodies[i].position)
        }
        bodiesVfx = ParticleUniverse.createGravitySystem(ParticleUniverse.BODYCOUNT_VFX,
            0.3 * ParticleUniverse.TYPICAL_STAR_MASS, 0, blackholearray);
        bodiesGas = ParticleUniverse.createGravitySystem(ParticleUniverse.BODYCOUNT_GAS,
            0.2 * ParticleUniverse.TYPICAL_STAR_MASS, 0, blackholearray);


        mesh = new THREE.PointCloud(createCloudGeometryFromBodies(bodies),
            materials.bright);
        mesh.frustumCulled = false;
        ParticleUniverse.mesh = mesh;
        meshVfx = new THREE.PointCloud(createCloudGeometryFromBodies(bodiesVfx),
            materials.brightSmall);
        meshVfx.frustumCulled = false;
        ParticleUniverse.meshVfx = meshVfx;
        meshGas = new THREE.PointCloud(createCloudGeometryFromBodies(bodiesGas),
            materials.gasCloud);
        meshGas.frustumCulled = false;
        ParticleUniverse.meshGas = meshGas;


        colorParticles(bodies, mesh, colorStar);
        colorParticles(bodiesVfx, meshVfx, colorStar);
        colorParticles(bodiesGas, meshGas, colorGasCloud);


        // Create nana Rossa 

        red_dwarf_geometry = new THREE.SphereGeometry(600, 600, 600);

        red_dwarf_material = new THREE.MeshBasicMaterial({
            map: red_dwarf_texture,
            wireframe: true,
        });


        red_dwarf_mesh = new THREE.Mesh(red_dwarf_geometry, red_dwarf_material);

        // Add desired order of rendering
        scene.add(meshGas);
        scene.add(mesh);
        scene.add(meshVfx);
        scene.add(red_dwarf_mesh);
        scene.add(loader);
        animateRedDwarf();

        var CAMERA_MODES = { ORBIT: 0, CUSTOM: 2 }
        var cameraMode = CAMERA_MODES.CUSTOM;

        var TIME_SCALE = Math.pow(10, 9);
        var timeScale = TIME_SCALE;

        // reset initial parameters (in case of restart of scene)

        ParticleUniverse.GRAVITATIONAL_CONSTANT = 0.5 * ParticleUniverse.G;
        ParticleUniverse.G_SCALE = 0.5;

        var PAUSED = false;
        var GRAVITY_OVERRIDE = false;


        function render() {

            renderer.autoclear = false;
            renderer.autoClearColor = false;
            skybox.camera.quaternion.copy(camera.quaternion);
            renderer.render(skybox.scene, skybox.camera);
            renderer.render(scene, camera);

        }

        var lastT = 0.0;
        var accumulatedFarDt = 0.0;
        var update_counter = 0;
        var accumulatedRealDtTotal = 0.0;
        var gravityApplicator = ParticleUniverse.createTwoTierSmartGravityApplicator(bodies, bodies);
        var gravityApplicatorVfx = ParticleUniverse.createTwoTierSmartGravityApplicator(bodiesVfx, bodies);
        var gravityApplicatorGas = ParticleUniverse.createTwoTierSmartGravityApplicator(bodiesGas, bodies);
        gravityApplicator.updateForces(bodies.length);
        gravityApplicatorVfx.updateForces(bodiesVfx.length);
        gravityApplicatorGas.updateForces(bodiesGas.length);

        var started = false;
        startParticleUniverseulation();


        function flattenToDisk(bodies) {
            for (var i = 0; i < bodies.length; i++) {
                if (Math.abs(bodies[i].position.y) > 100 &&
                    (bodies[i].position.y > 0 && bodies[i].velocity.y > 0
                        || bodies[i].position.y < 0 && bodies[i].velocity.y < 0))
                    bodies[i].velocity.y /= 2;
            }
        }



        function startParticleUniverseulation() {
            function update(t) {
                var dt = (t - lastT) * 0.001;
                dt = Math.min(1 / 60.0, dt); // Clamp
                accumulatedRealDtTotal += dt;

                var positionScale = 1.5 * ParticleUniverse.MILKY_WAY_DIAMETER * ParticleUniverse.UNIVERSE_SCALE;

                if (cameraMode === CAMERA_MODES.ORBIT) {
                    var cameraRotationSpeed = 0.01; // default: 0.03
                    camera.position.copy(bodies[0].position);
                    camera.position.add(new THREE.Vector3(
                        Math.cos(accumulatedRealDtTotal * cameraRotationSpeed) * positionScale,
                        0.5 * positionScale * 0.7 * Math.sin(accumulatedRealDtTotal * 0.2),
                        Math.sin(accumulatedRealDtTotal * cameraRotationSpeed) * positionScale
                    ));

                    var cameraLookatRotationSpeed = 0; // default: 0.01
                    var cameraLookAtScale = 0.2 * positionScale;
                    var cameraLookAtPos = new THREE.Vector3().copy(bodies[0].position);
                    cameraLookAtPos.add(new THREE.Vector3(
                        Math.cos(accumulatedRealDtTotal * cameraLookatRotationSpeed) * cameraLookAtScale,
                        -positionScale * 0.07 * Math.sin(accumulatedRealDtTotal * 0.2),
                        Math.sin(accumulatedRealDtTotal * cameraLookatRotationSpeed) * cameraLookAtScale
                    ))
                    camera.lookAt(cameraLookAtPos);
                }


                dt *= timeScale;
                accumulatedFarDt += dt;

                // This step updates positions
                Particle.velocityVerletUpdate(bodies, dt, true);
                Particle.velocityVerletUpdate(bodiesVfx, dt, true);
                
                Particle.velocityVerletUpdate(bodiesGas, dt, true);

                for (var i = 0, len = bodies.length; i < len; i++) {
                    mesh.geometry.vertices[i].copy(bodies[i].position);
                }

                for (var i = 0, len = bodiesVfx.length; i < len; i++) {
                    meshVfx.geometry.vertices[i].copy(bodiesVfx[i].position);
                }

                for (var i = 0, len = bodiesGas.length; i < len; i++) {
                    meshGas.geometry.vertices[i].copy(bodiesGas[i].position);
                }
                if (ParticleUniverse.GRAVITATIONAL_CONSTANT !== 0) {

                    if (accumulatedFarDt >= TIME_SCALE / 60.0) {
                        gravityApplicator.updateForces(FAR_BODYCOUNT_PER_60FPS_FRAME);
                        gravityApplicatorVfx.updateForces(FAR_BODYCOUNT_PER_60FPS_FRAME * 20);
                        gravityApplicatorGas.updateForces(FAR_BODYCOUNT_PER_60FPS_FRAME);
                        accumulatedFarDt -= TIME_SCALE / 60;
                        update_counter = (update_counter + 1) % 100;
                    }

                    if (update_counter === 0 && ParticleUniverse.G_SCALE < 2.0) {
                        if (!GRAVITY_OVERRIDE)
                            ParticleUniverse.GRAVITATIONAL_CONSTANT = ParticleUniverse.G_SCALE * ParticleUniverse.G;
                        ParticleUniverse.G_SCALE += 0.05;
                        mesh.material.opacity += 0.034;
                        meshVfx.material.opacity += 0.034;
                    }
                }




                if (update_counter === 0) {
                    flattenToDisk(bodies);
                    flattenToDisk(bodiesVfx);
                    flattenToDisk(bodiesGas);
                }

                Particle.velocityVerletUpdate(bodies, dt, false);
                Particle.velocityVerletUpdate(bodiesVfx, dt, false);
                Particle.velocityVerletUpdate(bodiesGas, dt, false);

                mesh.geometry.verticesNeedUpdate = true;
                meshVfx.geometry.verticesNeedUpdate = true;
                meshGas.geometry.verticesNeedUpdate = true;
                lastT = t;
            };

            function handleAnimationFrame(dt) {
                if (!PAUSED) {
                    update(dt);
                    controls.update();
                }
                render();
                window.requestAnimationFrame(handleAnimationFrame);
            };
            window.requestAnimationFrame(handleAnimationFrame);

        };
    };

    function displayGUI() {
        // Define parameters for the GUI
        class TestParameters {
            constructor() {
                this.Space = ParticleUniverse.milky_way;
                this.Gravity = 1.0;
                this.Giant = 0;
                this.Stars = 0;
                this.Gas = 0;
                this.White_Hole = 0;
            }
        }

        // Initialize parameters and GUI
        const params = new TestParameters();
        const gui = new dat.GUI();
        gui.close();

        // Create folders for better organization
        const backgroundsFolder = gui.addFolder('Backgrounds');
        const gravityFolder = gui.addFolder('Gravitational Constant');
        const visibilityFolder = gui.addFolder('Material Visibility');
        const whiteHoleFolder = gui.addFolder('White Hole');

        // Add controls to the respective folders
        const backgroundsControl = backgroundsFolder.add(params, 'Space', {
            'Milky Way': 0,
            'Light Blue': 1,
        });

        const gravityControl = gravityFolder.add(params, 'Gravity').min(0).max(11).step(0.1).listen();

        const largeStarsOpacityControl = visibilityFolder.add(params, 'Giant').min(0).max(1).step(0.1).listen();
        const smallStarsOpacityControl = visibilityFolder.add(params, 'Stars').min(0).max(1).step(0.1).listen();
        const gasOpacityControl = visibilityFolder.add(params, 'Gas').min(0).max(1).step(0.1).listen();
        const whiteStarControl = whiteHoleFolder.add(params, 'White_Hole').min(0).max(1).step(0.1).listen();

        // Define actions to take when the controls are changed
        backgroundsControl.onFinishChange((index) => {
            ParticleUniverse.skyBoxMaterial.uniforms['tCube'].value.dispose();
            ParticleUniverse.skyBoxMaterial.uniforms['tCube'].value = ParticleUniverse.cubemaps[index];
            ParticleUniverse.skyBoxMaterial.uniformsNeedUpdate = true;
            galaxy_background = ParticleUniverse.cubemaps_list[index];
        });

        
        whiteStarControl.onFinishChange((value) => {
            if (value >= 1) {
                // Method for the cone-cylinder (White Hole)

                createWhiteHole();

                // Spurting new particles 


                
            }else{
                scene.remove(cone1);
                scene.remove(cone2); 
            }

        });


        gravityControl.onFinishChange((value) => {
            GRAVITY_OVERRIDE = true;
            ParticleUniverse.GRAVITATIONAL_CONSTANT = ParticleUniverse.G * 2 * value;
            if (value > 10) {
                transitionToBlackHole();
                // TO-DO: Creation of Black Hole Singularity; is it possible ?
                // NO 
                
            }

        });


        largeStarsOpacityControl.onFinishChange((value) => {
            ParticleUniverse.mesh.material.opacity = value;
        });

        smallStarsOpacityControl.onFinishChange((value) => {
            ParticleUniverse.meshVfx.material.opacity = value;
        });

        gasOpacityControl.onFinishChange((value) => {
            ParticleUniverse.meshGas.material.opacity = value;
        });
    }


    $(document).ready(function () {
        displayGUI();
        render_all(ParticleUniverse.milky_way);
    });
})();

