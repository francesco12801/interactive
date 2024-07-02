particle_universe.backPath = '../assets/background/';

// I need to fill background

particle_universe.nebular = ['BlueNebular_left.jpg',
    'BlueNebular_right.jpg',
    'BlueNebular_top.jpg',
    'BlueNebular_bottom.jpg',
    'BlueNebular_front.jpg',
    'BlueNebular_back.jpg'
];

var starLargeTexture = THREE.TextureLoader("../assets/universe/star_large.png");
var starSmallTexture = THREE.TextureLoader("../assets/universe/star_small.png");
var gasCloudTexture = THREE.TextureLoader("../assets/universe/cloud.png");

particle_universe.createParticles = function() {

    function createParticleMaterial(texture, size, color, blending, opacity) {
        return new THREE.PointCloudMaterial({
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

    


    var cubemap = new THREE.CubeTextureLoader().setPath(particle_universe.backPath).load(particle_universe.nebular);
    cubemap.format = THREE.RGBFormat;


    return {
        bright: createParticleMaterial(starLargeTexture, 140, 0xffffff, THREE.AdditiveBlending, 0.0),
        brightSmall: createParticleMaterial(starSmallTexture, 80, 0xffffff, THREE.AdditiveBlending, 0.0),
        gasCloud: createParticleMaterial(gasCloudTexture, 900, 0xffffff, THREE.NormalBlending, 0.18)
    }
};
