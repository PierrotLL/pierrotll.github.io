class NeuralNetwork {
	
	constructor(inputs, outputs, hiddenLayers, hiddenLayersSize) {
		this.inputs = inputs;
		this.outputs = outputs;
		this.matrices = [];
		
		if (hiddenLayers > 0) {
			this.matrices[0] = new Matrix(inputs, hiddenLayersSize)
			for (var i = 1 ; i < hiddenLayers - 1 ; i++) {
				this.matrices[i] = new Matrix(hiddenLayersSize, hiddenLayersSize);
			}
			this.matrices[hiddenLayers - 1] = new Matrix(hiddenLayersSize, outputs);
		} else {
			this.matrices[0] = new Matrix(inputs, outputs);
		}
	}
	
	sigmoid(x) {
		return 1/(1+Math.exp(-x));
	}
	
	process(input) {
		var m = new Matrix(1, this.inputs)
		m.data = [input];
		for (var i = 0 ; i < this.matrices.length ; i++) {
			m = m.multiply(this.matrices[i]);
		}
		return m.data[0];
	}
	
	copy(network) {
		if (network.inputs == this.inputs && network.outputs == this.outputs && network.matrices.length == this.matrices.length) {
			for (var i = 0 ; i < this.matrices.length ; i++) {
				for (var j = 0 ; j < this.matrices[i].rows ; j++) {
					for (var k = 0 ; k < this.matrices[i].cols ; k++) {
						this.matrices[i].data[j][k] = network.matrices[i].data[j][k];
					}
				}
			}
		}
	}
	
	randomize() {
		for (var i = 0 ; i < this.matrices.length ; i++){
			for (var j = 0 ; j < this.matrices[i].rows ; j++) {
				for (var k = 0 ; k < this.matrices[i].cols ; k++) {
					this.matrices[i].data[j][k] = Math.random() * 2 - 1;
				}
			}
		}
	}
	
	evolve(mutationRate) {
		for (var i = 0 ; i < this.matrices.length ; i++){
			for (var j = 0 ; j < this.matrices[i].rows ; j++) {
				for (var k = 0 ; k < this.matrices[i].cols ; k++) {
					if (Math.random() < mutationRate) {
						this.matrices[i].data[j][k] = Math.random() * 2 - 1;
					}
				}
			}
		}
	}
	
}

class Matrix {
	constructor(rows, cols) {
		this.cols = cols;
		this.rows = rows;
		this.data = [];
		for (var i = 0 ; i < rows ; i++) {
			this.data[i] = [];
			for (var j = 0 ; j < cols ; j++) {
				this.data[i][j] = 0;
			}
		}
	}
	
	identity() {
		for (var i = 0 ; i < this.rows ; i++) {
			for (var j = 0 ; j < this.cols ; j++) {
				this.data[i][j] = i == j ? 1 : 0;
			}
		}
	}
	
	multiply(matrix) {
		var result = new Matrix(this.rows, matrix.cols);
		for (var i = 0 ; i < result.rows ; i++) {
			for (var j = 0 ; j < result.cols ; j++) {
				for (var k = 0 ; k < this.cols ; k++) {
					result.data[i][j] += this.data[i][k] * matrix.data[k][j];
				}
			}
		}
		return result;
	}
	
}