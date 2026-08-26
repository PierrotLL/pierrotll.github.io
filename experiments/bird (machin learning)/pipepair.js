class PipePair {
	constructor() {
		var opening = 150;
		var height = Math.random() * (canvas.height - opening - 200) + 100 + opening / 2;
		this.width = 50;
		this.x = canvas.width + this.width;
		this.top = height - opening / 2;
		this.bottom = height + opening / 2;
	}
	
	update() {
		this.x -= panSpeed;
	}
	
	colide(p) {
		if (p.x + p.size >= this.x && p.x - p.size < this.x + this.width) {
			if (p.y - p.size < this.top || p.y + p.size > this.bottom) return true;
		}
		return false;
	}
	
	offScreen() {
		return this.x + this.width < 0;
	}
	
	show() {
		fill(0, 204, 0);
		rect(this.x, 0, this.width, this.top);
		rect(this.x, this.bottom, this.width, canvas.height - this.bottom);
	}
}