document.getElementById('controlButton').addEventListener('click', function() {
    document.getElementById('controlPanel').style.display = 'block';
});

document.getElementById('closePanelButton').addEventListener('click', function() {
    document.getElementById('controlPanel').style.display = 'none';
});


document.getElementById('animationSpeed').addEventListener('input', function() {
    console.log('Animation Speed:', this.value);
    // Adding animation speed changes 
});

document.getElementById('particleColor').addEventListener('input', function() {
    console.log('Particle Color:', this.value);
    // change particles color 
});

document.getElementById('particleSize').addEventListener('input', function() {
    console.log('Particle Size:', this.value);
    // change the particle sizes 
});

document.getElementById('lightIntensity').addEventListener('input', function() {
    console.log('Light Intensity:', this.value);
    // change the light intesity 
});
// Aggiungi un gestore eventi per il caricamento del file .obj
document.getElementById('objFileInput').addEventListener('change', function(e) {
    var file = e.target.files[0];
    if (file) {
        var reader = new FileReader();
        reader.onload = function(e) {
            var mesh = new ObjMesh();
            mesh.parse(e.target.result); // Usa il metodo parse di ObjMesh per analizzare il file .obj
            var box = mesh.getBoundingBox();
            var shift = [
                -(box.min[0] + box.max[0]) / 2,
                -(box.min[1] + box.max[1]) / 2,
                -(box.min[2] + box.max[2]) / 2
            ];
            var size = [
                (box.max[0] - box.min[0]) / 2,
                (box.max[1] - box.min[1]) / 2,
                (box.max[2] - box.min[2]) / 2
            ];
            var maxSize = Math.max(size[0], size[1], size[2]);
            var scale = 1 / maxSize;
            mesh.shiftAndScale(shift, scale);
            var buffers = mesh.getVertexBuffers();
            meshDrawer.setMesh(buffers.positionBuffer, buffers.texCoordBuffer);
            DrawScene();
        };
        reader.readAsText(file);
    }
});



document.getElementById('toggleEffects').addEventListener('change', function() {
    console.log('Toggle Effects:', this.checked);
    // Qui puoi aggiungere il codice per attivare/disattivare gli effetti
});