export class Particle {
    constructor(mass, position, velocity) {
        this.mass = mass;
        this.invMass = 1.0 / mass;
        this.position = position;
        this.velocity = velocity;
        this.force = new THREE.Vector3(0, 0, 0);
        this.previousForce = new THREE.Vector3(0, 0, 0);
    }

    static updatePositionStep(bodies, deltaTime) {
        let velX = 0.0, velY = 0.0, velZ = 0.0;
        for (let i = 0, len = bodies.length; i < len; i++) {
            let body = bodies[i];
            let accelFactor = body.invMass * deltaTime * 0.5;
            let position = body.position;
            let velocity = body.velocity;
            let force = body.force;
            let previousForce = body.previousForce;

            velX = velocity.x;
            velY = velocity.y;
            velZ = velocity.z;

            velX += force.x * accelFactor;
            velY += force.y * accelFactor;
            velZ += force.z * accelFactor;

            position.x += velX * deltaTime;
            position.y += velY * deltaTime;
            position.z += velZ * deltaTime;

            previousForce.x = force.x;
            previousForce.y = force.y;
            previousForce.z = force.z;
        }
    }

    static updateAccelerationStep(bodies, deltaTime) {
        for (let i = 0, len = bodies.length; i < len; i++) {
            let body = bodies[i];
            let force = body.force;
            let velocity = body.velocity;
            let previousForce = body.previousForce;
            let accelFactor = body.invMass * deltaTime * 0.5;

            velocity.x += (force.x + previousForce.x) * accelFactor;
            velocity.y += (force.y + previousForce.y) * accelFactor;
            velocity.z += (force.z + previousForce.z) * accelFactor;

            previousForce.x = force.x;
            previousForce.y = force.y;
            previousForce.z = force.z;

            force.x = force.y = force.z = 0.0;
        }
    }

    static applyVerletIntegration(bodies, deltaTime, isPositionStep) {
        if (isPositionStep) {
            Particle.updatePositionStep(bodies, deltaTime);
        } else {
            Particle.updateAccelerationStep(bodies, deltaTime);
        }
    }
}
