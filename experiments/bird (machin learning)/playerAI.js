class PlayerAI {
	
	constructor() {
		this.score = 0;
		this.player = new Player(100, canvas.height / 2);
		
		this.brain = new NeuralNetwork(3, 1, 3, 10);
		this.brain.randomize();
	}
	
	input() {
		var nextPipe = pipe;
		if (pipe.x + pipe.width <= this.player.x - this.player.size || pipe.x > pipe2.x) {
			nextPipe = pipe2;
		}
		return [
			this.player.y / canvas.height,
			this.player.dy / canvas.height,
			(this.player.y - (nextPipe.bottom + nextPipe.top) / 2) / canvas.height
		];
	}
	
	update() {
		this.player.update();
		
		if (!this.player.dead) this.score++;
		
		var output = this.brain.process(this.input());
		if (output[0] > 0) this.player.flap();
	}
	
	show() {
		this.player.show();
	}
	
}