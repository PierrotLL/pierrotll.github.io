class Player {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.dy = 0;
		this.size = 10;
		this.dead = false;
	}
	
	update() {
		this.dy += gravity;
		this.y += this.dy;
		if (this.dead) this.x -= panSpeed;
		if (this.y < this.size || this.y > canvas.height - this.size) {
			this.die();
		}
		if (this.y > canvas.height) {
			this.y = canvas.height;
		}
	}
	
	flap() {
		if (!this.dead) {
			this.dy = -15;
		}
	}
	
	die() {
		if (!this.dead) {
			this.dead = true;
			this.dy = 5;
		}
	}
	
	offScreen() {
		return this.x + this.size < 0;
	}
	
	show() {
		fill(255, 255, 0);
		if (this.dead) fill(200, 0, 0);
		circle(this.x, this.y, this.size);
	}
}