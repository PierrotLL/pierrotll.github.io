class Board {
	constructor(array) {
		this.hex = array[0] === true;
		this.cells = new Uint8Array(array.slice(this.hex ? 1 : 0).flat());
		this.length = this.cells.length;
		this.cols = Array.isArray(array[this.hex?1:0]) ? array[this.hex?1:0].length : Math.sqrt(this.length);
		
		this.allowedMoves = this.hex ? [-2, 2, -2*this.cols-1, -2*this.cols+1, 2*this.cols-1, 2*this.cols+1] : [-2, 2, -2*this.cols, 2*this.cols];
		let cols = this.cols;
		this.allMoves = this.getAllMoves();
		this.allMoves["N"] = this.allMoves.concat().sort((a,b) => a[0]-b[0] || a[1]-b[1]);
		this.allMoves["S"] = this.allMoves["N"].concat().reverse();
		this.allMoves["W"] = this.allMoves.concat().sort((a,b) => a[0]%cols-b[0]%cols || b[0]-a[0] || a[1]%cols-b[1]%cols || b[1]-a[1]);
		this.allMoves["E"] = this.allMoves["W"].concat().reverse();
	}
	clone() {
		const array = [];
		if (this.hex) array.push(true);
		for (let i=0 ; i<this.length ; i+=this.cols) array.push(Array.from(this.cells.slice(i, i+this.cols)));
		return new Board(array);
	}
	
	getAllMoves() {
		const moves = [];
		for (let a=0 ; a<this.length ; a++) {
			if (this.cells[a]>>1==0) {
				for (let k=0, l=this.allowedMoves.length ; k<l ; k++) {
					const c = a + this.allowedMoves[k];
					const b = this.between(a, c);
					if (c>=0 && c<this.length && this.cells[c]>>1==0 && this.cells[b]>>1==0 && (a-a%this.cols - (c-c%this.cols)) % (2*this.cols) == 0) {
						moves.push([a, b, c]);
					}
				}
			}
		}
		return moves;
	}
	
	countPegs() {
		return this.cells.reduce((a,n) => a+(n==1), 0);
	}
	
	between(i, j) {
		let row;
		return (i+j>>1) + (this.hex && (row=i-i%this.cols) != j-j%this.cols && row/this.cols%2);
	}
	
	applyMove(move) {
		this.cells[move[0]] = 0;
		this.cells[move[1]] = 0;
		this.cells[move[2]] = 1;
	}
	undoMove(move) {
		this.cells[move[0]] = 1;
		this.cells[move[1]] = 1;
		this.cells[move[2]] = 0;
	}
	
	hash() {
		let str="", bin=0, m=0;
		for (let i=0 ; i<this.length ; i++) {
			if (++m == 52) { // Number mantissa can store 52 bits
				str += String(bin)+"#";
				bin = m = 0;
			}
			bin=bin*2+(this.cells[i]==1); // do not use bitwise operators, which are limited to 32bits numbers
		}
		return str+String(bin);
	}
	fromHash(h) {
		h = h.split("#");
		for (let i in h) {
			let n = Number(h[i]);
			for (let j = Math.min((i+1)*52, this.length)-1 ; j>=i*52 ; j--) {
				const bit = n%2;
				if (this.cells[j]>>1==0) this.cells[j] = bit;
				n = (n-bit)/2;
			}
		}
		return this;
	}
}

class Game {
	constructor(container, type = 0) {
		this.container = container;
		this.setupEventListeners();
		this.changeGrid(type);
	}
	setupEventListeners() {
		this.container.addEventListener("click", this.onClick.bind(this));
	}
	
	setupGrid() {
		let grid = this.container;
		grid.innerHTML = "";
		this._cells = [];
		for (let i=0, row ; i<this.board.length ; i++) {
			if (i%this.board.cols == 0) row = grid.appendChild(Object.assign(document.createElement("div"), {className: "row"}));
			this._cells.push(row.appendChild(document.createElement("div")).appendChild(document.createElement("div")));
		}
		
		grid.style.setProperty("--cols", this.board.cols);
		grid.style.setProperty("--ratio", this.board.cols/(this.board.length/this.board.cols));
		let atLeastOneCornerOccupied = (
			this.board.cells[0] &
			this.board.cells[this.board.cols-1] &
			this.board.cells[this.board.length-this.board.cols] &
			this.board.cells[this.board.length-1]
			) >> 1 == 0;
		grid.parentNode.classList.toggle("square", this.board.length == this.board.cols*this.board.cols && atLeastOneCornerOccupied);
		grid.classList.remove("hex", "odd", "even", "both");
		if (this.board.hex) {
			let cols=this.board.cols, left=Infinity, right=Infinity;
			for (let i=0 ; i<this.board.length ; i++)
				if (this.board.cells[i]==1)
					Math.floor(i/cols)%2 ? right = Math.min(right, cols-1-i%cols) : left = Math.min(left, i%cols);
			grid.classList.add("hex", left<right?"even" : left>right?"odd" : "both");
		}
	}
	addControls(parent) {
		const undoButton = this._undoButton = parent.appendChild(document.createElement("button"));
		undoButton.className = "control undo";
		undoButton.onclick = this.undoLastMove.bind(this);
		this.setHistory();
		const hintButton = this._hintButton = parent.appendChild(document.createElement("button"));
		hintButton.className = "control hint";
		hintButton.onclick = this.showHint.bind(this);
		this.setHint(null);
		const prevButton = parent.appendChild(document.createElement("button"));
		prevButton.className = "control prev";
		prevButton.onclick = this.prevGrid.bind(this);
		const nextButton = parent.appendChild(document.createElement("button"));
		nextButton.className = "control next";
		nextButton.onclick = this.nextGrid.bind(this);
		return parent;
	}
	
	update() {
		let types = ["hole", "peg"];
		this._cells.forEach((cell, i) => cell.className = types[this.board.cells[i]] || "");
	}
	
	onClick(event) {
		let cell;
		switch (event.target.childElementCount) {
			case 0: cell = this._cells.indexOf(event.target); break;
			case 1: cell = this._cells.indexOf(event.target.firstElementChild); break;
		}
		if (cell >= 0) {
			if (this.selected>=0 &&
					this.board.cells[cell] == 0 &&
					this.board.allowedMoves.includes(cell-this.selected) &&
					this.board.cells[this.board.between(this.selected, cell)] == 1 &&
					(this.selected-this.selected%this.board.cols - (cell-cell%this.board.cols)) % (2*this.board.cols) == 0) {
				const move = [this.selected, this.board.between(this.selected, cell), cell];
				this.board.applyMove(move);
				this.setHistory(this.history.push(move));
				this.update();
				this.verify();
				this.selected = null;
			} else {
				if (this.selected) {
					this._cells[this.selected].classList.remove("selected");
					this.selected = null;
				}
				if (this.board.cells[cell] == 1) {
					this._cells[cell].classList.add("selected");
					this.selected = cell;
					
					let move;
					for (let i=0, l=this.board.allMoves.length ; i<l ; i++)
						if (this.board.allMoves[i][0] == cell && this.board.cells[this.board.allMoves[i][1]]==1 && this.board.cells[this.board.allMoves[i][2]]==0)
							move = move===undefined ? this.board.allMoves[i] : null;
					if (move) {
						this.board.applyMove(move);
						this.setHistory(this.history.push(move));
						this.update();
						this.verify();
						this.selected = null;
					}
				}
			}
		} else if (this.selected) {
			this._cells[this.selected].classList.remove("selected");
			this.selected = null;
		}
	}
	
	setHistory() { this._undoButton ? this._undoButton.disabled = !this.history || this.history.length==0 : null; }
	undoLastMove() {
		if (this.history.length) {
			this.board.undoMove(this.history.pop());
			this.setHistory();
			this.update();
			this.verify();
		}
	}
	
	setHint(move) { this.hint = move; this._hintButton ? this._hintButton.disabled = !this.hint:null; }
	showHint() {
		if (this.hint) {
			const cell = this._cells[this.hint[0]];
			const parent = cell.offsetParent;
			const from = cell.getBoundingClientRect(), to = this._cells[this.hint[2]].getBoundingClientRect(), ref = parent.getBoundingClientRect();
			const x = from.x-ref.x, y = from.y-ref.y, x2 = to.x-ref.x, y2 = to.y-ref.y;
			const peg = parent.appendChild(cell.cloneNode(true));
			peg.className = "peg";
			peg.offsetWidth; // required to trigger animation
			cell.classList.replace("peg", "hole");
			peg.style = "position:absolute; left:"+x+"px; top:"+y+"px; width:"+from.width+"px; height:"+from.height+"px; transition:translate .8s ease-in-out; translate: "+(x2-x)+"px "+(y2-y)+"px;";
			setTimeout(_=>{ cell.classList.replace("hole", "peg"); peg.remove(); }, 800);
		}
	}
	
	prevGrid() { this.changeGrid(this.type-1); }
	nextGrid() { this.changeGrid(this.type+1); }
	changeGrid(type) {
		this.type = type = (type+BOARDS.length)%BOARDS.length;
		this.board = new Board(BOARDS[type]);
		this.setupGrid();
		this.update();
		
		this.setHistory(this.history = []);
		this.selected = null;
		this.setHint(null)
		this._threads && this._threads.forEach(fn=>fn());
		this.solver = new Solver(this.board);
	}
	
	verify() {
		this.setHint(null);
		this._threads && this._threads.forEach(fn=>fn());
		if (this.board.countPegs() == 1) {
		} else {
			const callback = this._solverCallback.bind(this);
			this._threads = [
				this.solver.solve(this.board, "N", callback),
				this.solver.solve(this.board, "S", callback, 5000),
				this.solver.solve(this.board, "E", callback, 2000),
				this.solver.solve(this.board, "W", callback, 2000)
			];
		}
	}
	_solverCallback(response) {
		if (response.reason != "cancel" && response.reason != "timeout") {
			this._threads.forEach(fn=>fn());
			if (response.reason == "solved") {
				this.setHint(response.moves[0]);
			}
			if (response.reason == "unwinnable" && response.seconds < 1) {
				let board = this.container.parentNode;
				board.style = "";
				board.offsetWidth;
				board.style.animation = "wrong ease-in .6s";
			}
		}
	}
}

class Solver {
	constructor(board) {
		this.loseBoards = new Set();
	}
	
	solve(board, orientation, callback, timeout) {
		board = board.clone();
		const pegs = board.countPegs();
		const choices = new Uint8Array(pegs-1);
		const moves = [];
		const path = [];
		let depth = 0;
		const loseBoards = this.loseBoards, allMoves = board.allMoves[orientation];
		function step() {
			if (!moves[depth] && !loseBoards.has(board.hash())) {
				moves[depth] = [];
				for (let i=0, j=0, l=allMoves.length ; i<l ; i++) {
					let move = allMoves[i];
					if (board.cells[move[0]]==1 && board.cells[move[1]]==1 && board.cells[move[2]]==0) {
						moves[depth][j++] = move;
					}
				}
			}
			if (moves[depth] && choices[depth] < moves[depth].length) {
				path[depth] = moves[depth][choices[depth]];
				board.applyMove(path[depth]);
				depth++;
				if (depth == pegs-1) return "solved";
			} else {
				let rewind=true;
				do {
					if (depth == 0) return "unwinnable";
					depth--;
					choices[depth]++;
					rewind = choices[depth] >= moves[depth].length;
					if (!rewind) loseBoards.add(board.hash());
					board.undoMove(path[depth]);
				} while (rewind);
				for (let i=depth+1; i<pegs-1 ; i++) choices[i] = moves[i] = 0;
			}
		}
		let start = performance.now(), stop;
		const state = document.querySelector("#debug").appendChild(document.createElement("div"))
		function loop() {
			state.innerText = choices.toString();
			try {
				for (let i=10000 ; i && !stop ; i--) stop = step();
			} catch (e) {
				console.error(e);
				stop = "error";
			}
			if (stop) {
				const seconds = (performance.now()-start)*.001;
				console.log("solver:", stop, seconds+"s");
				clearInterval(interval);
				state.remove();
				if (callback) callback({reason:stop, seconds:seconds, moves:path});
			}
		}
		function cancel(reason = "cancel") { stop = reason; }
		const interval = setInterval(loop, 0);
		if (timeout) setTimeout(cancel, timeout, "timeout");
		return cancel;
	}
}