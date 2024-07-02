export class ParticleUniverse {

    // Setup static resources
    static mesh; 
    static meshGas; 
    static meshVfx; 
    static skyBoxMaterial; 

    static backPath = '../assets/background/';
    static nebular = [
        'BlueNebular_left.jpg',
        'BlueNebular_right.jpg',
        'BlueNebular_top.jpg',
        'BlueNebular_bottom.jpg',
        'BlueNebular_front.jpg',
        'BlueNebular_back.jpg'
    ];
    static starLargeTexture = new THREE.TextureLoader().load("../assets/universe/star_large.png");
    static starSmallTexture = new THREE.TextureLoader().load("../assets/universe/star_small.png");
    static gasCloudTexture = new THREE.TextureLoader().load("../assets/universe/cloud.png");

    static NUMBLACKHOLES = 1; 
    static LIGHT_YEAR = 9.4607 * Math.pow(10, 15);
    static MILKY_WAY_DIAMETER = 140 * 1000 * ParticleUniverse.LIGHT_YEAR;
    static UNIVERSE_SCALE = 1000 / ParticleUniverse.MILKY_WAY_DIAMETER;
    static UNIVERSE_SCALE_RECIPROCAL = 1.0 / ParticleUniverse.UNIVERSE_SCALE;
    static LIGHT_YEAR_SCALED = ParticleUniverse.LIGHT_YEAR * ParticleUniverse.UNIVERSE_SCALE;
    static LIGHT_SPEED = 299792458;
    static LIGHT_SPEED_SCALED = ParticleUniverse.LIGHT_SPEED * ParticleUniverse.UNIVERSE_SCALE;
    static LIGHT_SPEED_SCALED_SQRD = ParticleUniverse.LIGHT_SPEED_SCALED * ParticleUniverse.LIGHT_SPEED_SCALED;
    static G = 6.673e-11;
    static G_SCALE = 0.5;
    static GRAVITATIONAL_CONSTANT = ParticleUniverse.G_SCALE * ParticleUniverse.G;
    static GRAVITY_EPSILON = 3 * Math.pow(10, 19);
    static TYPICAL_STAR_MASS = 2 * Math.pow(10, 30);

    static BODYCOUNT = 1000;
    static BODYCOUNT_VFX = 50000;
    static BODYCOUNT_GAS = 450;

    static createParticles() {
        function createParticleMaterial(texture, size, color, blending, opacity) {
            return new THREE.PointsMaterial({
                color: color,
                opacity: opacity,
                size: size,
                map: texture,
                blending: blending,
                depthTest: false,
                transparent: true,
                vertexColors: THREE.VertexColors
            });
        }

        // Load cubemap texture
        let cubemap = new THREE.CubeTextureLoader().setPath(ParticleUniverse.backPath).load(ParticleUniverse.nebular);
        cubemap.format = THREE.RGBFormat;

        return {
            bright: createParticleMaterial(ParticleUniverse.starLargeTexture, 140, 0xffffff, THREE.AdditiveBlending, 0.0),
            brightSmall: createParticleMaterial(ParticleUniverse.starSmallTexture, 80, 0xffffff, THREE.AdditiveBlending, 0.0),
            gasCloud: createParticleMaterial(ParticleUniverse.gasCloudTexture, 900, 0xffffff, THREE.NormalBlending, 0.18)
        };
    }

    createTwoTierGravitymanager(attractedBodies, attractingBodies) {
        let manager = {};
        let attractingIsAttracted = attractingBodies === attractedBodies;
        let pairForces = attractedBodies.map(() => new THREE.Vector3(0, 0, 0));
        let currentFarAttractedIndex = 0;

        manager.applyForcesToPairs = () => {
            for (let i = 0, len = attractedBodies.length; i < len; i++) {
                attractedBodies[i].force.add(pairForces[i]);
            }
        };

        manager.handleBlackHoles = () => {
            let typicalStarMass = ParticleUniverse.TYPICAL_STAR_MASS;
            let universeScaleReciprocal = ParticleUniverse.UNIVERSE_SCALE_RECIPROCAL;
            let gravitationalConstant = ParticleUniverse.GRAVITATIONAL_CONSTANT;
            let gravityEpsilon = ParticleUniverse.GRAVITY_EPSILON;
            let gravityEpsilonSquared = gravityEpsilon * gravityEpsilon;

            let tempForce = new THREE.Vector3(0, 0, 0);
            let DARK_FORCE_COEFFICIENT = 4 * Math.pow(10, -20) * gravitationalConstant;

            for (let i = 0, len = attractedBodies.length; i < len; i++) {
                for (let j = 0; j < ParticleUniverse.NUMBLACKHOLES; j++) {
                    if (attractingIsAttracted && i === j) {
                        continue;
                    }

                    let body1 = attractedBodies[i];
                    let body2 = attractingBodies[j];

                    let body1Pos = body1.position;
                    let body2Pos = body2.position;

                    let sqrDist = body1Pos.distanceToSquared(body2Pos) *
                        universeScaleReciprocal * universeScaleReciprocal;
                    let dist = Math.sqrt(sqrDist);
                    let force = gravitationalConstant * body1.mass * body2.mass /
                        Math.pow(sqrDist + gravityEpsilonSquared, 3 / 2);

                    force += DARK_FORCE_COEFFICIENT * (body1.mass * body2.mass / dist);

                    let bodyForce = body1.force;
                    tempForce.subVectors(body2Pos, body1Pos).normalize().multiplyScalar(force);
                    bodyForce.add(tempForce);
                }
            }
        };

        manager.computePairForces = (bodyCountToUpdate) => {
            let typicalStarMass = ParticleUniverse.TYPICAL_STAR_MASS;
            let universeScaleReciprocal = ParticleUniverse.UNIVERSE_SCALE_RECIPROCAL;
            let gravitationalConstant = ParticleUniverse.GRAVITATIONAL_CONSTANT;
            let gravityEpsilon = ParticleUniverse.GRAVITY_EPSILON;
            let gravityEpsilonSquared = gravityEpsilon * gravityEpsilon;

            let tempForce = new THREE.Vector3(0, 0, 0);

            for (let n = 0; n < bodyCountToUpdate; n++) {
                currentFarAttractedIndex++;
                if (currentFarAttractedIndex >= attractedBodies.length) {
                    currentFarAttractedIndex = 0;
                }
                let body1 = attractedBodies[currentFarAttractedIndex];
                let farForce = pairForces[currentFarAttractedIndex];
                farForce.set(0, 0, 0);

                for (let j = ParticleUniverse.NUMBLACKHOLES; j < ParticleUniverse.BODYCOUNT; j++) {
                    if (attractingIsAttracted && j === currentFarAttractedIndex) {
                        continue;
                    }
                    tempForce.set(0, 0, 0);
                    let body2 = attractingBodies[j];

                    let sqrDist = body1.position.distanceToSquared(body2.position) *
                        universeScaleReciprocal * universeScaleReciprocal;
                    let force = gravitationalConstant * body1.mass * body2.mass /
                        Math.pow(sqrDist + gravityEpsilonSquared, 3 / 2);
                    tempForce.subVectors(body2.position, body1.position).normalize()
                        .multiplyScalar(force);
                    farForce.add(tempForce);
                }
                pairForces[currentFarAttractedIndex] = farForce;
            }
        };

        manager.updateForceCalculations = (bodyCountToUpdate) => {
            manager.handleBlackHoles();
            manager.computePairForces(bodyCountToUpdate);
            manager.applyForcesToPairs();
        };

        return manager;
    }

    initializeGravitySystem(particleCount, typicalMass, numBlackHoles, blackHolePositions) {
        let bodies = [];

        let typicalStarSpeed = 0.8 * 7 * Math.pow(10, 10) * ParticleUniverse.UNIVERSE_SCALE;
        let boundarySide = 4300.0;

        let BLACK_HOLE_MASS = ParticleUniverse.TYPICAL_STAR_MASS * 7000;

        for (let p = 0; p < particleCount; p++) {
            let angle = Math.PI * 2 * Math.random();

            angle += 0.10 * Math.sin(angle * Math.PI * 2);

            if (p < numBlackHoles) {
                let mass = BLACK_HOLE_MASS;
                let posX = 0, posY = 0, posZ = 0;
                if (numBlackHoles === 1) {
                    posX = posY = posZ = 0;
                } else {
                    let dist = boundarySide * 8 * Math.random();
                    posX = dist * Math.random() - dist * 0.5;
                    posY = 0;
                    posZ = dist * Math.random() - dist * 0.5;
                }
                let body = new Particle(mass, new THREE.Vector3(posX, posY, posZ), new THREE.Vector3(0, 0, 0));
                bodies.push(body);
            } else {
                let dist = boundarySide * 0.5 * Math.random();
                dist += boundarySide * 0.04 * -Math.cos(angle * Math.PI * 2);

                let mass = typicalMass * 2 * Math.random() * Math.random();

                let posX = dist * Math.cos(angle);
                let posY = (Math.random() - 0.5) * (boundarySide - dist) * 0.7;
                let posZ = dist * Math.sin(angle);

                let closestBlackHole = Math.floor(Math.random() * ParticleUniverse.NUMBLACKHOLES);
                let blackHolePos = numBlackHoles > 0 ? bodies[closestBlackHole].position : blackHolePositions[closestBlackHole];

                let velocity = new THREE.Vector3(posX, posY, posZ);
                velocity.normalize();
                let requiredSpeed = typicalStarSpeed * 1.8 + typicalStarSpeed * 0.1 * Math.log(1.1 + (10 * dist / boundarySide));

                let velX = velocity.z * requiredSpeed;
                let velY = velocity.y * requiredSpeed;
                let velZ = -velocity.x * requiredSpeed;

                let velocityVector = new THREE.Vector3(velX, velY, velZ);

                let positionVector = new THREE.Vector3(posX + blackHolePos.x, posY + blackHolePos.y, posZ + blackHolePos.z);
                let body = new Particle(mass, positionVector, velocityVector);
                bodies.push(body);
            }
        }
        this.particles = bodies;
        return bodies;
    }

    zeroGravityHandler(light) {
        for (let i = 0; i < this.particles.length; i++) {
            let body = this.particles[i];
            let direction = body.position.clone().normalize();
            let speed = 1000;
            body.velocity.copy(direction.multiplyScalar(speed));
        }

        light.intensity = 0;
        let startTime = Date.now();

        function animateLight() {
            let elapsedTime = Date.now() - startTime;
            let duration = 1000;
            let progress = Math.min(elapsedTime / duration, 1);
            light.intensity = 10 * progress;

            if (progress < 1) {
                requestAnimationFrame(animateLight);
            }
        }

        animateLight();
    }

    simulateUpdate(deltaTime, gravityStrength) {
        if (gravityStrength <= 0) {
            let light = new THREE.PointLight(0xffffff, 0, 1000);
            light.position.set(0, 0, 0);
            scene.add(light);
            this.zeroGravityHandler(light);
        } else {
            this.applyVerletIntegration(deltaTime, true);
            this.gravitymanager = this.createTwoTierGravitymanager(this.particles, this.particles);
            this.gravitymanager.updateForceCalculations(this.particles.length);
            this.applyVerletIntegration(deltaTime, false);
        }
    }

    applyVerletIntegration(deltaTime, isFirstStep) {
        for (let i = 0; i < this.particles.length; i++) {
            let particle = this.particles[i];
            if (isFirstStep) {
                particle.updatePositionStep(deltaTime);
            } else {
                particle.updateAccelerationStep(deltaTime);
            }
        }
    }
}