function benchmark(functions, iterations = 1, iterationsTotal = 1) {
	let times = {}, i = iterationsTotal, name;
	while(i--) {
		for (name in functions) {
			let j = iterations, fn = functions[name], start = performance.now();
			while(j--) fn();
			times[name] = (times[name]??0)+performance.now()-start;
		}
	}
	for (name in functions) console.log(name+": "+(times[name]/iterationsTotal));
}

function rotateClockwise(array, cols) {
	const result = array.slice(), rows = array.length / cols;
	for (let i=0, l=array.length ; i<l ; i++) {
		const x=i%rows, y=(i-x)/rows;
		result[i] = array[(rows-1-x)*cols + y];
	}
	return result;
}
function rotateAnticlockwise(array, cols) {
	const result = array.slice(), rows = array.length / cols;
	for (let i=0, l=array.length ; i<l ; i++) {
		const x=i%rows, y=(i-x)/rows;
		result[i] = array[x*cols + cols-1-y];
	}
	return result;
}

function precalc() {
	board = new Board(BOARDS[0]);
	let pegs = board.countPegs();
	let choices = Array(pegs-1).fill(0);
	let winPath = Array(pegs-1).fill(false);
	let path = [];
	let moves = [];
	let depth = 0;
	let hashmap = {}, hashmapLength=0;
	looseBoards = {};
	function step() {
	try {
		let goBack=false, h;
		if (!moves[depth] && !(h = hashmap[board.hash()])) moves[depth] = board.possibleMoves();
		if (h==2) winPath.fill(true, 0, depth);
		if (moves[depth] && choices[depth] < moves[depth].length) {
			path[depth] = moves[depth][choices[depth]];
			board.applyMove(path[depth]);
			depth++;
			winPath[depth] = false;
			if (depth == pegs-1) {
				winPath.fill(true);
				do {
				depth--;
				board.undoMove(path[depth]);
				} while (depth > 12);
				goBack = true;
			}
		} else goBack = true;
		if (goBack) {
			let l;
			do {
				if (depth == 0) return "end";
				depth--;
				choices[depth]++;
				l = moves[depth].length;
				if (choices[depth] < l) {
					let h = board.hash();
					hashmap[h] = winPath[depth] ? 2 : true;
					hashmapLength++;
					if (!winPath[depth] && depth < 12) {
						looseBoards[depth] ??= [];
						if (!looseBoards[depth].includes(h)) looseBoards[depth].push(h);
					}
				}
				board.undoMove(path[depth]);
			} while (choices[depth] >= l);
			for (let i=depth+1; i<pegs-1 ; i++) choices[i] = moves[i] = 0;
		}
	} catch(e) { console.log(JSON.stringify(looseBoards)); console.log(JSON.stringify(choices)); throw e; }
	}
	let start = performance.now(), stop;
	function loop() {
		for (let i=100000 ; i && !stop ; i--) stop = step();
		if (stop) {
			console.log("end", (performance.now()-start)*.001+"s");
			console.log(JSON.stringify(looseBoards));
			removeEventListener("keypress", onKeyPress);
		} else setTimeout(arguments.callee, 0);
	}
	function onKeyPress(e) { if(e.key == "c") console.log("current: "+JSON.stringify(choices)); }
	addEventListener("keypress", onKeyPress);
	setTimeout(loop, 0);
}



function solvable(board, callback) {
	let convertPositions = [], holes = 0;
	for (let i=0 ; i<board.length ; i++) convertPositions[i] = board.cells[i]>>1==0 ? holes++ : undefined;
	let allMoves = [];
	for (let i=0 ; i<board.length ; i++) {
		if (board.cells[i]>>1==0) {
			for (let j=0 ; j<board.allowedMoves.length ; j++) {
				let dest = i + board.allowedMoves[j];
				if (convertPositions[dest]!==undefined && (i-i%board.cols - (dest-dest%board.cols)) % (2*board.cols) == 0) {
					allMoves.push([convertPositions[i], convertPositions[i+dest>>1], convertPositions[dest]]);
				}
			}
		}
	}
	let maps = [0];
	for (let i=board.length-1 ; i>=0 ; i--) board.cells[i]>>1==0 ? maps[0]=maps[0]*2+board.cells[i] : null;
	let history = {};
	for (let step=board.countPegs() ; step>1 ; step--) {
		let nextMaps = [], n=0;
		for (let i=0, k=maps.length ; i<k ; i++) {
			for (let j=0, l = allMoves.length ; j<l ; j++) {
				if (maps[i]/2**allMoves[j][0]&1 && maps[i]/2**allMoves[j][1]&1 && (maps[i]/2**allMoves[j][2]&1)==0) {
					let m = maps[i] - 2**allMoves[j][0] - 2**allMoves[j][1] + 2**allMoves[j][2];
					if (!history[m]) {
						nextMaps[n++] = m;
						history[m] = true;
					}
				}
			}
		}
		if (!n) return false;
		maps = nextMaps;
	}
	return true;
}