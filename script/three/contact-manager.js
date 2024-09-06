import { THREE} from './import-three.js';
// Create an empty scene
const scene = new THREE.Scene();

// Get the container element
const container = document.getElementById('contact-section');
if (!container) {
  console.error('Container element not found');
} else {
  // Create a WebGL renderer
  const renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  // Create fog
  scene.fog = new THREE.Fog(0x000000, 1, 1000); // Adjust fog range as needed

  // Create a perspective camera
  const aspectRatio = container.clientWidth / container.clientHeight;
  const camera = new THREE.PerspectiveCamera(45, aspectRatio, 1, 1000);
  camera.position.set(0, 0, 500); // Position the camera farther back
  camera.lookAt(0, 0, 0); // Look at the center of the scene

  // Array of points
  const points = [
    [68.5, 185.5],
    [1, 262.5],
    [270.9, 281.9],
    [300, 212.8],
    [178, 155.7],
    [240.3, 72.3],
    [153.4, 0.6],
    [52.6, 53.3],
    [68.5, 185.5]
  ];

  // Convert the array of points into vertices
  const vertices = points.map(([x, y]) => new THREE.Vector3(x, (Math.random() - 0.5) * 250, y));

  // Create a path from the points
  const path = new THREE.CatmullRomCurve3(vertices);

  // Set colors
  const colors = [0xFF6138, 0xFFFF9D, 0xBEEB9F, 0x79BD8F, 0x00A388];

  // Loop through all those colors
  colors.forEach((color, i) => {
    // Create a new geometry with a different radius
    const geometry = new THREE.TubeGeometry(path, 100, (i * 2) + 4, 10, true);
    // Set a new material with a new color and a different opacity
    const material = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      wireframe: true,
      opacity: ((1 - i / 5) * 0.5 + 0.1)
    });
    // Create a mesh
    const tube = new THREE.Mesh(geometry, material);
    // Add the mesh to the scene
    scene.add(tube);
  });

  let percentage = 0;
  function render() {
    percentage += 0.0003;
    const p1 = path.getPointAt(percentage % 1);
    const p2 = path.getPointAt((percentage + 0.01) % 1);
    camera.position.set(p1.x, p1.y, p1.z);
    camera.lookAt(p2);

    // Render the scene
    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

  // Handle window resize
  window.addEventListener('resize', () => {
    const ww = container.clientWidth;
    const wh = container.clientHeight;
    renderer.setSize(ww, wh);
    camera.aspect = ww / wh;
    camera.updateProjectionMatrix();
  });
}
