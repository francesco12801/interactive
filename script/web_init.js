var boxDrawer;
var meshDrawer;
var canvas, gl;
var perspectiveMatrix;	// perspective projection matrix
var rotX=0, rotY=0, transZ=3, autorot=0;

// Called once to initialize
function InitWebGL()
{
	// Initialize the WebGL canvas
	canvas = document.getElementById("canvas");
	canvas.oncontextmenu = function() {return false;};
	gl = canvas.getContext("webgl", {antialias: false, depth: true});	// Initialize the GL context
	if (!gl) {
		alert("Unable to initialize WebGL. Your browser or machine may not support it.");
		return;
	}
	
	// Initialize settings
	gl.clearColor(0,0,0,0);
	gl.enable(gl.DEPTH_TEST);
	
	// Initialize the programs and buffers for drawing
	boxDrawer  = new BoxDrawer();
	meshDrawer = new MeshDrawer();
	
	// Set the viewport size
	UpdateCanvasSize();
}

// Called every time the window size is changed.
function UpdateCanvasSize()
{
	canvas.style.width  = "100%";
	canvas.style.height = "100%";
	const pixelRatio = window.devicePixelRatio || 1;
	canvas.width  = pixelRatio * canvas.clientWidth;
	canvas.height = pixelRatio * canvas.clientHeight;
	const width  = (canvas.width  / pixelRatio);
	const height = (canvas.height / pixelRatio);
	canvas.style.width  = width  + 'px';
	canvas.style.height = height + 'px';
	gl.viewport( 0, 0, canvas.width, canvas.height );
	UpdateProjectionMatrix();
}

function UpdateProjectionMatrix()
{
	var r = canvas.width / canvas.height;
	var n = (transZ - 1.74);
	const min_n = 0.001;
	if ( n < min_n ) n = min_n;
	var f = (transZ + 1.74);;
	var fov = 3.145 * 60 / 180;
	var s = 1 / Math.tan( fov/2 );
	perspectiveMatrix = [
		s/r, 0, 0, 0,
		0, s, 0, 0,
		0, 0, (n+f)/(f-n), 1,
		0, 0, -2*n*f/(f-n), 0
	];
}

// This is the main function that handled WebGL drawing
function DrawScene()
{
	var mvp = GetModelViewProjection( perspectiveMatrix, 0, 0, transZ, rotX, autorot+rotY );

	// Clear the screen and the depth buffer.
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
	
	// Draw the curve and then the line segments that connect the control points.
	meshDrawer.draw( mvp );
	if ( showBox.checked ) {
		boxDrawer.draw( mvp );
	}
}

// This is a helper function for compiling the given vertex and fragment shader source code into a program.
function InitShaderProgram( vsSource, fsSource )
{
	const vs = CompileShader( gl.VERTEX_SHADER,   vsSource );
	const fs = CompileShader( gl.FRAGMENT_SHADER, fsSource );

	const prog = gl.createProgram();
	gl.attachShader(prog, vs);
	gl.attachShader(prog, fs);
	gl.linkProgram(prog);

	if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
		alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(prog));
		return null;
	}
	return prog;
}

// This is a helper function for compiling a shader, called by InitShaderProgram().
function CompileShader( type, source )
{
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter( shader, gl.COMPILE_STATUS) ) {
		alert('An error occurred compiling shader:\n' + gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}
	return shader;
}

// Multiplies two matrices and returns the result A*B.
// The arguments A and B are arrays, representing column-major matrices.
function MatrixMult( A, B )
{
	var C = [];
	for ( var i=0; i<4; ++i ) {
		for ( var j=0; j<4; ++j ) {
			var v = 0;
			for ( var k=0; k<4; ++k ) {
				v += A[j+4*k] * B[k+4*i];
			}
			C.push(v);
		}
	}
	return C;
}