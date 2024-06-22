
window.onload = function() {
	InitWebGL();
	canvas.zoom = function( s ) {
		transZ *= s/canvas.height + 1;
		UpdateProjectionMatrix();
		DrawScene();
	}
	canvas.onwheel = function() { canvas.zoom(0.3*event.deltaY); }
	canvas.onmousedown = function() {
		var cx = event.clientX;
		var cy = event.clientY;
		if ( event.ctrlKey ) {
			canvas.onmousemove = function() {
				canvas.zoom(5*(event.clientY - cy));
				cy = event.clientY;
			}
		} else {
			canvas.onmousemove = function() {
				rotY += (cx - event.clientX)/canvas.width*5;
				rotX += (cy - event.clientY)/canvas.height*5;
				cx = event.clientX;
				cy = event.clientY;
				UpdateProjectionMatrix();
				DrawScene();
			}
		}
	}
	canvas.onmouseup = canvas.onmouseleave = function() {
		canvas.onmousemove = null;
	}
	
	DrawScene();
};
function WindowResize()
{
	UpdateCanvasSize();
	DrawScene();
}

var timer;
function AutoRotate( param )
{
	if ( param.checked ) {
		timer = setInterval( function() {
				var v = document.getElementById('rotation-speed').value;
				autorot += 0.0005 * v;
				if ( autorot > 2*Math.PI ) autorot -= 2*Math.PI;
				DrawScene();
			}, 30
		);
		document.getElementById('rotation-speed').disabled = false;
	} else {
		clearInterval( timer );
		document.getElementById('rotation-speed').disabled = true;
	}
}

function ShowTexture( param )
{
	meshDrawer.showTexture( param.checked );
	DrawScene();
}

function SwapYZ( param )
{
	meshDrawer.swapYZ( param.checked );
	DrawScene();
}

function LoadObj( param )
{
	if ( param.files && param.files[0] ) {
		var reader = new FileReader();
		reader.onload = function(e) {
			var mesh = new ObjMesh;
			mesh.parse( e.target.result );
			var box = mesh.getBoundingBox();
			var shift = [
				-(box.min[0]+box.max[0])/2,
				-(box.min[1]+box.max[1])/2,
				-(box.min[2]+box.max[2])/2
			];
			var size = [
				(box.max[0]-box.min[0])/2,
				(box.max[1]-box.min[1])/2,
				(box.max[2]-box.min[2])/2
			];
			var maxSize = Math.max( size[0], size[1], size[2] );
			var scale = 1/maxSize;
			mesh.shiftAndScale( shift, scale );
			var buffers = mesh.getVertexBuffers();
			meshDrawer.setMesh( buffers.positionBuffer, buffers.texCoordBuffer );
			DrawScene();
		}
		reader.readAsText( param.files[0] );
	}
}

function LoadTexture( param )
{
	if ( param.files && param.files[0] ) {
		var reader = new FileReader();
		reader.onload = function(e) {
			var img = document.getElementById('texture-img');
			img.onload = function() {
				meshDrawer.setTexture( img );
				DrawScene();
			}
			img.src = e.target.result;
		};
		reader.readAsDataURL( param.files[0] );
	}
}

function AutoRotate( )
{
	timer = setInterval( function() {
			var v = document.getElementById('rotation-speed').value;
			autorot += 0.0005 * v;
			if ( autorot > 2*Math.PI ) autorot -= 2*Math.PI;
			DrawScene();
		}, 30
	);
	document.getElementById('rotation-speed').disabled = false;
} 

