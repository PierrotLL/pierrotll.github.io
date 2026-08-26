var gravity, panSpeed, generation, score, player;

function init() {
	gravity = 1.5;
	panSpeed = 5;
	createCanvas(400, 640);
	document.addEventListener('keypress', onKey);
	setInterval(enterFrame, 30);
	generation = 1;
}

function setupPlayer() {
	player = new Player(100, canvas.height / 2);
}

function setupAIs() {
	ais = [];
	for (var i = 0 ; i < 50 ; i++) ais[i] = new PlayerAI();
}

function start() {
	score = 0;
	pipe = new PipePair();
	pipe2 = new PipePair();
	pipe2.x = pipe2.x += canvas.width / 2 + pipe2.width;
}

function evolve() {
	generation++;
	ais.sort(function (a, b) { return b.score - a.score});
	if (ais[0].score > ais[ais.length - 1].score) {
		var best = ais[0];
		setupAIs();
		for (var i = 0 ; i < ais.length ; i++) {
			ais[i].brain.copy(best.brain);
			ais[i].brain.evolve(0.5 * i / (ais.length - 1));
		}
	} else {
		setupAIs();
	}
}

function allDead() {
	for (var i in ais) if (!ais[i].player.offScreen()) return false;
	return true;
}

function enterFrame() {
	background(153, 217, 234);
	pipe.update();
	pipe.show();
	if (pipe.offScreen()) pipe = new PipePair();
	pipe2.update();
	pipe2.show();
	if (pipe2.offScreen()) pipe2 = new PipePair();
	
	if (pipe.x + pipe.width / 2 == 100 || pipe2.x + pipe2.width / 2 == 100) score++;
	text('Generation: ' + generation, 10, 625, '20px arial', 'black');
	text(score, 180, 50, '50px arial', 'black');
	
	player.update();
	player.show();
	if (pipe.colide(player) || pipe2.colide(player)) player.die();
	
	for (var i in ais) {
		ais[i].update();
		ais[i].show();
		if (pipe.colide(ais[i].player) || pipe2.colide(ais[i].player)) ais[i].player.die();
	}
	if (allDead()) {
		evolve();
		start();
	}
}

function onKey(e) {
	switch (e.key) {
		case ' ': player.flap(); break;
	}
}

init();
setupPlayer();
setupAIs();
start();
