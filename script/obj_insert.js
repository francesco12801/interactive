// This function takes the projection matrix, the translation, and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// The given projection matrix is also a 4x4 matrix stored as an array in column-major order.
// You can use the MatrixMult function defined in project4.html to multiply two 4x4 matrices in the same format.
function GetModelViewProjection( projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY)
{
	// [TO-DO] Modify the code below to form the transformation matrix.
	var trans = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];

	const cosX = Math.cos(rotationX);
    const sinX = Math.sin(rotationX);
    const cosY = Math.cos(rotationY);
    const sinY = Math.sin(rotationY);


	let rotationMatrixX = [
		1, 0, 0, 0,
		0, cosX, sinX, 0,
		0, -sinX, cosX, 0,
		0, 0, 0, 1
	];

	let rotationMatrixY = [
		cosY, 0, -sinY, 0,
		0, 1, 0, 0,
		sinY, 0, cosY, 0,
		0, 0, 0, 1
	];

	let multiply_matrix = MatrixMult(MatrixMult(trans,rotationMatrixX), rotationMatrixY);
	let final = MatrixMult(projectionMatrix, multiply_matrix); 

	return final;
}


// [TO-DO] Complete the implementation of the following class.
var meshVS = `
        attribute vec3 pos;
        attribute vec2 texCoord;
        uniform mat4 mvp;
        varying vec2 vTexCoord;

        void main() {
            gl_Position = mvp * vec4(pos, 1.0);
            vTexCoord = texCoord;
        }
        `;
        // Fragment shader source code
        var meshFS = `
			precision mediump float;
			uniform sampler2D tex;
			uniform int showTexture;  
			varying vec2 vTexCoord;

			void main() {
				if (showTexture == 1 ) {
					 vec4 texColor = texture2D(tex, vTexCoord);
					 gl_FragColor = texColor;
				} else {
					gl_FragColor = vec4(1,gl_FragCoord.z*gl_FragCoord.z,1,1);
				}
			}
        `;
class MeshDrawer
{ 

	// The constructor is a good place for taking care of the necessary initializations.
	constructor(){
		// rendering context
		this.prog = InitShaderProgram(meshVS, meshFS);
		//program initializations
		this.mymvp = gl.getUniformLocation(this.prog, 'mvp');
		this.mypos = gl.getAttribLocation(this.prog, 'pos');
		this.swapLoc= gl.getUniformLocation(this.prog, 'swap');
		this.mytexCoords = gl.getAttribLocation(this.prog, 'texCoord');
		this.showTex = gl.getUniformLocation(this.prog, 'showTexture');

		//texture
		gl.useProgram(this.prog);
		gl.uniform1i(this.showTex, 0);
		// buffering 
		this.vertex_buffer = gl.createBuffer();
		this.texture_buffer = gl.createBuffer();
	}
	// This method is called every time the user opens an OBJ file.
	// The arguments of this function is an array of 3D vertex positions
	// and an array of 2D texture coordinates.
	// Every item in these arrays is a floating point value, representing one
	// coordinate of the vertex position or texture coordinate.
	// Every three consecutive elements in the vertPos array forms one vertex
	// position and every three consecutive vertex positions form a triangle.
	// Similarly, every two consecutive elements in the texCoords array
	// fo rm the texture coordinate of a vertex.
	// Note that this method can be called multiple times.
	setMesh( vertPos, texCoords){
		// [TO-DO] Update the contents of the vertex buffer objects.
		this.vpos = vertPos;
		this.numTriangles = vertPos.length / 3;
		// buff update
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array (vertPos), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texture_buffer);
		gl.bufferData(gl. ARRAY_BUFFER, new Float32Array (texCoords), gl.STATIC_DRAW); 
		
	}
	
	// This method is called when the user changes the state of the
	// "Swap Y-Z Axes" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	swapYZ( swap ){
		for (let i = 0; i < this.vpos.length; i += 3) {
			const y = this.vpos[i + 1];
			this.vpos[i + 1] = this.vpos[i + 2];
			this.vpos[i + 2] = y;
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vpos), gl.STATIC_DRAW);
		
	}
	
	// This method is called to draw the triangular mesh.
	// The argument is the transformation matrix, the same matrix returned
	// by the GetModelViewProjection function above.
	draw(trans) {
        gl.useProgram(this.prog);
        gl.uniformMatrix4fv(this.mymvp, false, trans);

        //vertex buffer binding
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer);
        gl.vertexAttribPointer(this.mypos, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.mypos);

        //tex coord binding
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texture_buffer);
        gl.vertexAttribPointer(this.mytexCoords, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.mytexCoords);
        gl.drawArrays(gl.TRIANGLES, 0, this.numTriangles);
		
    }

	
	setTexture( img ) {
		const texture_creation = gl.createTexture();
 		gl.bindTexture(gl.TEXTURE_2D, texture_creation);
		 
		//setting the texture parameters
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
		
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
		gl.generateMipmap(gl.TEXTURE_2D);
		
		// 0 refers to the texture unit 0. We only have one texture unit in this case. --> OK 
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, texture_creation);

		this.mytex = gl.getUniformLocation(this.prog, 'tex');
	
		gl.useProgram( this.prog );
		gl.uniform1i( this.mytex, 0)

		this.showTex = gl.getUniformLocation(this.prog, 'showTexture');
		gl.useProgram(this.prog);
		gl.uniform1i(this.showTex, 1);
	 }
	
	showTexture( show ) {
		this.showTex = gl.getUniformLocation(this.prog, 'showTexture');
	
		// Update the uniform parameter based on the show argument
		gl.useProgram(this.prog);
		gl.uniform1i(this.showTex, show ? 1 : 0);
	}
}
