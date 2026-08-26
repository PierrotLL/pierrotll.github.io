var canvas, ctx;

function createCanvas(width, height) {
	canvas = document.createElement('canvas');
	var body = document.getElementsByTagName('body')[0];
	body.appendChild(canvas);
	canvas.width = width;
	canvas.height = height;
	ctx = canvas.getContext('2d');
}

function fill(r, g, b) {
	ctx.fillStyle = 'rgb('+r+','+g+','+b+')';
}

function rect(x, y, w, h) {
	ctx.fillRect(x, y, w, h);
}

function circle(x, y, r) {
	ctx.beginPath();
	ctx.arc(x, y, r, 0, 2*Math.PI);
	ctx.fill();
}

function background(r, g, b) {
	fill(r, g, b);
	rect(0, 0, canvas.width, canvas.height);
}

function text(txt, x, y, font, color) {
	ctx.fillStyle = color;
	ctx.font = font;
	ctx.fillText(txt, x, y);
}
